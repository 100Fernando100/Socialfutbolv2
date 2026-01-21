/**
 * Ops-1 Data Retention Policy Configuration
 *
 * This module defines retention policies based on jurisdiction.
 * Use with the data retention workflow to ensure compliance.
 */

const RETENTION_POLICIES = {
  // Canada - Personal Information Protection and Electronic Documents Act
  'CA-PIPEDA': {
    name: 'PIPEDA (Canada)',
    default_retention_days: 365,
    min_retention_days: 180,
    max_retention_days: 730,
    description: 'Canadian federal privacy law for private sector organizations',
    requires: {
      consent_for_collection: true,
      purpose_limitation: true,
      data_minimization: true,
      access_rights: true
    }
  },

  // European Union - General Data Protection Regulation
  'GDPR': {
    name: 'GDPR (EU)',
    default_retention_days: 180,
    min_retention_days: 90,
    max_retention_days: 365,
    description: 'EU regulation on data protection and privacy',
    requires: {
      consent_for_collection: true,
      purpose_limitation: true,
      data_minimization: true,
      access_rights: true,
      right_to_erasure: true,
      data_portability: true,
      dpa_required: true
    }
  },

  // California Consumer Privacy Act
  'US-CCPA': {
    name: 'CCPA (California)',
    default_retention_days: 365,
    min_retention_days: 180,
    max_retention_days: 730,
    description: 'California state privacy law',
    requires: {
      disclosure_requirements: true,
      opt_out_rights: true,
      access_rights: true,
      deletion_rights: true
    }
  },

  // General US (no specific regulation)
  'US-GENERAL': {
    name: 'US General',
    default_retention_days: 365,
    min_retention_days: 90,
    max_retention_days: 1095,
    description: 'Default policy for US clients without specific state regulations',
    requires: {
      reasonable_security: true
    }
  }
};

/**
 * Get retention policy for a jurisdiction
 * @param {string} jurisdiction - Jurisdiction code (e.g., 'CA-PIPEDA', 'GDPR')
 * @returns {Object} - Retention policy configuration
 */
function getRetentionPolicy(jurisdiction) {
  const policy = RETENTION_POLICIES[jurisdiction];

  if (!policy) {
    console.warn(`Unknown jurisdiction: ${jurisdiction}. Using US-GENERAL defaults.`);
    return RETENTION_POLICIES['US-GENERAL'];
  }

  return policy;
}

/**
 * Calculate retention expiry date
 * @param {string} jurisdiction - Jurisdiction code
 * @param {number} customDays - Optional custom retention period
 * @returns {Date} - Expiry date
 */
function calculateRetentionExpiry(jurisdiction, customDays = null) {
  const policy = getRetentionPolicy(jurisdiction);

  let retentionDays = customDays || policy.default_retention_days;

  // Enforce min/max bounds
  retentionDays = Math.max(retentionDays, policy.min_retention_days);
  retentionDays = Math.min(retentionDays, policy.max_retention_days);

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + retentionDays);

  return expiryDate;
}

/**
 * Validate client retention request
 * @param {string} jurisdiction - Jurisdiction code
 * @param {number} requestedDays - Requested retention period
 * @returns {Object} - Validation result
 */
function validateRetentionRequest(jurisdiction, requestedDays) {
  const policy = getRetentionPolicy(jurisdiction);

  if (requestedDays < policy.min_retention_days) {
    return {
      valid: false,
      reason: `Retention period ${requestedDays} days is below minimum (${policy.min_retention_days}) for ${policy.name}`,
      suggested: policy.min_retention_days
    };
  }

  if (requestedDays > policy.max_retention_days) {
    return {
      valid: false,
      reason: `Retention period ${requestedDays} days exceeds maximum (${policy.max_retention_days}) for ${policy.name}`,
      suggested: policy.max_retention_days
    };
  }

  return {
    valid: true,
    days: requestedDays,
    policy: policy.name
  };
}

/**
 * Get compliance requirements for a jurisdiction
 * @param {string} jurisdiction - Jurisdiction code
 * @returns {Object} - Required compliance measures
 */
function getComplianceRequirements(jurisdiction) {
  const policy = getRetentionPolicy(jurisdiction);
  return {
    jurisdiction: jurisdiction,
    policy_name: policy.name,
    requirements: policy.requires,
    description: policy.description
  };
}

// Export for Node.js / n8n
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RETENTION_POLICIES,
    getRetentionPolicy,
    calculateRetentionExpiry,
    validateRetentionRequest,
    getComplianceRequirements
  };
}
