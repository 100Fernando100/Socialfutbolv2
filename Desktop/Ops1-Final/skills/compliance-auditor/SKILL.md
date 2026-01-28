# Compliance Auditor Skill

## Overview

This skill implements an **AI Compliance Auditor** that validates all Ops-1 actions against company policies, regulatory requirements, and internal controls. The auditor acts as a second layer of verification before any query executes.

Based on:
- IIA Global Internal Audit Standards
- ACCA Internal Audit Competency Framework
- SOX compliance requirements
- PIPEDA/CCPA data protection standards

---

## Purpose

The Compliance Auditor ensures:
1. **Policy Adherence** - All queries follow company-defined rules
2. **Data Protection** - PII and sensitive data are handled properly
3. **Access Control** - Users only access data they're authorized to see
4. **Audit Trail** - Every action is logged with full context
5. **Risk Detection** - Flag potentially risky or unusual queries

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER QUERY                                │
│         "Show all employee salaries for 2025"               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              COMPLIANCE AUDITOR (First Pass)                 │
│                                                              │
│  ✓ Check user permissions                                    │
│  ✓ Validate against company policies                         │
│  ✓ Scan for PII/sensitive data requests                      │
│  ✓ Check for dangerous operations                            │
│  ✓ Verify data scope is authorized                           │
│                                                              │
│  Decision: APPROVED / BLOCKED / REQUIRES_APPROVAL            │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
     APPROVED         BLOCKED      REQUIRES_APPROVAL
          │               │               │
          │               │               ▼
          │               │       ┌───────────────┐
          │               │       │ Notify Manager│
          │               │       │ for approval  │
          │               │       └───────────────┘
          │               │
          ▼               ▼
┌─────────────────┐  ┌─────────────────┐
│ Execute Query   │  │ Return Error    │
│ + Generate      │  │ + Log Attempt   │
│   Audit Receipt │  │ + Alert Admin   │
└─────────────────┘  └─────────────────┘
```

---

## Company Policy Configuration

### Policy File Structure

Create a `company_policies.yaml` file that the auditor uses:

```yaml
# company_policies.yaml
# Ops-1 Compliance Auditor Configuration

company:
  name: "Your Company Name"
  industry: "Financial Services"  # Affects default rules
  jurisdiction: 
    - "Canada"
    - "USA"

# User Roles and Permissions
roles:
  admin:
    description: "Full access to all data and operations"
    permissions:
      - "read:all"
      - "write:all"
      - "delete:all"
      - "export:all"
    data_scope: "all"
    
  manager:
    description: "Department-level access"
    permissions:
      - "read:department"
      - "write:department"
      - "export:reports"
    data_scope: "department"
    sensitive_data: false
    
  analyst:
    description: "Read-only access to assigned data"
    permissions:
      - "read:assigned"
      - "export:reports"
    data_scope: "assigned"
    sensitive_data: false
    
  bookkeeper:
    description: "Accounting data access"
    permissions:
      - "read:financial"
      - "write:transactions"
      - "export:financial_reports"
    data_scope: "financial"
    sensitive_data: false

# Data Classification
data_classification:
  public:
    description: "Non-sensitive business data"
    requires_approval: false
    log_access: true
    
  internal:
    description: "Internal business data"
    requires_approval: false
    log_access: true
    allowed_roles: ["admin", "manager", "analyst", "bookkeeper"]
    
  confidential:
    description: "Sensitive business data"
    requires_approval: true
    log_access: true
    allowed_roles: ["admin", "manager"]
    examples:
      - "salary"
      - "compensation"
      - "performance_review"
      - "disciplinary"
      
  restricted:
    description: "Highly sensitive data"
    requires_approval: true
    requires_justification: true
    log_access: true
    alert_on_access: true
    allowed_roles: ["admin"]
    examples:
      - "ssn"
      - "sin"
      - "social_security"
      - "bank_account"
      - "credit_card"
      - "password"
      - "medical"
      - "health"

