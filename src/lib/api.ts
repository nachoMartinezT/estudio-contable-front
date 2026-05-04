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
    api.post('/api/auth/login', data),
  register: (data: { email: string; password: string; nombre: string }) =>
    api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me'),
};

export const clientesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/clientes', { params }),
  getById: (id: string) => api.get(`/api/clientes/${id}`),
  create: (data: any) => api.post('/api/clientes', data),
  update: (id: string, data: any) => api.put(`/api/clientes/${id}`, data),
  delete: (id: string) => api.delete(`/api/clientes/${id}`),
};

export const facturasApi = {
  getAll: (params?: { page?: number; limit?: number; estado?: string }) =>
    api.get('/api/facturas', { params }),
  getById: (id: string) => api.get(`/api/facturas/${id}`),
  create: (data: any) => api.post('/api/facturas', data),
  emitir: (data: any) => api.post('/api/facturas/emitir', data),
  anular: (id: string) => api.post(`/api/facturas/${id}/anular`),
  enviarAFIP: (id: string) => api.post(`/api/facturas/${id}/enviar-afip`),
};

export const pdfApi = {
  generarFactura: (facturaId: string) =>
    api.post('/api/pdf/factura', { facturaId }),
  generarPresupuesto: (data: any) =>
    api.post('/api/pdf/presupuesto', data),
  generarReporte: (data: any) =>
    api.post('/api/pdf/reporte', data),
};

export const auditApi = {
  getLogs: (params?: { page?: number; limit?: number; accion?: string }) =>
    api.get('/api/audit/logs', { params }),
};

export const afipApi = {
  testConnection: () => api.get('/api/afip/test'),
  obtenerUltimoComprobante: (puntoVenta: number, tipoComprobante: string) =>
    api.get(`/api/afip/ultimo-comprobante/${puntoVenta}/${tipoComprobante}`),
};

export const dashboardApi = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export default api;