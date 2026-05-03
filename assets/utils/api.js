import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/ld+json',
    'Content-Type': 'application/json'
  },
  // Important pour le stateful : envoyer les cookies
  withCredentials: true
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

// Interceptor response - cache le loader (stateful - pas de token JWT)
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
    
    // En cas d'erreur 401, rediriger vers login
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Pas de token JWT en mode stateful - les sessions gèrent l'auth

export const AuthService = {
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
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
  getAll: (params) => api.get('/classes', { params }),
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
  getAll: (params) => api.get('/school_years', { params }),
  get: (id) => api.get(`/school_years/${id}`),
  create: (data) => api.post('/school_years', data),
  update: (id, data) => api.patch(`/school_years/${id}`, data, {
    headers: { 'Content-Type': 'application/merge-patch+json' }
  }),
};

export const NewsService = {
  getAll: (params) => api.get('/news', { params }),
  create: (data) => api.post('/news', data),
  update: (idOrIri, data) => {
    // Si c'est une IRI complète (/api/news/1), on enlève le préfixe /api car baseURL le gère déjà
    const url = typeof idOrIri === 'string' && idOrIri.startsWith('/api/') 
      ? idOrIri.replace('/api', '') 
      : `/news/${idOrIri}`;
    return api.patch(url, data, {
      headers: { 'Content-Type': 'application/merge-patch+json' }
    });
  },
  delete: (id) => api.delete(`/news/${id}`),
};

export const AccountingService = {
  getAll: (params) => api.get('/accounting_movements', { params }),
  create: (data) => api.post('/accounting_movements', data),
};

export const RegularizationService = {
  getAll: (params) => api.get('/previous_year_regularizations', { params }),
  sync: (currentYearIri) => api.post('/regularizations/sync', { currentYear: currentYearIri }),
  pay: (id, data) => api.post(`/regularizations/${id}/pay`, data),
};

export const AdminUserService = {
  getAll: () => api.get('/admin/users'),
  create: (data) => api.post('/admin/users', data),
  updateStatus: (id, status) => api.post(`/admin/users/${id}/status`, { status }),
  delete: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
