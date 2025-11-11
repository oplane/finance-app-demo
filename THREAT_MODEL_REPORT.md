# Authentication Threat Model Report
## Finance Application - JWT-based Authentication System

**Generated:** November 7, 2025  
**Feature ID:** finance-app-authentication  
**Tool:** Oplane Gravity

---

## Executive Summary

This threat model analyzes the JWT-based authentication system of the finance application. The analysis identified **11 critical security requirements** across multiple threat categories including credential management, token security, session management, and attack prevention.

### Current Security Posture

**Strengths:**
- ✅ Password hashing using bcryptjs with salt rounds of 10
- ✅ Generic error messages on login failure to prevent username enumeration
- ✅ JWT tokens with 24-hour expiration
- ✅ UNIQUE constraints on username and email in database

**Critical Vulnerabilities Identified:**
- ❌ No Multi-Factor Authentication (MFA)
- ❌ No token refresh or revocation mechanism
- ❌ JWT tokens stored in localStorage (vulnerable to XSS)
- ❌ Default JWT_SECRET ('your_jwt_secret_key') if environment variable not set
- ❌ No rate limiting on authentication endpoints
- ❌ No HTTPS/TLS enforcement
- ❌ No CSRF protection
- ❌ Limited input validation
- ❌ No audit logging for authentication events
- ❌ Weak password requirements (minimum 6 characters)

---

## Security Requirements

### 1. JWT Token Signature and Claims Validation (OPLANE_REQ-00000041)

**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Description:** Implement strict validation of JWT tokens on every authenticated request, including verification of token signature, expiration, issuer, audience, and scopes. Only accept tokens signed with approved algorithms (e.g., RS256).

**Current Implementation:**
- ✅ Token signature verification using JWT_SECRET
- ✅ Expiration validation
- ❌ No issuer validation
- ❌ No audience validation
- ❌ No scope/claims validation
- ❌ Using HS256 (symmetric) instead of RS256 (asymmetric)

**Risk:** If token validation is incomplete or weak, attackers may forge tokens, bypass authentication, or escalate privileges.

**Affected Files:**
- `backend/middleware/auth.js`

---

### 2. Secure Password Storage (OPLANE_REQ-00000042)

**Status:** ✅ IMPLEMENTED

**Description:** Store user passwords using a strong, adaptive hashing algorithm (e.g., bcrypt, Argon2) with a unique salt per password.

**Current Implementation:**
- ✅ Using bcryptjs with 10 salt rounds
- ✅ Passwords never stored in plaintext
- ⚠️ Consider increasing salt rounds to 12 for better security

**Risk:** Storing passwords insecurely exposes users to credential theft if the database is compromised.

**Affected Files:**
- `backend/routes/auth.js` (lines 26)

---

### 3. Multi-Factor Authentication (OPLANE_REQ-00000043)

**Status:** ❌ NOT IMPLEMENTED

**Description:** Require users to enable MFA during registration and enforce MFA during login, using TOTP, SMS, or hardware tokens.

**Current Implementation:**
- ❌ No MFA support at all

**Risk:** Without MFA, compromised passwords or tokens can be used to access accounts, increasing risk of unauthorized access. This is especially critical for a finance application handling sensitive financial data.

**Recommendation:** Implement TOTP-based MFA using libraries like `speakeasy` or `otplib`.

