-- Ops-1 Automation Software - Audit Receipts Schema
-- Version: 1.0
-- Purpose: Store complete audit receipts for compliance

CREATE TABLE IF NOT EXISTS audit_receipts (
    receipt_id VARCHAR(50) PRIMARY KEY,  -- Format: AUD-YYYY-MM-DD-XXXXXX
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_id VARCHAR(100) NOT NULL REFERENCES clients(client_id),
    task_id VARCHAR(100) NOT NULL,

    -- Execution details
    mode VARCHAR(20) NOT NULL,  -- 'excel' or 'sql'
    task_description TEXT NOT NULL,
    execution_duration_ms INTEGER,
    execution_status VARCHAR(20) NOT NULL,

    -- Compliance details
    rules_retrieved INTEGER NOT NULL DEFAULT 0,
    rules_applied JSONB NOT NULL,  -- Array of applied rules with evidence

    -- Security audit
    pii_scan_result VARCHAR(20) NOT NULL,
    sql_safety_result VARCHAR(20),  -- NULL if not SQL mode
    code_safety_result VARCHAR(20),  -- NULL if not Excel mode
    compliance_status VARCHAR(20) NOT NULL,

    -- Full receipt JSON for complete audit trail
    full_receipt JSONB NOT NULL,

    -- Result summary (not the actual data, just metadata)
    result_type VARCHAR(50),
    result_row_count INTEGER,

    CONSTRAINT valid_mode CHECK (mode IN ('excel', 'sql')),
    CONSTRAINT valid_execution_status CHECK (execution_status IN ('completed', 'failed', 'blocked')),
    CONSTRAINT valid_scan_results CHECK (
        pii_scan_result IN ('PASS', 'FAIL', 'N/A') AND
        (sql_safety_result IS NULL OR sql_safety_result IN ('PASS', 'FAIL', 'N/A')) AND
        (code_safety_result IS NULL OR code_safety_result IN ('PASS', 'FAIL', 'N/A'))
    ),
    CONSTRAINT valid_compliance_status CHECK (compliance_status IN ('APPROVED', 'BLOCKED'))
);

-- Security events table for blocked operations
CREATE TABLE IF NOT EXISTS security_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_id VARCHAR(100) NOT NULL REFERENCES clients(client_id),
    task_id VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT,
    ip_address INET,
    user_agent TEXT,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(100),
    resolution_notes TEXT,

    CONSTRAINT valid_event_type CHECK (event_type IN (
        'pii_detected',
        'sql_injection_attempt',
        'unauthorized_table_access',
        'dangerous_code_detected',
        'rule_violation',
        'authentication_failure',
        'rate_limit_exceeded'
    )),
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_receipts_client
    ON audit_receipts (client_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_receipts_task
    ON audit_receipts (task_id);

CREATE INDEX IF NOT EXISTS idx_audit_receipts_compliance
    ON audit_receipts (compliance_status, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_client
    ON security_events (client_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_unresolved
    ON security_events (timestamp DESC)
    WHERE resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_security_events_severity
    ON security_events (severity, timestamp DESC);

-- Comments
COMMENT ON TABLE audit_receipts IS 'Complete audit receipts for all processed tasks';
COMMENT ON TABLE security_events IS 'Security incidents and blocked operations requiring review';
