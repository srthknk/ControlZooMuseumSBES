/**
 * Application Constants
 */

const MAINTENANCE_STATUS = {
  ACTIVE: 'active',
  DUE: 'due',
  SUSPENDED: 'suspended',
};

const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
};

const JWT_EXPIRY = '500d'; // 500 days

const ROLES = {
  SUPER_ADMIN: 'super_admin',
};

const API_BASE = '/api/super-admin';

module.exports = {
  MAINTENANCE_STATUS,
  SUBSCRIPTION_PLANS,
  JWT_EXPIRY,
  ROLES,
  API_BASE,
};
