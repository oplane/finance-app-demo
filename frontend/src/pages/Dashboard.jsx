import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AccountCard from '../components/AccountCard';
import TransferModal from '../components/TransferModal';
import TransactionsModal from '../components/TransactionsModal';
import { accountService } from '../services/accountService';

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAccounts();
      setAccounts(data.accounts);
      setError('');
    } catch (err) {
      setError('Failed to load accounts. Please try again.');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleViewTransactions = (account) => {
    setSelectedAccount(account);
    setShowTransactionsModal(true);
  };

  const handleTransferSuccess = () => {
    fetchAccounts(); // Refresh accounts after transfer
    setShowTransferModal(false);
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage your accounts and finances</p>
          </div>
          <button
            onClick={() => setShowTransferModal(true)}
            className="btn-primary"
          >
            💸 Transfer Money
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Total Balance Card */}
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <h3 className="text-lg font-medium mb-2 opacity-90">Total Balance</h3>
          <p className="text-4xl font-bold">{formatCurrency(getTotalBalance())}</p>
          <p className="text-sm opacity-80 mt-2">Across all accounts</p>
        </div>

        {/* Accounts Grid */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Accounts</h3>
          {accounts.length === 0 ? (
            <div className="card text-center text-gray-500">
              <p>No accounts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onViewTransactions={handleViewTransactions}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferModal
          accounts={accounts}
          onClose={() => setShowTransferModal(false)}
          onSuccess={handleTransferSuccess}
        />
      )}

      {/* Transactions Modal */}
      {showTransactionsModal && selectedAccount && (
        <TransactionsModal
          account={selectedAccount}
          onClose={() => {
            setShowTransactionsModal(false);
            setSelectedAccount(null);
          }}
        />
      )}
    </Layout>
  );
};

export default Dashboard;