# Blocked Operations
blocked_operations:
  sql:
    - "DROP"
    - "DELETE"
    - "TRUNCATE"
    - "ALTER"
    - "CREATE"
    - "INSERT"
    - "UPDATE"
  
  patterns:
    - "SELECT * FROM users"  # Too broad
    - "password"
    - "credit_card"
    - "ssn"
    
  file_operations:
    - "rm -rf"
    - "format"
    - "delete all"

# Query Limits
query_limits:
  max_rows: 10000
  max_date_range_days: 365
  require_date_filter: true
  require_specific_columns: true  # Block SELECT *

# Sensitive Data Handling
pii_fields:
  must_mask:
    - "ssn"
    - "sin"
    - "social_security_number"
    - "credit_card"
    - "bank_account"
    - "routing_number"
  
  must_anonymize:
    - "email"
    - "phone"
    - "address"
    - "date_of_birth"
    
  requires_justification:
    - "salary"
    - "compensation"
    - "bonus"
    - "commission"

# Audit Requirements
audit_settings:
  log_all_queries: true
  log_failed_attempts: true
  retention_days: 2555  # 7 years
  alert_on_blocked: true
  alert_email: "compliance@yourcompany.com"
  
  require_audit_receipt: true
  receipt_includes:
    - "timestamp"
    - "user_id"
    - "query_text"
    - "data_accessed"
    - "row_count"
    - "ip_address"
    - "approval_status"

# Working Hours (Optional)
access_schedule:
  enabled: false
  allowed_hours:
    start: "06:00"
    end: "22:00"
  timezone: "America/Toronto"
  alert_outside_hours: true

# Regulatory Compliance
compliance_frameworks:
  pipeda:
    enabled: true
    requires_consent_log: true
    data_minimization: true
    
  ccpa:
    enabled: true
    honor_deletion_requests: true
    
  sox:
    enabled: false
    segregation_of_duties: true
    
  gdpr:
    enabled: false
    right_to_be_forgotten: true
```

---

## Auditor Implementation

### Main Auditor Class

```python
# compliance_auditor.py

import yaml
import re
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from enum import Enum
import logging

class AuditDecision(Enum):
    APPROVED = "approved"
    BLOCKED = "blocked"
    REQUIRES_APPROVAL = "requires_approval"
    REQUIRES_JUSTIFICATION = "requires_justification"