**Affected Files:**
- `backend/routes/auth.js`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`

---

### 4. Token Revocation and Refresh Mechanism (OPLANE_REQ-00000044)

**Status:** ❌ NOT IMPLEMENTED

**Description:** Implement a secure token revocation list and refresh token mechanism. Ensure refresh tokens are stored securely, are single-use, and can be invalidated on logout or suspicious activity.

**Current Implementation:**
- ❌ No token revocation mechanism
- ❌ No refresh token support
- ❌ Tokens remain valid until expiration (24 hours) even after logout

**Risk:** Without token revocation, stolen or leaked tokens remain valid, allowing attackers persistent access for up to 24 hours.

**Recommendation:** Implement refresh tokens with rotation and maintain a token blacklist in Redis or database.

**Affected Files:**
- `backend/routes/auth.js`
- `backend/middleware/auth.js`
- `frontend/src/services/authService.js`

---

### 5. HTTPS/TLS Enforcement (OPLANE_REQ-00000045)

**Status:** ❌ NOT IMPLEMENTED

**Description:** Require all registration, login, and token management endpoints to use HTTPS with strong TLS configurations. Reject any requests over insecure channels.

**Current Implementation:**
- ❌ No HTTPS enforcement in code
- ❌ No HTTP Strict Transport Security (HSTS) headers

**Risk:** Transmitting credentials or tokens over insecure channels exposes them to interception and theft via man-in-the-middle attacks.

**Recommendation:** 
- Configure HTTPS in production with valid SSL/TLS certificates
- Add HSTS middleware
- Use helmet.js for security headers

**Affected Files:**
- `backend/server.js`

---

### 6. CSRF Protection (OPLANE_REQ-00000046)

**Status:** ❌ NOT IMPLEMENTED

**Description:** Implement CSRF tokens for all state-changing requests, especially those involving token issuance, password changes, and session management.

**Current Implementation:**
- ❌ No CSRF protection

**Risk:** Without CSRF protection, attackers can trick users into performing unwanted actions, such as issuing tokens or changing passwords.

**Recommendation:** Implement CSRF token validation using `csurf` middleware or SameSite cookie attributes.

**Affected Files:**
- `backend/server.js`
- `backend/routes/auth.js`

---

### 7. Input Validation and Output Encoding (OPLANE_REQ-00000047)

**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Description:** Validate all user input for registration and login forms on both client and server sides. Encode output to prevent XSS and injection attacks.

**Current Implementation:**
- ✅ Basic presence validation (required fields)
- ✅ Password length validation (minimum 6 characters)
- ❌ No format validation for email
- ❌ No sanitization of username/email input
- ❌ No output encoding
- ❌ Vulnerable to SQL injection (using string interpolation in queries)

**Risk:** Unvalidated input can lead to SQL injection, XSS, or other attacks compromising user accounts and system integrity.

**Recommendation:** 
- Use prepared statements/parameterized queries
- Implement email format validation
- Sanitize all user inputs
- Add content security policy headers

**Affected Files:**
- `backend/routes/auth.js`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`

---

### 8. Rate Limiting and Brute Force Protection (OPLANE_REQ-00000048)

**Status:** ❌ NOT IMPLEMENTED

**Description:** Implement rate limiting on registration, login, and password reset endpoints. Lock accounts or introduce delays after repeated failed attempts.

**Current Implementation:**
- ❌ No rate limiting
- ❌ No account lockout mechanism
- ❌ No progressive delays

**Risk:** Without rate limiting, attackers can perform brute force attacks to guess passwords or tokens.

**Recommendation:** Implement rate limiting using `express-rate-limit` and consider account lockout after 5 failed attempts.

**Affected Files:**
- `backend/server.js`
- `backend/routes/auth.js`

---

### 9. Secure Storage and Rotation of JWT Signing Keys (OPLANE_REQ-00000049)

**Status:** ❌ NOT IMPLEMENTED

**Description:** Store JWT signing keys in a secure, access-controlled environment (e.g., hardware security module or secrets manager). Rotate keys periodically and immediately upon suspected compromise.

**Current Implementation:**
- ❌ JWT_SECRET defaults to hardcoded value 'your_jwt_secret_key'
- ❌ No key rotation mechanism
- ❌ Key stored in code as plain string

**Risk:** Compromised signing keys allow attackers to forge valid tokens and bypass authentication.

**Recommendation:** 
- Use environment variables (already supported but needs enforcement)
- Implement key rotation schedule
- Consider using AWS Secrets Manager, HashiCorp Vault, or similar
- Use asymmetric keys (RS256) instead of symmetric (HS256)

**Affected Files:**
- `backend/middleware/auth.js`

---

### 10. Session Management and Expiry Enforcement (OPLANE_REQ-00000050)

**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Description:** Enforce short-lived JWT access tokens and require periodic re-authentication. Invalidate tokens on logout and after password changes.

**Current Implementation:**
- ✅ 24-hour token expiration (though this is quite long)
- ❌ No automatic token invalidation on logout (client-side only)
- ❌ No token invalidation on password change

**Risk:** Long-lived tokens and lack of invalidation mechanisms increase the risk of session hijacking and unauthorized access.

**Recommendation:** 
- Reduce token expiration to 15-30 minutes
- Implement refresh tokens
- Invalidate all tokens on password change
- Implement server-side session management

**Affected Files:**
- `backend/routes/auth.js`
- `backend/middleware/auth.js`

---

### 11. Audit Logging (OPLANE_REQ-00000051)

**Status:** ❌ NOT IMPLEMENTED

**Description:** Log all authentication attempts, token issuance, refresh, revocation, and password changes with sufficient detail for forensic analysis. Protect logs from tampering and unauthorized access.

**Current Implementation:**
- ❌ No authentication event logging
- ❌ Only basic console.error for database errors

**Risk:** Without audit logs, detecting and investigating security incidents is difficult, delaying response and remediation.

**Recommendation:** Implement comprehensive logging using Winston or similar, including:
- All login attempts (success and failure)
- Registration events
- Token issuance
- Failed authentication attempts
- IP addresses and timestamps

**Affected Files:**
- `backend/routes/auth.js`
- `backend/middleware/auth.js`

