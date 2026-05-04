export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CLIENT';
  tenantId: string;
  perms: string[];
  clientId?: string;
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
  nombreEstudio: string;
  cuit: string;
  afipHomologacion: boolean;
  mpEnabled: boolean;
  overdueReminderEnabled: boolean;
  plan: string;
  active: boolean;
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
