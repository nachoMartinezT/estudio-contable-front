import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/api/v1/auth/login', data),
  me: () => api.get('/api/v1/auth/me'),
};

export const clientsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/v1/clients', { params }),
  getById: (id: string) => api.get(`/api/v1/clients/${id}`),
  create: (data: any) => api.post('/api/v1/clients', data),
  update: (id: string, data: any) => api.put(`/api/v1/clients/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/clients/${id}`),
};

export const invoicesApi = {
  getAll: (params?: { page?: number; limit?: number; estado?: string }) =>
    api.get('/api/v1/invoices', { params }),
  getById: (id: string) => api.get(`/api/v1/invoices/${id}`),
  create: (data: any) => api.post('/api/v1/invoices', data),
  emitir: (data: any) => api.post('/api/v1/invoices/emitir', data),
  anular: (id: string) => api.post(`/api/v1/invoices/${id}/anular`),
};

export const documentosApi = {
  upload: (formData: FormData) =>
    api.post('/api/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getByClient: (clientId: string) =>
    api.get('/api/v1/documents', { params: { from: 'client' } }),
  download: (id: string) =>
    api.get(`/api/v1/documents/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/api/v1/documents/${id}`),
};

export const ledgerApi = {
  getBalance: (clientId: string) =>
    api.get(`/api/v1/ledger/clients/${clientId}/balance`),
  getMovements: (clientId: string) =>
    api.get(`/api/v1/ledger/clients/${clientId}/movements`),
  createMovement: (clientId: string, data: any) =>
    api.post(`/api/v1/ledger/clients/${clientId}/movements`, data),
  markPaid: (id: string) =>
    api.put(`/api/v1/ledger/movements/${id}/mark-paid`),
  getMyBalance: () =>
    api.get('/api/v1/ledger/my/balance'),
  getMyMovements: () =>
    api.get('/api/v1/ledger/my/movements'),
};

export const feesApi = {
  getRecurring: (clientId: string) =>
    api.get(`/api/v1/fees/clients/${clientId}/recurring`),
  saveRecurring: (clientId: string, data: any) =>
    api.post(`/api/v1/fees/clients/${clientId}/recurring`, data),
  getOverrides: (clientId: string) =>
    api.get(`/api/v1/fees/clients/${clientId}/recurring/overrides`),
  createOverride: (clientId: string, data: any) =>
    api.post(`/api/v1/fees/clients/${clientId}/recurring/overrides`, data),
  deleteOverride: (clientId: string, id: string) =>
    api.delete(`/api/v1/fees/clients/${clientId}/recurring/overrides/${id}`),
  generateNow: () =>
    api.post('/api/v1/fees/generate-now'),
};

export const adminApi = {
  getTenants: () =>
    api.get('/api/v1/admin/tenants'),
  getTenant: (id: string) =>
    api.get(`/api/v1/admin/tenants/${id}`),
  createTenant: (data: any) =>
    api.post('/api/v1/admin/tenants', data),
  updateTenant: (id: string, data: any) =>
    api.put(`/api/v1/admin/tenants/${id}`, data),
  updateAfipConfig: (id: string, data: any) =>
    api.put(`/api/v1/admin/tenants/${id}/afip-config`, data),
  uploadCert: (id: string, formData: FormData) =>
    api.post(`/api/v1/admin/tenants/${id}/cert`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateMpConfig: (id: string, data: any) =>
    api.put(`/api/v1/admin/tenants/${id}/mp-config`, data),
  deleteTenant: (id: string) =>
    api.delete(`/api/v1/admin/tenants/${id}`),
  updateSubscription: (id: string, data: any) =>
    api.put(`/api/v1/admin/tenants/${id}/subscription`, data),
};

export const tenantApi = {
  getStaff: () =>
    api.get('/api/v1/tenants/staff'),
  getUsers: (tenantId: string) =>
    api.get(`/api/v1/tenants/${tenantId}/users`),
  createUser: (tenantId: string, data: any) =>
    api.post(`/api/v1/tenants/${tenantId}/users`, data),
  getPermissions: (tenantId: string, userId: string) =>
    api.get(`/api/v1/tenants/${tenantId}/users/${userId}/permissions`),
  updatePermissions: (tenantId: string, userId: string, data: any) =>
    api.put(`/api/v1/tenants/${tenantId}/users/${userId}/permissions`, data),
};

export const auditApi = {
  getLogs: (params?: { page?: number; limit?: number; accion?: string }) =>
    api.get('/api/v1/audit', { params }),
};

export const dashboardApi = {
  getStats: () => api.get('/api/v1/dashboard'),
};

export const reportsApi = {
  accountStatement: (clientId: string, params?: { from?: string; to?: string; format?: string }) =>
    api.get(`/api/v1/reports/clients/${clientId}/account-statement`, { params }),
  feesPeriodSummary: (params?: { from?: string; to?: string }) =>
    api.get('/api/v1/reports/fees/period-summary', { params }),
  incomeSummary: (params?: { from?: string; to?: string }) =>
    api.get('/api/v1/reports/studio/income-summary', { params }),
};

export const pdfApi = {
  generarFactura: (facturaId: string) =>
    api.post('/api/v1/pdf/factura', { facturaId }),
  generarPresupuesto: (data: any) =>
    api.post('/api/v1/pdf/presupuesto', data),
  generarReporte: (data: any) =>
    api.post('/api/v1/pdf/reporte', data),
};

export const afipApi = {
  testConnection: () => api.get('/api/v1/afip/test'),
  obtenerUltimoComprobante: (puntoVenta: number, tipoComprobante: string) =>
    api.get(`/api/v1/afip/ultimo-comprobante/${puntoVenta}/${tipoComprobante}`),
};

export default api;
