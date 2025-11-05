import { useState } from 'react';
import { accountService } from '../services/accountService';

const TransferModal = ({ accounts, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.fromAccountId || !formData.toAccountId) {
      setError('Please select both accounts');
      setLoading(false);
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      setError('Cannot transfer to the same account');
      setLoading(false);
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    try {
      await accountService.transfer({
        fromAccountId: parseInt(formData.fromAccountId),
        toAccountId: parseInt(formData.toAccountId),
        amount: amount,
        description: formData.description || 'Transfer',
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountBalance = (accountId) => {
    const account = accounts.find((a) => a.id === parseInt(accountId));
    return account ? account.balance : 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Transfer Money</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fromAccountId" className="label">
                From Account
              </label>
              <select
                id="fromAccountId"
                name="fromAccountId"
                value={formData.fromAccountId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name} - {formatCurrency(account.balance)}
                  </option>
                ))}
              </select>
              {formData.fromAccountId && (
                <p className="mt-1 text-sm text-gray-500">
                  Available: {formatCurrency(getAccountBalance(formData.fromAccountId))}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="toAccountId" className="label">
                To Account
              </label>
              <select
                id="toAccountId"
                name="toAccountId"
                value={formData.toAccountId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name} - {formatCurrency(account.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="label">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input pl-8"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="label">
                Description (Optional)
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="What's this transfer for?"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;