class ComplianceAuditor:
    """
    AI Compliance Auditor that validates all queries against company policies.
    Based on IIA Global Internal Audit Standards.
    """
    
    def __init__(self, policy_file: str = "company_policies.yaml"):
        with open(policy_file, 'r') as f:
            self.policies = yaml.safe_load(f)
        
        self.logger = logging.getLogger("ComplianceAuditor")
        self._load_patterns()
    
    def _load_patterns(self):
        """Compile regex patterns for efficiency"""
        self.blocked_sql = self.policies.get('blocked_operations', {}).get('sql', [])
        self.blocked_patterns = self.policies.get('blocked_operations', {}).get('patterns', [])
        self.pii_fields = self.policies.get('pii_fields', {})
        
    def audit_query(
        self, 
        query: str, 
        user_id: str, 
        user_role: str,
        context: Optional[Dict] = None
    ) -> Tuple[AuditDecision, Dict]:
        """
        Main entry point for auditing a query.
        
        Returns:
            Tuple of (decision, details)
        """
        audit_log = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "user_role": user_role,
            "query": query,
            "checks_performed": [],
            "violations": [],
            "warnings": []
        }
        
        # Run all checks
        checks = [
            self._check_user_permissions,
            self._check_blocked_operations,
            self._check_pii_access,
            self._check_data_scope,
            self._check_query_limits,
            self._check_sensitive_keywords,
            self._check_access_schedule,
        ]
        
        decision = AuditDecision.APPROVED
        
        for check in checks:
            check_result = check(query, user_id, user_role, context)
            audit_log["checks_performed"].append(check_result["check_name"])
            
            if check_result["status"] == "blocked":
                decision = AuditDecision.BLOCKED
                audit_log["violations"].append(check_result)
                break  # Stop on first blocking violation
                
            elif check_result["status"] == "requires_approval":
                if decision != AuditDecision.BLOCKED:
                    decision = AuditDecision.REQUIRES_APPROVAL
                audit_log["warnings"].append(check_result)
                
            elif check_result["status"] == "warning":
                audit_log["warnings"].append(check_result)
        
        # Generate audit receipt
        audit_log["decision"] = decision.value
        audit_log["receipt_id"] = self._generate_receipt_id(audit_log)
        
        # Log the audit
        self._log_audit(audit_log)
        
        # Alert if blocked
        if decision == AuditDecision.BLOCKED:
            self._send_alert(audit_log)
        
        return decision, audit_log
    
    def _check_user_permissions(
        self, query: str, user_id: str, user_role: str, context: Dict
    ) -> Dict:
        """Verify user has permission for this type of query"""
        
        roles = self.policies.get('roles', {})
        user_permissions = roles.get(user_role, {}).get('permissions', [])
        
        # Determine required permission based on query
        required_permission = self._determine_required_permission(query)
        
        has_permission = any(
            self._permission_matches(required_permission, p) 
            for p in user_permissions
        )
        
        return {
            "check_name": "user_permissions",
            "status": "passed" if has_permission else "blocked",
            "message": f"User role '{user_role}' {'has' if has_permission else 'lacks'} required permission '{required_permission}'",
            "required_permission": required_permission,
            "user_permissions": user_permissions
        }
    
    def _check_blocked_operations(
        self, query: str, user_id: str, user_role: str, context: Dict
    ) -> Dict:
        """Check for explicitly blocked operations"""
        
        query_upper = query.upper()
        
        # Check blocked SQL commands
        for cmd in self.blocked_sql:
            if cmd.upper() in query_upper:
                return {
                    "check_name": "blocked_operations",
                    "status": "blocked",
                    "message": f"Query contains blocked operation: {cmd}",
                    "blocked_command": cmd
                }
        
        # Check blocked patterns
        query_lower = query.lower()
        for pattern in self.blocked_patterns:
            if pattern.lower() in query_lower:
                return {
                    "check_name": "blocked_operations",
                    "status": "blocked",
                    "message": f"Query matches blocked pattern: {pattern}",
                    "blocked_pattern": pattern
                }
        
        return {
            "check_name": "blocked_operations",
            "status": "passed",
            "message": "No blocked operations detected"
        }
    
    def _check_pii_access(
        self, query: str, user_id: str, user_role: str, context: Dict
    ) -> Dict:
        """Check for PII/sensitive data access"""
        
        query_lower = query.lower()
        detected_pii = []
        
        # Check must_mask fields
        for field in self.pii_fields.get('must_mask', []):
            if field.lower() in query_lower:
                detected_pii.append({
                    "field": field,
                    "action": "must_mask",
                    "severity": "critical"
                })
        
        # Check requires_justification fields
        for field in self.pii_fields.get('requires_justification', []):
            if field.lower() in query_lower:
                detected_pii.append({
                    "field": field,
                    "action": "requires_justification",
                    "severity": "high"
                })
        
        if detected_pii:
            critical_pii = [p for p in detected_pii if p["severity"] == "critical"]
            
            if critical_pii:
                return {
                    "check_name": "pii_access",
                    "status": "blocked",
                    "message": f"Query requests restricted PII fields: {[p['field'] for p in critical_pii]}",
                    "detected_pii": detected_pii
                }
            else:
                return {
                    "check_name": "pii_access",
                    "status": "requires_approval",
                    "message": f"Query requests sensitive fields requiring justification",
                    "detected_pii": detected_pii
                }
        
        return {
            "check_name": "pii_access",
            "status": "passed",
            "message": "No PII detected in query"
        }
    
    def _check_data_scope(
        self, query: str, user_id: str, user_role: str, context: Dict
    ) -> Dict:
        """Verify user is accessing data within their authorized scope"""
        
        roles = self.policies.get('roles', {})
        user_scope = roles.get(user_role, {}).get('data_scope', 'none')
        
        # Check if query scope matches user scope
        if user_scope == "all":
            return {
                "check_name": "data_scope",
                "status": "passed",
                "message": "User has access to all data"
            }
        
        # For department/assigned scope, would need context about the data
        # This is a simplified check
        if "all" in query.lower() and user_scope != "all":
            return {
                "check_name": "data_scope",
                "status": "requires_approval",
                "message": f"Query may access data outside user's scope ({user_scope})",
                "user_scope": user_scope
            }
        
        return {
            "check_name": "data_scope",
            "status": "passed",
            "message": f"Query appears within user's data scope ({user_scope})"
        }
    
    def _check_query_limits(
        self, query: str, user_id: str, user_role: str, context: Dict
    ) -> Dict:
        """Check query against defined limits"""
        
        limits = self.policies.get('query_limits', {})
        warnings = []
        
        # Check for SELECT *
        if limits.get('require_specific_columns', False):
            if re.search(r'SELECT\s+\*', query, re.IGNORECASE):
                warnings.append("Query uses SELECT * - consider specifying columns")
        
        # Check for date filter requirement
        if limits.get('require_date_filter', False):
            date_patterns = ['date', 'created', 'updated', 'timestamp', 'when']
            has_date_filter = any(p in query.lower() for p in date_patterns)
            if not has_date_filter:
                warnings.append("Query may not have date filter - could return excessive data")
        
        if warnings:
            return {
                "check_name": "query_limits",
                "status": "warning",
                "message": "; ".join(warnings),
                "warnings": warnings
            }
        
        return {
            "check_name": "query_limits",
            "status": "passed",
            "message": "Query within defined limits"
        }
    
    def _check_sensitive_keywords(
        self, query: str, user_id: str, user_role: str, context: Dict
    ) -> Dict:
        """Check for sensitive business keywords"""
        
        sensitive_keywords = [
            'salary', 'compensation', 'bonus', 'termination', 
            'lawsuit', 'legal', 'confidential', 'secret',
            'acquisition', 'merger', 'layoff'
        ]
        
        query_lower = query.lower()
        found = [kw for kw in sensitive_keywords if kw in query_lower]
        
        if found:
            return {
                "check_name": "sensitive_keywords",
                "status": "requires_approval",
                "message": f"Query contains sensitive keywords: {found}",
                "keywords_found": found
            }
        
        return {
            "check_name": "sensitive_keywords",
            "status": "passed",
            "message": "No sensitive keywords detected"
        }
    
    def _check_access_schedule(
        self, query: str, user_id: str, user_role: str, context: Dict
    ) -> Dict:
        """Check if access is within allowed hours"""
        
        schedule = self.policies.get('access_schedule', {})
        
        if not schedule.get('enabled', False):
            return {
                "check_name": "access_schedule",
                "status": "passed",
                "message": "Access schedule not enforced"
            }
        
        # Get current time in configured timezone
        from pytz import timezone
        tz = timezone(schedule.get('timezone', 'UTC'))
        now = datetime.now(tz)
        current_time = now.strftime("%H:%M")
        
        allowed_start = schedule.get('allowed_hours', {}).get('start', '00:00')
        allowed_end = schedule.get('allowed_hours', {}).get('end', '23:59')
        
        if not (allowed_start <= current_time <= allowed_end):
            if schedule.get('alert_outside_hours', False):
                return {
                    "check_name": "access_schedule",
                    "status": "warning",
                    "message": f"Access outside normal hours ({current_time}). Query allowed but logged.",
                    "current_time": current_time,
                    "allowed_hours": f"{allowed_start} - {allowed_end}"
                }
        
        return {
            "check_name": "access_schedule",
            "status": "passed",
            "message": "Access within allowed schedule"
        }
    
    def _determine_required_permission(self, query: str) -> str:
        """Determine what permission is needed for this query"""
        
        query_upper = query.upper()
        
        if any(cmd in query_upper for cmd in ['INSERT', 'UPDATE', 'CREATE']):
            return "write"
        elif any(cmd in query_upper for cmd in ['DELETE', 'DROP', 'TRUNCATE']):
            return "delete"
        elif 'EXPORT' in query_upper or 'DOWNLOAD' in query_upper:
            return "export"
        else:
            return "read"
    
    def _permission_matches(self, required: str, user_perm: str) -> bool:
        """Check if user permission satisfies requirement"""
        
        if user_perm.endswith(":all"):
            return True
        
        perm_type = user_perm.split(":")[0] if ":" in user_perm else user_perm
        return perm_type == required or perm_type == "all"
    
    def _generate_receipt_id(self, audit_log: Dict) -> str:
        """Generate unique audit receipt ID"""
        
        data = f"{audit_log['timestamp']}{audit_log['user_id']}{audit_log['query']}"
        hash_val = hashlib.sha256(data.encode()).hexdigest()[:12].upper()
        date_str = datetime.utcnow().strftime("%Y%m%d")
        
        return f"AR-{date_str}-{hash_val}"
    
    def _log_audit(self, audit_log: Dict):
        """Log audit to persistent storage"""
        
        # In production, this would write to database
        self.logger.info(f"AUDIT: {audit_log['receipt_id']} - {audit_log['decision']} - User: {audit_log['user_id']}")
        
        # Also write to audit table
        # db.audit_logs.insert(audit_log)
    
    def _send_alert(self, audit_log: Dict):
        """Send alert for blocked queries"""
        
        alert_email = self.policies.get('audit_settings', {}).get('alert_email')
        
        if alert_email:
            self.logger.warning(
                f"ALERT: Blocked query attempt\n"
                f"User: {audit_log['user_id']}\n"
                f"Query: {audit_log['query']}\n"
                f"Reason: {audit_log['violations']}"
            )
            # In production: send_email(alert_email, subject, body)


