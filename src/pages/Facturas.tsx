import React, { useState, useMemo } from 'react';
import { Plus, Search, FileText, X, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { invoicesApi, clientsApi } from '../lib/api';
import { Factura, Cliente } from '../types';

const invoiceSchema = z.object({
  clientId: z.string({ required_error: 'Selecciona un cliente' }).min(1, 'Selecciona un cliente'),
  numeroFactura: z.string().optional(),
  fechaEmision: z.string().min(1, 'Fecha requerida'),
  items: z.array(z.object({
    concepto: z.string().min(1, 'Descripción requerida'),
    cantidad: z.number({ required_error: 'Cantidad requerida' }).min(1, 'Mínimo 1'),
    precioUnitario: z.number({ required_error: 'Precio requerido' }).min(0.01, 'Mínimo $0.01'),
  })).min(1, 'Agrega al menos un item'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const Facturas: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: facturas, isLoading } = useQuery<Factura[]>({
    queryKey: ['facturas'],
    queryFn: () => invoicesApi.getAll().then(res => {
      const data = res.data;
      return Array.isArray(data) ? data : (data?.content || []);
    }),
  });

  const { data: clients } = useQuery<Cliente[]>({
    queryKey: ['clients-for-invoice'],
    queryFn: () => clientsApi.getAll().then(res => res.data),
  });

  const clientsMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients?.forEach(c => { map[String(c.id)] = c.razonSocial; });
    return map;
  }, [clients]);

  const createMutation = useMutation({
    mutationFn: (data: InvoiceFormData) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      setShowCreateModal(false);
      createForm.reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Error al crear factura');
    },
  });

  const createForm = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      fechaEmision: new Date().toISOString().split('T')[0],
      items: [{ concepto: '', cantidad: 1, precioUnitario: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: createForm.control, name: 'items' });

  const items = createForm.watch('items');
  const totalFactura = items?.reduce((sum, item) => sum + ((item.cantidad || 0) * (item.precioUnitario || 0)), 0) || 0;

  const filteredFacturas = facturas?.filter(factura => {
    const nombre = clientsMap[String(factura.clientId)] || '';
    const matchesSearch = factura.numeroFactura?.toLowerCase().includes(search.toLowerCase()) ||
                          nombre.toLowerCase().includes(search.toLowerCase());
    const matchesEstado = !filterEstado || factura.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, JSX.Element> = {
      'BORRADOR': <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Borrador</span>,
      'EMITIDA_AFIP': <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">AFIP</span>,
      'PAGADA': <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Pagada</span>,
      'ANULADA': <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Anulada</span>,
      'ENVIADA_AFIP': <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">AFIP</span>,
    };
    return badges[estado] || <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{estado}</span>;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X size={16} /></button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600 mt-2">Gestiona y emite facturas para tus clientes</p>
        </div>
        <button onClick={() => { setShowCreateModal(true); setErrorMsg(''); }} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nueva Factura</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Buscar por número, cliente..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
          <option value="">Todos los estados</option>
          <option value="BORRADOR">Borrador</option>
          <option value="EMITIDA_AFIP">Emitida AFIP</option>
          <option value="PAGADA">Pagada</option>
          <option value="ANULADA">Anulada</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Factura</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Total</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">Cargando facturas...</td></tr>
              ) : !filteredFacturas?.length ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No se encontraron facturas</td></tr>
              ) : (
                filteredFacturas.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{f.numeroFactura || `#${f.id}`}</p>
                      {f.cae && <p className="text-xs text-gray-500">CAE: {f.cae}</p>}
                    </td>
                    <td className="py-4 px-4 text-gray-900">{clientsMap[String(f.clientId)] || `ID: ${f.clientId}`}</td>
                    <td className="py-4 px-4 text-gray-500">{f.fechaEmision ? new Date(f.fechaEmision).toLocaleDateString('es-AR') : '-'}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">{formatCurrency(f.total || 0)}</td>
                    <td className="py-4 px-4">{getEstadoBadge(f.estado)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Nueva Factura</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select {...createForm.register('clientId')} className="input-field">
                    <option value="">Seleccionar...</option>
                    {clients?.map(c => <option key={c.id} value={String(c.id)}>{c.razonSocial}</option>)}
                  </select>
                  {createForm.formState.errors.clientId && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.clientId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° Factura</label>
                  <input {...createForm.register('numeroFactura')} className="input-field" placeholder="Auto-generado" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Emisión *</label>
                  <input type="date" {...createForm.register('fechaEmision')} className="input-field" />
                  {createForm.formState.errors.fechaEmision && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.fechaEmision.message}</p>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Items *</label>
                  <button type="button" onClick={() => append({ concepto: '', cantidad: 1, precioUnitario: 0 })}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Agregar item</button>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700">Concepto</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700 w-20">Cant.</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700 w-28">Precio Unit.</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700 w-28">Subtotal</th>
                        <th className="py-2 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td className="py-2 px-3">
                            <input {...createForm.register(`items.${index}.concepto`)} className="input-field py-1 text-sm" placeholder="Descripción" />
                          </td>
                          <td className="py-2 px-3">
                            <input type="number" min="1" {...createForm.register(`items.${index}.cantidad`, { valueAsNumber: true })} className="input-field py-1 text-sm" />
                          </td>
                          <td className="py-2 px-3">
                            <input type="number" step="0.01" min="0.01" {...createForm.register(`items.${index}.precioUnitario`, { valueAsNumber: true })} className="input-field py-1 text-sm" />
                          </td>
                          <td className="py-2 px-3 text-sm font-medium">
                            {formatCurrency((items?.[index]?.cantidad || 0) * (items?.[index]?.precioUnitario || 0))}
                          </td>
                          <td className="py-2 px-3">
                            {fields.length > 1 && (
                              <button type="button" onClick={() => remove(index)} className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {createForm.formState.errors.items && (
                  <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.items.message || 'Error en los items'}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-lg font-bold text-gray-900">Total: {formatCurrency(totalFactura)}</p>
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancelar</button>
                  <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                    {createMutation.isPending ? 'Creando...' : 'Crear Factura'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturas;
