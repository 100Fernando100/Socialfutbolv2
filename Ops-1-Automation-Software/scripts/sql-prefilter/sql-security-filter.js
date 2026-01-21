/**
 * Ops-1 SQL Security Pre-Filter
 *
 * This module provides SQL injection prevention and dangerous operation blocking.
 * Use this as a standalone module or integrate into n8n Code nodes.
 *
 * IMPORTANT: This filter should run BEFORE any AI-generated SQL is executed.
 */

const DANGEROUS_PATTERNS = [
  // DDL Operations
  { pattern: /\bDROP\b/i, name: 'DROP', severity: 'critical' },
  { pattern: /\bTRUNCATE\b/i, name: 'TRUNCATE', severity: 'critical' },
  { pattern: /\bALTER\b/i, name: 'ALTER', severity: 'critical' },
  { pattern: /\bCREATE\b/i, name: 'CREATE', severity: 'high' },
  { pattern: /\bREPLACE\b/i, name: 'REPLACE', severity: 'high' },

  // DML Write Operations
  { pattern: /\bDELETE\b/i, name: 'DELETE', severity: 'critical' },
  { pattern: /\bUPDATE\b/i, name: 'UPDATE', severity: 'critical' },
  { pattern: /\bINSERT\b/i, name: 'INSERT', severity: 'high' },

  // Permission Operations
  { pattern: /\bGRANT\b/i, name: 'GRANT', severity: 'critical' },
  { pattern: /\bREVOKE\b/i, name: 'REVOKE', severity: 'critical' },

  // Execution Operations
  { pattern: /\bEXEC\b/i, name: 'EXEC', severity: 'critical' },
  { pattern: /\bEXECUTE\b/i, name: 'EXECUTE', severity: 'critical' },

  // Comment-hidden attacks
  { pattern: /--.*\b(DROP|DELETE|UPDATE|INSERT|TRUNCATE|ALTER)\b/i, name: 'HIDDEN_IN_LINE_COMMENT', severity: 'critical' },
  { pattern: /\/\*[\s\S]*?\b(DROP|DELETE|UPDATE|INSERT|TRUNCATE|ALTER)\b[\s\S]*?\*\//i, name: 'HIDDEN_IN_BLOCK_COMMENT', severity: 'critical' },

  // SQL Injection patterns
  { pattern: /;\s*(DROP|DELETE|UPDATE|INSERT|TRUNCATE)/i, name: 'CHAINED_DANGEROUS_STATEMENT', severity: 'critical' },
  { pattern: /UNION\s+ALL\s+SELECT/i, name: 'UNION_INJECTION', severity: 'high' },
  { pattern: /INTO\s+OUTFILE/i, name: 'FILE_WRITE', severity: 'critical' },
  { pattern: /INTO\s+DUMPFILE/i, name: 'FILE_DUMP', severity: 'critical' },
  { pattern: /LOAD_FILE\s*\(/i, name: 'FILE_READ', severity: 'critical' },

  // System operations
  { pattern: /\bSHUTDOWN\b/i, name: 'SHUTDOWN', severity: 'critical' },
  { pattern: /\bKILL\b/i, name: 'KILL', severity: 'high' },
  { pattern: /xp_cmdshell/i, name: 'XP_CMDSHELL', severity: 'critical' },
  { pattern: /sp_executesql/i, name: 'SP_EXECUTESQL', severity: 'high' }
];

/**
 * Validates SQL query for dangerous patterns
 * @param {string} sql - The SQL query to validate
 * @returns {Object} - Validation result with status and details
 */
function validateSQL(sql) {
  if (!sql || typeof sql !== 'string') {
    return {
      valid: false,
      blocked: true,
      reason: 'Invalid input: SQL must be a non-empty string',
      severity: 'critical'
    };
  }

  const violations = [];

  for (const { pattern, name, severity } of DANGEROUS_PATTERNS) {
    if (pattern.test(sql)) {
      violations.push({
        pattern: name,
        severity: severity,
        match: sql.match(pattern)?.[0] || 'Pattern matched'
      });
    }
  }

  if (violations.length > 0) {
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const highestSeverity = criticalViolations.length > 0 ? 'critical' : 'high';

    return {
      valid: false,
      blocked: true,
      reason: `Prohibited SQL operation(s) detected: ${violations.map(v => v.pattern).join(', ')}`,
      violations: violations,
      severity: highestSeverity
    };
  }

  return {
    valid: true,
    blocked: false,
    reason: null,
    severity: null
  };
}

/**
 * Validates SQL query against a schema whitelist
 * @param {string} sql - The SQL query to validate
 * @param {Array} whitelist - Array of {table, columns} objects
 * @returns {Object} - Validation result
 */
function validateSchemaAccess(sql, whitelist) {
  if (!whitelist || !Array.isArray(whitelist)) {
    return {
      valid: false,
      blocked: true,
      reason: 'Schema whitelist not provided'
    };
  }

  const allowedTables = whitelist.map(w => w.table.toLowerCase());

  // Extract table names from SQL (simplified extraction)
  const fromMatch = sql.match(/FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
  const joinMatch = sql.match(/JOIN\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);

  const tablesUsed = new Set();

  if (fromMatch) {
    fromMatch.forEach(m => {
      const table = m.replace(/FROM\s+/i, '').toLowerCase();
      tablesUsed.add(table);
    });
  }

  if (joinMatch) {
    joinMatch.forEach(m => {
      const table = m.replace(/JOIN\s+/i, '').toLowerCase();
      tablesUsed.add(table);
    });
  }

  const unauthorizedTables = [...tablesUsed].filter(t => !allowedTables.includes(t));

  if (unauthorizedTables.length > 0) {
    return {
      valid: false,
      blocked: true,
      reason: `Unauthorized table access: ${unauthorizedTables.join(', ')}`,
      unauthorizedTables: unauthorizedTables
    };
  }

  return {
    valid: true,
    blocked: false,
    tablesAccessed: [...tablesUsed]
  };
}

/**
 * Full SQL validation combining pattern and schema checks
 * @param {string} sql - The SQL query to validate
 * @param {Array} schemaWhitelist - Optional schema whitelist
 * @returns {Object} - Complete validation result
 */
function fullValidation(sql, schemaWhitelist = null) {
  // First, check for dangerous patterns
  const patternResult = validateSQL(sql);
  if (!patternResult.valid) {
    return {
      ...patternResult,
      checkType: 'pattern'
    };
  }

  // If whitelist provided, check schema access
  if (schemaWhitelist) {
    const schemaResult = validateSchemaAccess(sql, schemaWhitelist);
    if (!schemaResult.valid) {
      return {
        ...schemaResult,
        checkType: 'schema'
      };
    }
  }

  return {
    valid: true,
    blocked: false,
    checkType: 'all_passed'
  };
}

// Export for Node.js / n8n
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateSQL,
    validateSchemaAccess,
    fullValidation,
    DANGEROUS_PATTERNS
  };
}

// For n8n Code node - direct usage example:
/*
const sql = $input.item.json.generated_sql;
const whitelist = $input.item.json.schema_whitelist;

const result = fullValidation(sql, whitelist);

if (result.blocked) {
  throw new Error(`SECURITY_BLOCK: ${result.reason}`);
}

return $input.item;
*/
