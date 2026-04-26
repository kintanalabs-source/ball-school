import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/ld+json',
    'Content-Type': 'application/json'
  }
});

// ============ LOADING INTERCEPTORS ============
// Ces interceptors gèrent automatiquement le loader pour chaque appel API
// Pas besoin de modifier les services existants !

let loadingCallbacks = null;

// Enregistrer les fonctions de callback pour le loading
export const setLoadingCallbacks = (callbacks) => {
  loadingCallbacks = callbacks;
};

// Interceptor request - montre le loader
api.interceptors.request.use(
  (config) => {
    if (loadingCallbacks?.startLoading) {
      const method = config.method?.toUpperCase() || 'GET';
      let message = 'Chargement...';
      
      // Message personnalisé selon la méthode
      switch (method) {
        case 'POST':
          message = 'Création en cours...';
          break;
        case 'PATCH':
        case 'PUT':
          message = 'Mise à jour...';
          break;
        case 'DELETE':
          message = 'Suppression...';
          break;
        default:
          message = 'Chargement des données...';
      }
      
      loadingCallbacks.startLoading(message);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response - cache le loader
api.interceptors.response.use(
  (response) => {
    if (loadingCallbacks?.stopLoading) {
      loadingCallbacks.stopLoading();
    }
    return response;
  },
  (error) => {
    if (loadingCallbacks?.stopLoading) {
      loadingCallbacks.stopLoading();
    }
    return Promise.reject(error);
  }
);

export const StudentService = {
  // ============ API SERVICES ============
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
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
