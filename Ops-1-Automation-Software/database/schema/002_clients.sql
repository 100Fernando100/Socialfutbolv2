-- Ops-1 Automation Software - Client Management Schema
-- Version: 1.0
-- Purpose: Client registration and license management

CREATE TABLE IF NOT EXISTS clients (
    client_id VARCHAR(100) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    license_status VARCHAR(20) NOT NULL DEFAULT 'active',
    license_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    license_end_date DATE,
    jurisdiction VARCHAR(20) NOT NULL DEFAULT 'CA-PIPEDA',  -- CA-PIPEDA, GDPR, etc.
    data_retention_days INTEGER NOT NULL DEFAULT 365,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB,

    CONSTRAINT valid_license_status CHECK (license_status IN ('active', 'suspended', 'expired', 'cancelled')),
    CONSTRAINT valid_jurisdiction CHECK (jurisdiction IN ('CA-PIPEDA', 'GDPR', 'US-CCPA', 'US-GENERAL'))
);

-- Client configuration versions
CREATE TABLE IF NOT EXISTS client_configurations (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(100) NOT NULL REFERENCES clients(client_id),
    version VARCHAR(20) NOT NULL,
    configuration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    retention_expiry TIMESTAMPTZ NOT NULL,
    configured_by VARCHAR(100) NOT NULL DEFAULT 'system_onboarding',
    rule_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_review',
    pinecone_namespace VARCHAR(150) NOT NULL,
    metadata JSONB,

    CONSTRAINT valid_config_status CHECK (status IN ('pending_review', 'active', 'superseded', 'expired')),
    CONSTRAINT unique_client_version UNIQUE (client_id, version)
);

-- SQL schema whitelist for client databases
CREATE TABLE IF NOT EXISTS client_schema_whitelist (
    whitelist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(100) NOT NULL REFERENCES clients(client_id),
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255),  -- NULL means all columns in table are allowed
    access_type VARCHAR(20) NOT NULL DEFAULT 'read',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_access_type CHECK (access_type IN ('read')),
    CONSTRAINT unique_whitelist_entry UNIQUE (client_id, table_name, column_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_license_status
    ON clients (license_status);

CREATE INDEX IF NOT EXISTS idx_client_configurations_client
    ON client_configurations (client_id, configuration_date DESC);

CREATE INDEX IF NOT EXISTS idx_client_configurations_expiry
    ON client_configurations (retention_expiry)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_schema_whitelist_client
    ON client_schema_whitelist (client_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE clients IS 'Registered client organizations with license information';
COMMENT ON TABLE client_configurations IS 'Version history of client rule configurations';
COMMENT ON TABLE client_schema_whitelist IS 'Permitted database tables/columns for SQL queries per client';
