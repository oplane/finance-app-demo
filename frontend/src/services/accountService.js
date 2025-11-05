import api from './api';

export const accountService = {
  // Get all accounts for current user
  getAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },

  // Get transactions for a specific account
  getTransactions: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}/transactions`);
    return response.data;
  },

  // Transfer money between accounts
  transfer: async (transferData) => {
    const response = await api.post('/transfer', transferData);
    return response.data;
  },
};

