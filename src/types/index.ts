export interface User {
  id: number | string;
  email: string;
  nombre: string;
  apellido?: string;
  rol: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CLIENT';
  tenantId: number | string;
  tenantName?: string;
  perms: string[];
  clientId?: number | string;
}

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface StaffPermissions {
  staffUserId: number;
  tenantId: number;
  canManageClients: boolean;
  canViewInvoices: boolean;
  canCreateInvoices: boolean;
  canManageDocuments: boolean;
  canViewDashboard: boolean;
  canManageStaff: boolean;
}

export interface AccountMovement {
  id: number;
  tenantId: number;
  clientId: number;
  type: 'CARGO_FACTURA' | 'CARGO_MANUAL' | 'PAGO_EFECTIVO' | 'PAGO_TRANSFERENCIA' | 'PAGO_OTRO';
  direction: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  invoiceId?: number;
  dueDate?: string;
  paidAt?: string;
  mpPaymentLinkUrl?: string;
  mpStatus?: string;
  createdAt: string;
}

export interface ClientBalance {
  clientId: number;
  tenantId: number;
  totalDebt: number;
  lastMovementAt: string;
}

export interface RecurringFee {
  id: number;
  tenantId: number;
  clientId: number;
  baseAmount: number;
  active: boolean;
}

export interface RecurringFeeOverride {
  id: number;
  recurringFeeId: number;
  yearMonth: string;
  overrideAmount: number;
  reason?: string;
}

export interface Tenant {
  id: number;
  razonSocial: string;
  cuit: string;
  emailContacto: string;
  activo: boolean;
  createdAt: string;
}

export interface Cliente {
  id: number | string;
  razonSocial: string;
  cuit: string;
  email: string;
  telefono: string;
  condicionIVA: string;
  honorarioMensual: number;
  activo: boolean;
  estado: 'ACTIVO' | 'INACTIVO';
  tenantId: number | string;
  createdAt: string;
}

export interface Factura {
  id: number | string;
  numeroFactura: string;
  fechaEmision: string;
  clientId: number | string;
  clienteNombre?: string;
  total: number;
  estado: string;
  cae?: string;
  vencimientoCae?: string;
  tipoComprobante?: number;
  puntoVenta?: number;
  tenantId: number | string;
  createdAt: string;
}

export interface DashboardStats {
  cantidadClientes: number;
  totalFacturado: number;
  ultimosMovimientos?: Array<{
    id: number;
    description: string;
    amount: number;
    createdAt: string;
    type: string;
  }>;
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
