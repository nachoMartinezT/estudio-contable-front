export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'USER';
  tenantId: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  tenantId?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  tipoDocumento: 'DNI' | 'CUIT' | 'CUIL' | 'PASAPORTE';
  numeroDocumento: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: 'ACTIVO' | 'INACTIVO';
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Factura {
  id: string;
  numero: string;
  clienteId: string;
  clienteNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  tipo: 'A' | 'B' | 'C' | 'E' | 'M';
  moneda: 'ARS' | 'USD';
  subtotal: number;
  iva: number;
  total: number;
  estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA' | 'ENVIADA_AFIP';
  afipCAE?: string;
  afipFechaVencimientoCAE?: string;
  tenantId: string;
  createdAt: string;
}

export interface PDFRequest {
  tipo: 'FACTURA' | 'PRESUPUESTO' | 'REPORTE';
  datos: Record<string, any>;
}

export interface PDFResponse {
  id: string;
  url: string;
  nombreArchivo: string;
  tamaño: number;
}

export interface AuditLog {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  accion: string;
  entidad: string;
  entidadId: string;
  detalles: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface DashboardStats {
  totalClientes: number;
  totalFacturas: number;
  facturasPendientes: number;
  facturasPagadas: number;
  ingresosMes: number;
  ingresosAnterior: number;
  variacionIngresos: number;
}