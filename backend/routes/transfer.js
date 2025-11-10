const express = require('express');
const { getDb } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const jwtConfig = require('../config/jwt');

const router = express.Router();

// POST /api/transfer - Transfer money between accounts
// Requires write:transfers scope
router.post('/', authenticateToken([jwtConfig.scopes.WRITE_TRANSFERS]), (req, res) => {
  const { fromAccountId, toAccountId, amount, description } = req.body;
  const userId = req.user.userId;

  // Validation
  if (!fromAccountId || !toAccountId || !amount) {
    return res.status(400).json({ error: 'From account, to account, and amount are required' });
  }

  if (fromAccountId === toAccountId) {
    return res.status(400).json({ error: 'Cannot transfer to the same account' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than zero' });
  }

  const db = getDb();

  // Verify both accounts belong to the user and check balances
  db.get(
    'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
    [fromAccountId, userId],
    (err, fromAccount) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (!fromAccount) {
        db.close();
        return res.status(404).json({ error: 'Source account not found' });
      }

      if (fromAccount.balance < amount) {
        db.close();
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      db.get(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [toAccountId, userId],
        (err, toAccount) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          if (!toAccount) {
            db.close();
            return res.status(404).json({ error: 'Destination account not found' });
          }

          // Start transaction
          db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // Deduct from source account
            db.run(
              'UPDATE accounts SET balance = balance - ? WHERE id = ?',
              [amount, fromAccountId],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  db.close();
                  return res.status(500).json({ error: 'Transfer failed' });
                }
              }
            );

            // Add to destination account
            db.run(
              'UPDATE accounts SET balance = balance + ? WHERE id = ?',
              [amount, toAccountId],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  db.close();
                  return res.status(500).json({ error: 'Transfer failed' });
                }
              }
            );

            // Record transaction
            db.run(
              `INSERT INTO transactions (from_account_id, to_account_id, amount, description, transaction_type)
               VALUES (?, ?, ?, ?, ?)`,
              [fromAccountId, toAccountId, amount, description || 'Transfer', 'transfer'],
              function (err) {
                if (err) {
                  db.run('ROLLBACK');
                  db.close();
                  return res.status(500).json({ error: 'Transfer failed' });
                }

                const transactionId = this.lastID;

                db.run('COMMIT', (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    db.close();
                    return res.status(500).json({ error: 'Transfer failed' });
                  }

                  // Get updated balances
                  db.get('SELECT balance FROM accounts WHERE id = ?', [fromAccountId], (err, updatedFrom) => {
                    db.get('SELECT balance FROM accounts WHERE id = ?', [toAccountId], (err, updatedTo) => {
                      db.close();

                      res.json({
                        message: 'Transfer successful',
                        transaction: {
                          id: transactionId,
                          from_account_id: fromAccountId,
                          to_account_id: toAccountId,
                          amount,
                          description: description || 'Transfer',
                          from_balance: updatedFrom.balance,
                          to_balance: updatedTo.balance
                        }
                      });
                    });
                  });
                });
              }
            );
          });
        }
      );
    }
  );
});

module.exports = router;

