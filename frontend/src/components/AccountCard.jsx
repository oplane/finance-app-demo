const AccountCard = ({ account, onViewTransactions }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountIcon = (type) => {
    if (type === 'checking') {
      return '💳';
    }
    return '💰';
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">{getAccountIcon(account.account_type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {account.account_name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              {account.account_type} Account
            </p>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Current Balance</p>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(account.balance)}
        </p>
      </div>
      <button
        onClick={() => onViewTransactions(account)}
        className="btn-secondary w-full"
      >
        View Transactions
      </button>
    </div>
  );
};

export default AccountCard;

