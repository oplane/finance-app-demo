const express = require('express');
const { getDb } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/accounts - Get current user's accounts
router.get('/', (req, res) => {
  const userId = req.user.userId;
  const db = getDb();

  db.all(
    'SELECT id, account_name, account_type, balance, created_at FROM accounts WHERE user_id = ?',
    [userId],
    (err, accounts) => {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ accounts });
    }
  );
});

// GET /api/accounts/:id/transactions - Get transaction history for an account
router.get('/:id/transactions', (req, res) => {
  const accountId = req.params.id;
  const userId = req.user.userId;
  const db = getDb();

  // First, verify the account belongs to the user
  db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, userId], (err, account) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database error' });
    }

    if (!account) {
      db.close();
      return res.status(404).json({ error: 'Account not found' });
    }

    // Get all transactions where this account is involved
    db.all(
      `SELECT 
        t.id,
        t.amount,
        t.description,
        t.transaction_type,
        t.created_at,
        t.from_account_id,
        t.to_account_id,
        from_acc.account_name as from_account_name,
        to_acc.account_name as to_account_name
      FROM transactions t
      LEFT JOIN accounts from_acc ON t.from_account_id = from_acc.id
      LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id
      WHERE t.from_account_id = ? OR t.to_account_id = ?
      ORDER BY t.created_at DESC`,
      [accountId, accountId],
      (err, transactions) => {
        db.close();

        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Format transactions to show whether it was a debit or credit
        const formattedTransactions = transactions.map(t => {
          const isDebit = t.from_account_id === parseInt(accountId);
          return {
            id: t.id,
            amount: t.amount,
            type: isDebit ? 'debit' : 'credit',
            description: t.description,
            transaction_type: t.transaction_type,
            from_account: t.from_account_name,
            to_account: t.to_account_name,
            created_at: t.created_at
          };
        });

        res.json({ transactions: formattedTransactions });
      }
    );
  });
});

module.exports = router;

