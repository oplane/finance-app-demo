/**
 * JWT Authentication Middleware
 * Implementation of OPLANE_REQ-00000041: JWT Token Signature and Claims Validation
 * 
 * Security Features:
 * - Strict algorithm enforcement (prevents 'none' algorithm attack)
 * - Issuer and audience validation
 * - Required claims validation
 * - Token structure validation
 * - Token revocation checking
 * - Scope-based authorization
 */

const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

// In-memory token revocation store
// For production, use Redis or a database
const revokedTokens = new Set();

/**
 * Validate JWT token structure before verification
 * Prevents malformed tokens from reaching jwt.verify()
 */
function validateTokenStructure(token) {
  // JWT should have exactly 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed JWT: Invalid segment count' };
  }

  // Each part should be valid base64url
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
  for (let i = 0; i < 3; i++) {
    if (!base64UrlRegex.test(parts[i])) {
      return { valid: false, error: 'Malformed JWT: Invalid base64url encoding' };
    }
  }

  return { valid: true };
}

/**
 * Validate required claims are present in token payload
 */
function validateRequiredClaims(payload) {
  const missing = [];
  
  for (const claim of config.validation.requiredClaims) {
    if (!(claim in payload)) {
      missing.push(claim);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required claims: ${missing.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Check if token has been revoked
 */
function isTokenRevoked(token) {
  return revokedTokens.has(token);
}

/**
 * Main authentication middleware
 * Validates JWT tokens with strict security checks
 * 
 * @param {Array<string>} requiredScopes - Optional array of scopes required for access
 */
function authenticateToken(requiredScopes = []) {
  return async function (req, res, next) {
    try {
      // 1. Extract Authorization header
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Access token required',
          details: 'Missing or invalid Authorization header'
        });
      }

      const token = authHeader.split(' ')[1];

      // 2. Validate token structure
      if (config.validation.validateStructure) {
        const structureCheck = validateTokenStructure(token);
        if (!structureCheck.valid) {
          return res.status(401).json({ 
            error: 'Invalid token',
            details: structureCheck.error
          });
        }
      }

      // 3. Check token revocation
      if (config.validation.checkRevocation && isTokenRevoked(token)) {
        return res.status(401).json({ 
          error: 'Token has been revoked',
          details: 'This token is no longer valid'
        });
      }

      // 4. Verify token signature and standard claims
      let payload;
      try {
        payload = jwt.verify(token, config.secret, {
          algorithms: config.algorithms, // Only allow specified algorithms
          issuer: config.issuer,         // Validate issuer
          audience: config.audience,     // Validate audience
          clockTolerance: config.clockTolerance,
        });
      } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Token expired',
            details: 'Please log in again'
          });
        }
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ 
            error: 'Invalid token',
            details: 'Token signature or claims are invalid'
          });
        }
        if (err.name === 'NotBeforeError') {
          return res.status(401).json({ 
            error: 'Token not yet valid',
            details: 'Token cannot be used yet'
          });
        }
        // Generic error (don't leak details)
        console.error('JWT verification error:', err.message);
        return res.status(401).json({ 
          error: 'Authentication failed'
        });
      }

      // 5. Validate required claims
      const claimsCheck = validateRequiredClaims(payload);
      if (!claimsCheck.valid) {
        return res.status(401).json({ 
          error: 'Invalid token',
          details: claimsCheck.error
        });
      }

      // 6. Validate scopes if required
      if (requiredScopes.length > 0) {
        const tokenScopes = payload.scope ? payload.scope.split(' ') : [];
        const missingScopes = requiredScopes.filter(
          scope => !tokenScopes.includes(scope)
        );

        if (missingScopes.length > 0) {
          return res.status(403).json({ 
            error: 'Insufficient permissions',
            details: `Missing required scopes: ${missingScopes.join(', ')}`
          });
        }
      }

      // 7. Attach validated user info to request
      req.user = payload;
      req.token = token; // Store token for potential revocation
      next();

    } catch (error) {
      // Catch any unexpected errors
      console.error('Authentication error:', error);
      return res.status(500).json({ 
        error: 'Internal server error'
      });
    }
  };
}

/**
 * Revoke a token (for logout)
 */
function revokeToken(token) {
  revokedTokens.add(token);
  
  // Optional: Clean up expired tokens periodically
  // In production, use Redis with TTL
  setTimeout(() => {
    revokedTokens.delete(token);
  }, 24 * 60 * 60 * 1000); // Remove after 24 hours
}

/**
 * Clear all revoked tokens (for testing)
 */
function clearRevokedTokens() {
  revokedTokens.clear();
}

/**
 * Get count of revoked tokens (for monitoring)
 */
function getRevokedTokenCount() {
  return revokedTokens.size;
}

// Export for backward compatibility
const JWT_SECRET = config.secret;

module.exports = { 
  authenticateToken, 
  JWT_SECRET,
  revokeToken,
  clearRevokedTokens,
  getRevokedTokenCount,
  isTokenRevoked,
};

