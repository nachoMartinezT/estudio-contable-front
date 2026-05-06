import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Trash2, X, Plus, AlertCircle } from 'lucide-react';
import { clientsApi, feesApi } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Cliente, RecurringFee, RecurringFeeOverride } from '../types';

const overrideSchema = z.object({
  yearMonth: z.string().min(1, 'Mes requerido'),
  overrideAmount: z.number({ required_error: 'Monto requerido' }).min(0.01, 'Monto mínimo $0.01'),
  reason: z.string().optional(),
});

const HonorariosRecurrentes: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: clients } = useQuery<Cliente[]>({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then((res) => res.data),
  });

  const { data: recurringFees, isLoading: feesLoading } = useQuery<RecurringFee[]>({
    queryKey: ['recurringFees', selectedClientId],
    queryFn: () => feesApi.getRecurring(selectedClientId).then((res) => res.data),
    enabled: !!selectedClientId,
  });

  const { data: overrides, isLoading: overridesLoading } = useQuery<RecurringFeeOverride[]>({
    queryKey: ['feeOverrides', selectedClientId],
    queryFn: () => feesApi.getOverrides(selectedClientId).then((res) => res.data),
    enabled: !!selectedClientId,
  });

  const recurringFee = recurringFees?.[0];

  const saveRecurringMutation = useMutation({
    mutationFn: (data: { baseAmount?: number; active?: boolean }) =>
      feesApi.saveRecurring(selectedClientId, {
        ...(recurringFee || {}),
        baseAmount: data.baseAmount ?? recurringFee?.baseAmount ?? 0,
        active: data.active ?? recurringFee?.active ?? true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringFees', selectedClientId] });
    },
  });

  const createOverrideMutation = useMutation({
    mutationFn: (data: z.infer<typeof overrideSchema>) =>
      feesApi.createOverride(selectedClientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeOverrides', selectedClientId] });
      setShowOverrideModal(false);
      overrideForm.reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al crear override');
    },
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: (overrideId: string) =>
      feesApi.deleteOverride(selectedClientId, overrideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeOverrides', selectedClientId] });
    },
  });

  const generateNowMutation = useMutation({
    mutationFn: () => feesApi.generateNow(),
    onSuccess: () => {
      setSuccessMsg('Honorarios generados exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        setErrorMsg('Los honorarios ya fueron generados este mes');
      } else {
        setErrorMsg(err.response?.data?.message || 'Error al generar honorarios');
      }
    },
  });

  const overrideForm = useForm<z.infer<typeof overrideSchema>>({
    resolver: zodResolver(overrideSchema),
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const getMonthLabel = (yearMonth: string) => {
    const [, month] = yearMonth.split('-');
    const idx = parseInt(month, 10) - 1;
    return monthNames[idx] || yearMonth;
  };

  const currentYearMonth = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })();

  const currentMonthOverride = overrides?.find((o) => o.yearMonth === currentYearMonth);
  const currentMonthAmount = currentMonthOverride
    ? currentMonthOverride.overrideAmount
    : recurringFee?.baseAmount ?? 0;

  const getFutureMonths = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    return Array.from({ length: 12 - currentMonth + 1 }, (_, i) => {
      const month = currentMonth + i;
      const year = currentYear;
      return { label: monthNames[month - 1], value: `${year}-${String(month).padStart(2, '0')}` };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Honorarios Recurrentes</h1>
        <p className="text-gray-600 mt-2">Configura los honorarios mensuales de tus clientes</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2"><AlertCircle size={18} /><span>{errorMsg}</span></div>
          <button onClick={() => setErrorMsg('')}><X size={16} /></button>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{successMsg}</div>
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
                  <option key={c.id} value={c.id}>{c.razonSocial}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {selectedClientId && !feesLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={recurringFee?.active ?? false}
                    onChange={(e) => saveRecurringMutation.mutate({ active: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto base mensual</label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={recurringFee?.baseAmount ?? 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      saveRecurringMutation.mutate({ baseAmount: val });
                    }}
                    className="input-field w-48"
                  />
                </div>
              </div>
            </div>
            <div className="card flex items-center justify-center">
              <div>
                <p className="text-sm text-gray-500">Este mes se cobrará:</p>
                <p className={`text-3xl font-bold mt-1 ${currentMonthOverride ? 'text-yellow-600' : 'text-green-600'}`}>
                  {formatCurrency(currentMonthAmount)}
                </p>
                {currentMonthOverride && (
                  <p className="text-sm text-yellow-600 mt-1">Override activo: {formatCurrency(currentMonthOverride.overrideAmount)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overrides - Año {new Date().getFullYear()}</h3>
              <div className="flex items-center space-x-2">
                <button onClick={() => { setShowOverrideModal(true); setErrorMsg(''); }} className="btn-primary flex items-center space-x-2">
                  <Plus size={16} />
                  <span>Agregar override</span>
                </button>
                {user?.rol === 'ADMIN' && (
                  <button onClick={() => { generateNowMutation.mutate(); setErrorMsg(''); }} disabled={generateNowMutation.isPending} className="btn-secondary">
                    {generateNowMutation.isPending ? 'Generando...' : 'Generar ahora'}
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Mes</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Monto</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Motivo</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {overridesLoading ? (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-500">Cargando overrides...</td></tr>
                  ) : !overrides?.length ? (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-500">No hay overrides configurados</td></tr>
                  ) : (
                    overrides.map((ov) => (
                      <tr key={ov.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{getMonthLabel(ov.yearMonth)}</td>
                        <td className="py-3 px-4">
                          <span className={ov.overrideAmount !== recurringFee?.baseAmount ? 'text-yellow-600 font-medium' : 'text-gray-900'}>
                            {formatCurrency(ov.overrideAmount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{ov.reason || '-'}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => deleteOverrideMutation.mutate(String(ov.id))}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Eliminar override"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
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
          <p className="text-gray-500">Elige un cliente para configurar sus honorarios recurrentes</p>
        </div>
      )}

      {showOverrideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Agregar Override</h2>
              <button onClick={() => setShowOverrideModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={overrideForm.handleSubmit((data) => createOverrideMutation.mutate(data))} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mes *</label>
                <select {...overrideForm.register('yearMonth')} className="input-field">
                  <option value="">Seleccionar mes...</option>
                  {getFutureMonths().map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                <input type="number" step="0.01" {...overrideForm.register('overrideAmount', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                {overrideForm.formState.errors.overrideAmount && <p className="mt-1 text-sm text-red-600">{overrideForm.formState.errors.overrideAmount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input type="text" {...overrideForm.register('reason')} className="input-field" placeholder="Opcional" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowOverrideModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={createOverrideMutation.isPending} className="btn-primary">
                  {createOverrideMutation.isPending ? 'Creando...' : 'Crear Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HonorariosRecurrentes;
