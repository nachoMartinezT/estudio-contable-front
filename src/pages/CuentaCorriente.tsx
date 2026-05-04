import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search, Link, Download, FileSpreadsheet, FileText, X, Copy, Check, Clock, AlertCircle,
} from 'lucide-react';
import { clientsApi, ledgerApi, reportsApi } from '../lib/api';
import { Cliente, ClientBalance, AccountMovement } from '../types';

const paymentSchema = z.object({
  monto: z.number({ required_error: 'Monto requerido' }).min(0.01, 'Monto mínimo $0.01'),
  tipo: z.enum(['PAGO_EFECTIVO', 'PAGO_TRANSFERENCIA', 'PAGO_OTRO']),
  descripcion: z.string().optional(),
});

const chargeSchema = z.object({
  monto: z.number({ required_error: 'Monto requerido' }).min(0.01, 'Monto mínimo $0.01'),
  descripcion: z.string().optional(),
  fechaVencimiento: z.string().optional(),
});

const CuentaCorriente: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [copyId, setCopyId] = useState<string | null>(null);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: clients, isLoading: clientsLoading } = useQuery<Cliente[]>({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then((res) => res.data),
  });

  const { data: balance, isLoading: balanceLoading } = useQuery<ClientBalance>({
    queryKey: ['balance', selectedClientId],
    queryFn: () => ledgerApi.getBalance(selectedClientId).then((res) => res.data),
    enabled: !!selectedClientId,
  });

  const { data: movements, isLoading: movementsLoading } = useQuery<AccountMovement[]>({
    queryKey: ['movements', selectedClientId],
    queryFn: () => ledgerApi.getMovements(selectedClientId).then((res) => res.data),
    enabled: !!selectedClientId,
  });

  const paymentMutation = useMutation({
    mutationFn: (data: z.infer<typeof paymentSchema>) =>
      ledgerApi.createMovement(selectedClientId, {
        ...data,
        direction: 'CREDIT',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements', selectedClientId] });
      queryClient.invalidateQueries({ queryKey: ['balance', selectedClientId] });
      setShowPaymentModal(false);
      paymentForm.reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al registrar pago');
    },
  });

  const chargeMutation = useMutation({
    mutationFn: (data: z.infer<typeof chargeSchema>) =>
      ledgerApi.createMovement(selectedClientId, {
        ...data,
        direction: 'DEBIT',
        type: 'CARGO_MANUAL',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements', selectedClientId] });
      queryClient.invalidateQueries({ queryKey: ['balance', selectedClientId] });
      setShowChargeModal(false);
      chargeForm.reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al crear cargo');
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => ledgerApi.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements', selectedClientId] });
      queryClient.invalidateQueries({ queryKey: ['balance', selectedClientId] });
      setShowMarkPaidModal(null);
    },
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { tipo: 'PAGO_TRANSFERENCIA' },
  });

  const chargeForm = useForm<z.infer<typeof chargeSchema>>({
    resolver: zodResolver(chargeSchema),
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('es-AR') : '-';

  const getMovementStatus = (mov: AccountMovement) => {
    if (mov.paidAt) {
      return { label: 'Pagado', className: 'bg-green-100 text-green-800' };
    }
    if (mov.dueDate) {
      const due = new Date(mov.dueDate);
      const now = new Date();
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        return { label: 'Vencido', className: 'bg-red-100 text-red-800' };
      }
      if (diffDays <= 3) {
        return { label: 'Vence pronto', className: 'bg-yellow-100 text-yellow-800' };
      }
    }
    return { label: 'Pendiente', className: 'bg-gray-100 text-gray-700' };
  };

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CARGO_FACTURA: 'Factura',
      CARGO_MANUAL: 'Cargo Manual',
      PAGO_EFECTIVO: 'Pago Efectivo',
      PAGO_TRANSFERENCIA: 'Pago Transferencia',
      PAGO_OTRO: 'Otro Pago',
    };
    return labels[type] || type;
  };

  const handleCopyMpLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopyId(id);
    setTimeout(() => setCopyId(null), 2000);
  };

  const handleExport = (format: string) => {
    reportsApi
      .accountStatement(selectedClientId, { from: fromDate, to: toDate, format })
      .then((res) => {
        const blob = new Blob([res.data], {
          type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cuenta-corriente-${selectedClientId}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => setErrorMsg('Error al exportar'));
    setShowExportDropdown(false);
  };

  const selectedClient = clients?.find((c) => c.id === selectedClientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cuenta Corriente</h1>
        <p className="text-gray-600 mt-2">Consulta y gestiona los movimientos de tus clientes</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X size={16} /></button>
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleccionar cliente...</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedClientId && (
            <>
              <button onClick={() => { setShowPaymentModal(true); setErrorMsg(''); }} className="btn-primary">
                Registrar Pago
              </button>
              <button onClick={() => { setShowChargeModal(true); setErrorMsg(''); }} className="btn-secondary">
                Cargo Manual
              </button>
              <div className="flex items-end gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Desde</label>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input-field py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input-field py-1.5 text-sm" />
                </div>
                <div className="relative">
                  <button onClick={() => setShowExportDropdown(!showExportDropdown)} className="btn-secondary flex items-center space-x-2">
                    <Download size={16} />
                    <span>Exportar</span>
                  </button>
                  {showExportDropdown && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <button onClick={() => handleExport('pdf')} className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-50 text-sm">
                        <FileText size={14} />
                        <span>PDF</span>
                      </button>
                      <button onClick={() => handleExport('excel')} className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-50 text-sm">
                        <FileSpreadsheet size={14} />
                        <span>Excel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedClientId && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{selectedClient?.nombre || '-'}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Saldo Actual</p>
              {balanceLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-24 mt-1"></div>
              ) : (
                <p className={`text-xl font-bold mt-1 ${balance && balance.totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {balance ? formatCurrency(balance.totalDebt) : '-'}
                </p>
              )}
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Último Movimiento</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {balance ? formatDate(balance.lastMovementAt) : '-'}
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Descripción</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Tipo</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">Débito</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">Crédito</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Vencimiento</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movementsLoading ? (
                    <tr><td colSpan={8} className="py-8 text-center text-gray-500">Cargando movimientos...</td></tr>
                  ) : !movements?.length ? (
                    <tr><td colSpan={8} className="py-8 text-center text-gray-500">No hay movimientos registrados</td></tr>
                  ) : (
                    movements.map((mov) => {
                      const status = getMovementStatus(mov);
                      return (
                        <tr key={mov.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-900">{formatDate(mov.createdAt)}</td>
                          <td className="py-4 px-4 text-gray-900 max-w-[200px] truncate" title={mov.description}>
                            {mov.description || '-'}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {getMovementTypeLabel(mov.type)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-red-600 font-medium">
                            {mov.direction === 'DEBIT' ? formatCurrency(mov.amount) : '-'}
                          </td>
                          <td className="py-4 px-4 text-right text-green-600 font-medium">
                            {mov.direction === 'CREDIT' ? formatCurrency(mov.amount) : '-'}
                          </td>
                          <td className="py-4 px-4 text-gray-500">
                            {formatDate(mov.dueDate)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {!mov.paidAt && (
                                <button
                                  onClick={() => setShowMarkPaidModal(String(mov.id))}
                                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Marcar pagado"
                                >
                                  <Clock size={16} />
                                </button>
                              )}
                              {mov.mpPaymentLinkUrl && (
                                <button
                                  onClick={() => handleCopyMpLink(mov.mpPaymentLinkUrl!, String(mov.id))}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Copiar Link de MercadoPago"
                                >
                                  {copyId === String(mov.id) ? <Check size={16} className="text-green-600" /> : <Link size={16} />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedClientId && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona un cliente</h3>
          <p className="text-gray-500">Elige un cliente para ver su cuenta corriente y movimientos</p>
        </div>
      )}

      {/* Registrar Pago Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Registrar Pago</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={paymentForm.handleSubmit((data) => paymentMutation.mutate(data))} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                <input type="number" step="0.01" {...paymentForm.register('monto', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                {paymentForm.formState.errors.monto && <p className="mt-1 text-sm text-red-600">{paymentForm.formState.errors.monto.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select {...paymentForm.register('tipo')} className="input-field">
                  <option value="PAGO_TRANSFERENCIA">Transferencia</option>
                  <option value="PAGO_EFECTIVO">Efectivo</option>
                  <option value="PAGO_OTRO">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input type="text" {...paymentForm.register('descripcion')} className="input-field" placeholder="Opcional" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={paymentMutation.isPending} className="btn-primary">
                  {paymentMutation.isPending ? 'Registrando...' : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cargo Manual Modal */}
      {showChargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Cargo Manual</h2>
              <button onClick={() => setShowChargeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={chargeForm.handleSubmit((data) => chargeMutation.mutate(data))} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                <input type="number" step="0.01" {...chargeForm.register('monto', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                {chargeForm.formState.errors.monto && <p className="mt-1 text-sm text-red-600">{chargeForm.formState.errors.monto.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input type="text" {...chargeForm.register('descripcion')} className="input-field" placeholder="Opcional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
                <input type="date" {...chargeForm.register('fechaVencimiento')} className="input-field" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowChargeModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={chargeMutation.isPending} className="btn-primary">
                  {chargeMutation.isPending ? 'Creando...' : 'Crear Cargo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Marcar Pagado Confirm Modal */}
      {showMarkPaidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar pago</h3>
            <p className="text-gray-600 mb-6">¿Marcar este movimiento como pagado?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowMarkPaidModal(null)} className="btn-secondary">Cancelar</button>
              <button
                onClick={() => markPaidMutation.mutate(showMarkPaidModal)}
                disabled={markPaidMutation.isPending}
                className="btn-primary"
              >
                {markPaidMutation.isPending ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuentaCorriente;
