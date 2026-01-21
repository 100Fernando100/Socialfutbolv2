-- Ops-1 Automation Software - Access Log Schema
-- Version: 1.0
-- Purpose: Audit trail for all operations

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Main access log table
CREATE TABLE IF NOT EXISTS access_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_id VARCHAR(100) NOT NULL,
    task_id VARCHAR(100),
    action_type VARCHAR(50) NOT NULL,  -- 'configuration', 'execution_start', 'execution_complete', 'blocked', 'rule_retrieval'
    namespace_accessed VARCHAR(150),
    records_affected INTEGER,
    status VARCHAR(20) NOT NULL,  -- 'success', 'blocked', 'error'
    block_reason TEXT,
    execution_duration_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,  -- Additional structured data

    CONSTRAINT valid_status CHECK (status IN ('success', 'blocked', 'error')),
    CONSTRAINT valid_action_type CHECK (action_type IN (
        'configuration',
        'execution_start',
        'execution_complete',
        'blocked',
        'rule_retrieval',
        'pii_sanitization',
        'compliance_scan',
        'audit_receipt_generated'
    ))
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_access_log_client_timestamp
    ON access_log (client_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_access_log_status
    ON access_log (status);

CREATE INDEX IF NOT EXISTS idx_access_log_action_type
    ON access_log (action_type);

CREATE INDEX IF NOT EXISTS idx_access_log_timestamp
    ON access_log (timestamp DESC);

-- Partial index for blocked operations (commonly queried for security audits)
CREATE INDEX IF NOT EXISTS idx_access_log_blocked
    ON access_log (client_id, timestamp DESC)
    WHERE status = 'blocked';

-- Comments for documentation
COMMENT ON TABLE access_log IS 'Audit trail for all Ops-1 automation operations';
COMMENT ON COLUMN access_log.action_type IS 'Type of operation performed';
COMMENT ON COLUMN access_log.namespace_accessed IS 'Pinecone namespace that was accessed (CLIENT_ID_RULES)';
COMMENT ON COLUMN access_log.metadata IS 'Additional JSON data specific to the operation type';
