import { apiClient } from './apiClient';

export const feeService = {
  // Fee Structures
  getFeeStructures: async (params = {}) => {
    const res = await apiClient.get('/fees/structures/', { params });
    return res.data;
  },

  createFeeStructure: async (data) => {
    const res = await apiClient.post('/fees/structures/', data);
    return res.data;
  },

  updateFeeStructure: async (id, data) => {
    const res = await apiClient.patch(`/fees/structures/${id}/`, data);
    return res.data;
  },

  // Student Fee Items (Invoices / Dues)
  getStudentFeeItems: async (params = {}) => {
    const res = await apiClient.get('/fees/items/', { params });
    return res.data;
  },

  createStudentFeeItem: async (data) => {
    const res = await apiClient.post('/fees/items/', data);
    return res.data;
  },

  assignFeeBulk: async (data) => {
    const res = await apiClient.post('/fees/items/assign_bulk/', data);
    return res.data;
  },

  // Fee Payments & Receipts
  getFeePayments: async (params = {}) => {
    const res = await apiClient.get('/fees/payments/', { params });
    return res.data;
  },

  createFeePayment: async (data) => {
    const res = await apiClient.post('/fees/payments/', data);
    return res.data;
  },

  getFeeStats: async () => {
    const res = await apiClient.get('/fees/payments/stats/');
    return res.data;
  },
};
