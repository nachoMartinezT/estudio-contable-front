import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Download, AlertCircle, FileText } from 'lucide-react';
import { ledgerApi, invoicesApi, pdfApi } from '../lib/api';
import { ClientBalance, AccountMovement } from '../types';

const MiCuenta: React.FC = () => {
  const { data: balance, isLoading: balanceLoading } = useQuery<ClientBalance>({
    queryKey: ['myBalance'],
    queryFn: () => ledgerApi.getMyBalance().then((res) => res.data),
  });

  const { data: movements, isLoading: movementsLoading } = useQuery<AccountMovement[]>({
    queryKey: ['myMovements'],
    queryFn: () => ledgerApi.getMyMovements().then((res) => res.data),
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('es-AR') : '-';

  const getStatusBadge = (mov: AccountMovement) => {
    if (mov.paidAt) return { label: 'Pagado', className: 'bg-green-100 text-green-800' };
    if (mov.dueDate) {
      const due = new Date(mov.dueDate);
      const now = new Date();
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return { label: 'Vencido', className: 'bg-red-100 text-red-800' };
      if (diffDays <= 3) return { label: 'Vence pronto', className: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Pendiente', className: 'bg-gray-100 text-gray-700' };
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CARGO_FACTURA: 'Factura',
      CARGO_MANUAL: 'Cargo Manual',
      PAGO_EFECTIVO: 'Pago Efectivo',
      PAGO_TRANSFERENCIA: 'Pago Transferencia',
      PAGO_OTRO: 'Otro Pago',
    };
    return labels[type] || type;
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const res = await pdfApi.generarFactura(String(invoiceId));
      const pdfUrl = res.data?.url;
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    } catch {
      // Silent fail
    }
  };

  const handleOpenMpLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
        <p className="text-gray-600 mt-2">Consulta tu saldo y movimientos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Saldo Actual</p>
          {balanceLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-24 mt-1"></div>
          ) : (
            <p className={`text-2xl font-bold mt-1 ${balance && balance.totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {balance ? formatCurrency(balance.totalDebt) : '$0,00'}
            </p>
          )}
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Último Movimiento</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {balance ? formatDate(balance.lastMovementAt) : '-'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Estado</p>
          <p className={`text-2xl font-bold mt-1 ${balance && balance.totalDebt <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balance && balance.totalDebt <= 0 ? 'Al día' : 'Saldo pendiente'}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimientos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Descripción</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Tipo</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">Monto</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Vencimiento</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movementsLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">Cargando movimientos...</td></tr>
              ) : !movements?.length ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">No hay movimientos registrados</td></tr>
              ) : (
                movements.map((mov) => {
                  const status = getStatusBadge(mov);
                  return (
                    <tr key={mov.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-900">{formatDate(mov.createdAt)}</td>
                      <td className="py-4 px-4 text-gray-900 max-w-[200px] truncate" title={mov.description}>
                        {mov.description || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{getTypeLabel(mov.type)}</span>
                      </td>
                      <td className={`py-4 px-4 text-right font-medium ${mov.direction === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                        {mov.direction === 'DEBIT' ? '-' : '+'}{formatCurrency(mov.amount)}
                      </td>
                      <td className="py-4 px-4 text-gray-500">{formatDate(mov.dueDate)}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {mov.mpPaymentLinkUrl && (
                            <button
                              onClick={() => handleOpenMpLink(mov.mpPaymentLinkUrl!)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Pagar con MercadoPago"
                            >
                              <ExternalLink size={16} />
                            </button>
                          )}
                          {mov.type === 'CARGO_FACTURA' && mov.invoiceId && (
                            <button
                              onClick={() => handleDownloadInvoice(mov.invoiceId!)}
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                              title="Descargar factura"
                            >
                              <FileText size={16} />
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
    </div>
  );
};

export default MiCuenta;
