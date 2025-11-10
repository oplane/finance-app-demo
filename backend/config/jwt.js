/**
 * JWT Configuration for OPLANE_REQ-00000041
 * Strict JWT validation with proper claims and algorithm enforcement
 */

module.exports = {
  // JWT Secret (use environment variable)
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  
  // Algorithm configuration - ONLY allow HS256 for symmetric signing
  // For production, consider migrating to RS256 (asymmetric)
  algorithms: ['HS256'],
  
  // Issuer - identifies who issued the token
  issuer: process.env.JWT_ISSUER || 'finance-app',
  
  // Audience - identifies who the token is intended for
  audience: process.env.JWT_AUDIENCE || 'finance-app-api',
  
  // Token expiration times
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m', // Short-lived access tokens
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d', // Longer refresh tokens
  
  // Scope definitions for authorization
  scopes: {
    READ_ACCOUNTS: 'read:accounts',
    WRITE_ACCOUNTS: 'write:accounts',
    READ_TRANSACTIONS: 'read:transactions',
    WRITE_TRANSFERS: 'write:transfers',
    ADMIN: 'admin:all',
  },
  
  // Default scopes for regular users
  defaultUserScopes: [
    'read:accounts',
    'read:transactions',
    'write:transfers',
  ],
  
  // Clock tolerance for token validation (in seconds)
  clockTolerance: 30,
  
  // Validation settings
  validation: {
    // Require specific claims to be present
    requiredClaims: ['exp', 'iat', 'iss', 'aud', 'sub', 'userId'],
    
    // Validate token structure before verification
    validateStructure: true,
    
    // Check token against revocation list
    checkRevocation: true,
  },
};