# Convenience function for n8n
def audit_query(query: str, user_id: str, user_role: str) -> Dict:
    """
    Simple function to call from n8n workflow.
    
    Returns dict with:
    - approved: bool
    - decision: str (approved/blocked/requires_approval)
    - receipt_id: str
    - message: str
    - violations: list
    """
    
    auditor = ComplianceAuditor()
    decision, details = auditor.audit_query(query, user_id, user_role)
    
    return {
        "approved": decision == AuditDecision.APPROVED,
        "decision": decision.value,
        "receipt_id": details.get("receipt_id"),
        "message": details.get("violations", [{}])[0].get("message", "Query approved"),
        "violations": details.get("violations", []),
        "warnings": details.get("warnings", [])
    }
```

---

## n8n Workflow Integration

### Auditor Node Configuration

```json
{
  "name": "Compliance Auditor",
  "type": "n8n-nodes-base.code",
  "position": [450, 300],
  "parameters": {
    "jsCode": "// Compliance Auditor Check\nconst query = $input.first().json.generated_sql;\nconst userId = $input.first().json.user_id;\nconst userRole = $input.first().json.user_role;\n\n// Policy checks\nconst blockedCommands = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'INSERT', 'UPDATE'];\nconst piiFields = ['ssn', 'sin', 'credit_card', 'bank_account', 'password'];\nconst sensitiveFields = ['salary', 'compensation', 'bonus'];\n\nlet decision = 'APPROVED';\nlet violations = [];\nlet warnings = [];\n\n// Check blocked commands\nfor (const cmd of blockedCommands) {\n  if (query.toUpperCase().includes(cmd)) {\n    decision = 'BLOCKED';\n    violations.push(`Contains blocked command: ${cmd}`);\n  }\n}\n\n// Check PII\nfor (const field of piiFields) {\n  if (query.toLowerCase().includes(field)) {\n    decision = 'BLOCKED';\n    violations.push(`Requests restricted PII: ${field}`);\n  }\n}\n\n// Check sensitive (warning only)\nfor (const field of sensitiveFields) {\n  if (query.toLowerCase().includes(field)) {\n    if (decision !== 'BLOCKED') {\n      decision = 'REQUIRES_APPROVAL';\n    }\n    warnings.push(`Contains sensitive field: ${field}`);\n  }\n}\n\n// Generate receipt\nconst receiptId = `AR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substr(2,8).toUpperCase()}`;\n\nreturn {\n  json: {\n    approved: decision === 'APPROVED',\n    decision,\n    receipt_id: receiptId,\n    violations,\n    warnings,\n    query,\n    user_id: userId,\n    timestamp: new Date().toISOString()\n  }\n};"
  }
}
```

---

## Skills Required for Human Auditor

Based on IIA standards and industry best practices, here are the skills your human compliance auditor should have:

### Core Competencies

| Skill | Description | Why It Matters |
|-------|-------------|----------------|
| **Analytical Thinking** | Ability to examine data, identify patterns and anomalies | Core skills include analytical thinking, problem-solving, attention to detail |
| **Data Analytics** | Knowledge of SQL or other database tools helps improve audit efficiency | Reviewing Ops-1 queries effectively |
| **Communication** | Communication skills including oral communication, report writing, and presentation | Explaining findings to management |
| **Regulatory Knowledge** | Understanding of the regulatory environment, accounting standards, laws | PIPEDA, CCPA, SOX compliance |
| **Ethics & Integrity** | Strong ethical judgment and integrity remain at the core of the auditing profession | Making principled decisions |
| **Risk Assessment** | Knowledge in enterprise risk management, risk analysis and control assessment | Evaluating query risks |

### Certifications to Look For

| Certification | Organization | Focus |
|---------------|--------------|-------|
| **CIA** | Institute of Internal Auditors | Internal audit standards |
| **CPA** | AICPA/CPA Canada | Accounting & financial controls |
| **CFE** | ACFE | Fraud examination |
| **CISA** | ISACA | Information systems auditing |

### Job Description Template

```
COMPLIANCE AUDITOR - Ops-1 Platform

