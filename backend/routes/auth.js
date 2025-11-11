const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');
const { authenticateToken, revokeToken } = require('../middleware/auth');
const jwtConfig = require('../config/jwt');

const router = express.Router();

/**
 * Generate JWT token with all required claims
 * Implementation of OPLANE_REQ-00000041
 */
function generateToken(user) {
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    // Standard JWT claims
    iss: jwtConfig.issuer,        // Issuer
    aud: jwtConfig.audience,      // Audience
    sub: user.id.toString(),      // Subject (user ID)
    iat: now,                     // Issued at
    exp: now + (15 * 60),         // Expires in 15 minutes
    
    // Custom claims
    userId: user.id,
    username: user.username,
    
    // Scopes for authorization
    scope: jwtConfig.defaultUserScopes.join(' '),
  };

  return jwt.sign(payload, jwtConfig.secret, {
    algorithm: jwtConfig.algorithms[0], // Use first algorithm from config
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const db = getDb();

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const userId = this.lastID;

        // Create default accounts for the user
        db.run(
          'INSERT INTO accounts (user_id, account_name, account_type, balance) VALUES (?, ?, ?, ?)',
          [userId, 'Checking Account', 'checking', 5000],
          function (err) {
            if (err) {
              console.error('Error creating checking account:', err);
            }
          }
        );

        db.run(
          'INSERT INTO accounts (user_id, account_name, account_type, balance) VALUES (?, ?, ?, ?)',
          [userId, 'Savings Account', 'savings', 10000],
          function (err) {
            if (err) {
              console.error('Error creating savings account:', err);
            }
          }
        );

        // Generate JWT token with required claims
        const token = generateToken({ id: userId, username });

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: userId, username, email },
          expiresIn: jwtConfig.accessTokenExpiry
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    db.close();
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const db = getDb();

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      db.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      db.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token with required claims
    const token = generateToken({ id: user.id, username: user.username });

    db.close();
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email },
      expiresIn: jwtConfig.accessTokenExpiry
    });
  });
});

// POST /api/auth/logout
// Token revocation endpoint for OPLANE_REQ-00000044
router.post('/logout', authenticateToken(), (req, res) => {
  try {
    // Revoke the current token
    const token = req.token;
    revokeToken(token);

    res.json({
      message: 'Logout successful',
      details: 'Token has been revoked'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

module.exports = router;