---

## Attack Vectors

### 1. Cross-Site Scripting (XSS)
**Severity:** HIGH  
**Status:** Vulnerable

JWT tokens stored in localStorage are accessible to any JavaScript code, including malicious scripts injected via XSS attacks.

**Mitigation:**
- Consider using httpOnly cookies instead of localStorage
- Implement Content Security Policy (CSP)
- Sanitize all user inputs and outputs

---

### 2. Brute Force Attacks
**Severity:** HIGH  
**Status:** Vulnerable

No rate limiting allows unlimited login attempts.

**Mitigation:**
- Implement rate limiting
- Add account lockout after failed attempts
- Consider CAPTCHA for suspicious activity

---

### 3. Token Theft and Replay
**Severity:** HIGH  
**Status:** Vulnerable

Long-lived tokens (24 hours) with no revocation mechanism allow extended unauthorized access if stolen.

**Mitigation:**
- Implement refresh tokens
- Reduce access token lifetime
- Add token revocation
- Monitor for suspicious token usage

---

### 4. SQL Injection
**Severity:** MEDIUM  
**Status:** Potentially Vulnerable

While parameterized queries are used, comprehensive input validation is missing.

**Mitigation:**
- Use ORM or query builder
- Implement strict input validation
- Add SQL injection detection in WAF

---

### 5. Man-in-the-Middle (MITM)
**Severity:** CRITICAL  
**Status:** Vulnerable

No HTTPS enforcement allows credentials and tokens to be intercepted.

**Mitigation:**
- Enforce HTTPS in production
- Add HSTS headers
- Use secure cookies

---

### 6. Weak Cryptographic Practices
**Severity:** HIGH  
**Status:** Vulnerable

Default/weak JWT_SECRET and no key rotation.

**Mitigation:**
- Enforce strong secret keys
- Implement key rotation
- Use asymmetric cryptography (RS256)

---

## Compliance Considerations

This application handles financial data and may be subject to:
- **PCI DSS** - Payment Card Industry Data Security Standard
- **SOC 2** - System and Organization Controls
- **GDPR** - General Data Protection Regulation (if handling EU users)

Current authentication system is **not compliant** with these standards due to:
- Lack of MFA
- Insufficient logging
- Missing token revocation
- Weak session management

---

## Recommendations Priority

### 🔴 Critical (Implement Immediately)

1. **Set strong JWT_SECRET via environment variable**
   - Impact: Prevents token forgery
   - Effort: Low
   - Files: `backend/middleware/auth.js`

2. **Implement HTTPS/TLS enforcement**
   - Impact: Prevents credential interception
   - Effort: Medium
   - Files: `backend/server.js`

3. **Add rate limiting to authentication endpoints**
   - Impact: Prevents brute force attacks
   - Effort: Low
   - Files: `backend/server.js`, `backend/routes/auth.js`

4. **Implement token revocation mechanism**
   - Impact: Limits damage from stolen tokens
   - Effort: High
   - Files: `backend/routes/auth.js`, `backend/middleware/auth.js`

### 🟡 High (Implement Soon)

5. **Add Multi-Factor Authentication**
   - Impact: Significantly reduces account compromise risk
   - Effort: High
   - Files: Multiple

6. **Implement audit logging**
   - Impact: Detection and forensics
   - Effort: Medium
   - Files: `backend/routes/auth.js`, `backend/middleware/auth.js`

7. **Add CSRF protection**
   - Impact: Prevents cross-site attacks
   - Effort: Low
   - Files: `backend/server.js`

8. **Move tokens from localStorage to httpOnly cookies**
   - Impact: XSS protection
   - Effort: Medium
   - Files: Multiple

### 🟢 Medium (Plan for Implementation)

9. **Implement refresh token mechanism**
   - Impact: Better session management
   - Effort: High

10. **Strengthen password requirements**
    - Impact: Better credential security
    - Effort: Low

11. **Add comprehensive input validation**
    - Impact: Prevents injection attacks
    - Effort: Medium

---

## Visualization

The threat model architecture diagram is available in `threat-model-diagram.mmd`. You can visualize it using:
- Mermaid Live Editor: https://mermaid.live/
- VS Code Mermaid Preview extension
- GitHub (supports Mermaid in Markdown)

---

## Next Steps

1. Review this threat model with your security team
2. Prioritize remediation based on risk and effort
3. Create tickets for each security requirement
4. Implement fixes starting with Critical priority items
5. Re-assess after implementation
6. Consider regular security audits and penetration testing

---

## Tools Used

- **Oplane Gravity**: Automated threat modeling
- **Analysis Date**: November 7, 2025
- **Feature ID**: finance-app-authentication

For implementation guidance on specific requirements, use Oplane's `request_implementation_advice` tool with the requirement ID.