Responsibilities:
- Review and approve queries flagged by automated compliance system
- Maintain and update company policy configuration
- Investigate blocked query attempts
- Generate compliance reports for management
- Train users on proper data access procedures
- Conduct periodic access reviews

Requirements:
- Bachelor's degree in Accounting, Finance, or related field
- 2+ years experience in internal audit or compliance
- Knowledge of SQL and data analysis
- Familiarity with PIPEDA, CCPA, or similar regulations
- CIA, CPA, or CFE certification preferred
- Experience with QuickBooks/Sage a plus

Skills:
- Strong analytical and critical thinking
- Excellent written and verbal communication
- Attention to detail
- Ability to work independently
- Knowledge of internal controls
```

---

## Escalation Workflow

```
Query Flagged as REQUIRES_APPROVAL
              │
              ▼
    ┌─────────────────┐
    │ Notify Auditor  │
    │ via Email/Slack │
    └────────┬────────┘
              │
              ▼
    ┌─────────────────┐
    │ Auditor Reviews │
    │ - Query intent  │
    │ - User history  │
    │ - Business need │
    └────────┬────────┘
              │
     ┌────────┴────────┐
     │                 │
     ▼                 ▼
  APPROVE           DENY
     │                 │
     ▼                 ▼
  Execute        Notify User
  + Log          + Log Reason
