import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/ld+json',
    'Content-Type': 'application/json'
  }
});

export const AuthService = {
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
};

export const StudentService = {
  getAll: (params) => api.get('/students', { params }),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.patch(`/students/${id}`, data, {
    headers: { 'Content-Type': 'application/merge-patch+json' }
  }),
  delete: (id) => api.delete(`/students/${id}`),
  generateYearFees: (id) => api.post(`/students/${id}/generate-year-fees`, {}),
};

export const ClasseService = {
  getAll: () => api.get('/classes'),
  get: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.patch(`/classes/${id}`, data, {
    headers: { 'Content-Type': 'application/merge-patch+json' }
  }),
  delete: (id) => api.delete(`/classes/${id}`),
};

export const FeeService = {
  getAll: (params) => api.get('/fees', { params }),
  getUnpaid: (month, year) => api.get('/fees', {
    params: { month, year, isPaid: false }
  }),
  pay: (feeIds) => api.post('/fees/pay', { feeIds }),
  markAsPaid: (id) => api.patch(`/fees/${id}`, { isPaid: true }, {
    headers: { 'Content-Type': 'application/merge-patch+json' }
  }),
};

export const SchoolYearService = {
  getAll: () => api.get('/school_years'),
  get: (id) => api.get(`/school_years/${id}`),
  create: (data) => api.post('/school_years', data),
  update: (id, data) => api.patch(`/school_years/${id}`, data, {
    headers: { 'Content-Type': 'application/merge-patch+json' }
  }),
};

export const NewsService = {
  getAll: () => api.get('/news'),
  create: (data) => api.post('/news', data),
};

export const AccountingService = {
  getAll: (params) => api.get('/accounting_movements', { params }),
  create: (data) => api.post('/accounting_movements', data),
};

export default api;