```

---

## Audit Report Template

```markdown
# Ops-1 Compliance Audit Report

**Period:** January 1-31, 2025
**Generated:** February 1, 2025
**Auditor:** [Name]

## Summary

| Metric | Count |
|--------|-------|
| Total Queries | 1,247 |
| Approved | 1,198 (96.1%) |
| Blocked | 23 (1.8%) |
| Required Approval | 26 (2.1%) |

## Blocked Queries

| Date | User | Reason |
|------|------|--------|
| Jan 5 | user123 | Requested SSN field |
| Jan 12 | user456 | DELETE command detected |
| ... | ... | ... |

## Sensitive Data Access

| User | Field | Approved By | Justification |
|------|-------|-------------|---------------|
| user789 | salary | manager1 | Annual review prep |
| ... | ... | ... | ... |

## Recommendations

1. User user123 has 3 blocked attempts - recommend additional training
2. Consider adding "contractor_rate" to sensitive fields list
3. Update policy to require date filters on all financial queries

## Sign-off

Reviewed by: _________________ Date: _________
```

---

## References

- IIA Global Internal Audit Standards: https://www.theiia.org/standards
- ACCA Competency Framework: https://www.accaglobal.com
- AICPA Audit Standards: https://www.aicpa.org
- PIPEDA Guidelines: https://www.priv.gc.ca
