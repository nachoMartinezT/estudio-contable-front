import React, { useState, useMemo } from 'react';
import { Plus, Search, FileText, X, Trash2, Send, Ban, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { invoicesApi, clientsApi } from '../lib/api';
import { Factura, Cliente } from '../types';

const invoiceSchema = z.object({
  clientId: z.coerce.number({ required_error: 'Selecciona un cliente' }).min(1, 'Selecciona un cliente'),
  numeroFactura: z.string().optional(),
  fechaEmision: z.string().min(1, 'Fecha requerida'),
  tipoComprobante: z.coerce.number().min(1, 'Tipo requerido'),
  puntoVenta: z.coerce.number().min(1, 'Punto de venta requerido'),
  concepto: z.coerce.number().min(1, 'Concepto requerido'),
  tipoDocumento: z.coerce.number().min(1, 'Tipo documento requerido'),
  numeroDocumento: z.coerce.number().min(1, 'Numero documento requerido'),
  nombreCliente: z.string().min(1, 'Nombre cliente requerido'),
  condicionIvaReceptorId: z.coerce.number().min(1, 'Condicion IVA requerida'),
  monedaId: z.string().min(1, 'Moneda requerida'),
  monedaCotiz: z.coerce.number().min(0.01, 'Cotizacion requerida'),
  fechaServicioDesde: z.string().optional(),
  fechaServicioHasta: z.string().optional(),
  fechaVencimientoPago: z.string().optional(),
  impTotConc: z.coerce.number().min(0, 'No puede ser negativo').optional(),
  impOpEx: z.coerce.number().min(0, 'No puede ser negativo').optional(),
  impTrib: z.coerce.number().min(0, 'No puede ser negativo').optional(),
  impIVA: z.coerce.number().min(0, 'No puede ser negativo').optional(),
  items: z.array(z.object({
    concepto: z.string().min(1, 'Descripcion requerida'),
    cantidad: z.number({ required_error: 'Cantidad requerida' }).min(1, 'Minimo 1'),
    precioUnitario: z.number({ required_error: 'Precio requerido' }).min(0.01, 'Minimo $0.01'),
  })).min(1, 'Agrega al menos un item'),
  emitirAfip: z.boolean().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const TIPOS_COMPROBANTE = [
  { value: 1, label: 'Factura A' },
  { value: 2, label: 'Nota de Debito A' },
  { value: 3, label: 'Nota de Credito A' },
  { value: 6, label: 'Factura B' },
  { value: 7, label: 'Nota de Debito B' },
  { value: 8, label: 'Nota de Credito B' },
  { value: 11, label: 'Factura C' },
  { value: 13, label: 'Nota de Credito C' },
];

const TIPOS_DOCUMENTO = [
  { value: 80, label: 'CUIT' },
  { value: 86, label: 'CUIL' },
  { value: 96, label: 'DNI' },
  { value: 99, label: 'Sin identificar' },
];

const CONDICIONES_IVA = [
  { value: 1, label: 'Responsable Inscripto' },
  { value: 2, label: 'Responsable no Inscripto' },
  { value: 3, label: 'No Responsable' },
  { value: 4, label: 'Sujeto Exento' },
  { value: 5, label: 'Consumidor Final' },
  { value: 6, label: 'Monotributo' },
  { value: 7, label: 'Sujeto no Categorizado' },
  { value: 8, label: 'Importador' },
  { value: 9, label: 'Entidad Exenta' },
  { value: 10, label: 'Responsable Monotributo' },
  { value: 11, label: 'Gran Contribuyente' },
  { value: 12, label: 'Pequeno Contribuyente Eventual' },
  { value: 13, label: 'Sujeto no Categorizado' },
];

const CONCEPTOS = [
  { value: 1, label: 'Productos / Bienes' },
  { value: 2, label: 'Servicios' },
  { value: 3, label: 'Productos y Servicios' },
];

const MONEDAS = [
  { value: 'PES', label: 'Pesos Argentinos (ARS)' },
  { value: 'DOL', label: 'Dolares (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
];

const Facturas: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmitirModal, setShowEmitirModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
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

  const clientCuitMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients?.forEach(c => { map[String(c.id)] = c.cuit; });
    return map;
  }, [clients]);

  const createMutation = useMutation({
    mutationFn: (data: InvoiceFormData) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      setShowCreateModal(false);
      createForm.reset();
      setSuccessMsg('Factura creada exitosamente');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Error al crear factura');
    },
  });

  const emitirMutation = useMutation({
    mutationFn: (data: { invoiceId: number } & Record<string, any>) => invoicesApi.emitir(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      setShowEmitirModal(false);
      setSelectedFactura(null);
      setSuccessMsg('Factura emitida a AFIP exitosamente');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Error al emitir factura en AFIP');
    },
  });

  const anularMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.anular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      setSuccessMsg('Factura anulada exitosamente');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Error al anular factura');
    },
  });

  const createForm = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      fechaEmision: new Date().toISOString().split('T')[0],
      tipoComprobante: 6,
      puntoVenta: 4,
      concepto: 2,
      tipoDocumento: 80,
      numeroDocumento: undefined,
      nombreCliente: '',
      condicionIvaReceptorId: 5,
      monedaId: 'PES',
      monedaCotiz: 1,
      fechaServicioDesde: '',
      fechaServicioHasta: '',
      fechaVencimientoPago: '',
      impTotConc: 0,
      impOpEx: 0,
      impTrib: 0,
      impIVA: 0,
      items: [{ concepto: '', cantidad: 1, precioUnitario: 0 }],
      emitirAfip: false,
    },
  });

  const { fields, append, remove } = useFieldArray({ control: createForm.control, name: 'items' });

  const items = createForm.watch('items');
  const watchClientId = createForm.watch('clientId');
  const watchCondicionIva = createForm.watch('condicionIvaReceptorId');
  const watchTipoComprobante = createForm.watch('tipoComprobante');

  const subtotalItems = items?.reduce((sum, item) => sum + ((item.cantidad || 0) * (item.precioUnitario || 0)), 0) || 0;
  const impIVA = createForm.watch('impIVA') || 0;
  const impTrib = createForm.watch('impTrib') || 0;
  const impOpEx = createForm.watch('impOpEx') || 0;
  const impTotConc = createForm.watch('impTotConc') || 0;
  const totalFactura = subtotalItems + impIVA + impTrib + impOpEx + impTotConc;

  React.useEffect(() => {
    if (watchClientId && clients) {
      const client = clients.find(c => Number(c.id) === Number(watchClientId));
      if (client) {
        createForm.setValue('nombreCliente', client.razonSocial);
        createForm.setValue('numeroDocumento', Number(client.cuit?.replace(/-/g, '')) || 0);
      }
    }
  }, [watchClientId, clients, createForm]);

  React.useEffect(() => {
    const tieneIva = watchTipoComprobante === 1 || watchTipoComprobante === 2 || watchTipoComprobante === 3;
    if (tieneIva) {
      const ivaCalculado = Number((subtotalItems * 0.21).toFixed(2));
      createForm.setValue('impIVA', ivaCalculado, { shouldValidate: false });
    } else {
      createForm.setValue('impIVA', 0, { shouldValidate: false });
    }
  }, [subtotalItems, watchTipoComprobante, createForm]);

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

  const handleEmitir = (factura: Factura) => {
    setSelectedFactura(factura);
    setShowEmitirModal(true);
  };

  const handleAnular = (factura: Factura) => {
    if (window.confirm('Estas seguro de que deseas anular esta factura? Esta accion no se puede deshacer.')) {
      anularMutation.mutate(String(factura.id));
    }
  };

  const handleEmitirConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFactura) return;
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {
      invoiceId: Number(selectedFactura.id),
      tipoComprobante: Number(formData.get('tipoComprobante')),
      puntoVenta: Number(formData.get('puntoVenta')),
      concepto: Number(formData.get('concepto')),
      tipoDocumento: Number(formData.get('tipoDocumento')),
      numeroDocumento: Number(formData.get('numeroDocumento')),
      nombreCliente: formData.get('nombreCliente'),
      condicionIvaReceptorId: Number(formData.get('condicionIvaReceptorId')),
      monedaId: formData.get('monedaId'),
      monedaCotiz: Number(formData.get('monedaCotiz')),
      impIVA: Number(formData.get('impIVA') || 0),
      impTrib: Number(formData.get('impTrib') || 0),
      impOpEx: Number(formData.get('impOpEx') || 0),
      impTotConc: Number(formData.get('impTotConc') || 0),
    };
    const fDesde = formData.get('fechaServicioDesde');
    const fHasta = formData.get('fechaServicioHasta');
    const fVto = formData.get('fechaVencimientoPago');
    if (fDesde) data.fechaServicioDesde = fDesde;
    if (fHasta) data.fechaServicioHasta = fHasta;
    if (fVto) data.fechaVencimientoPago = fVto;
    emitirMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X size={16} /></button>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X size={16} /></button>
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
          <input type="text" placeholder="Buscar por numero, cliente..." value={search}
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
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Cargando facturas...</td></tr>
              ) : !filteredFacturas?.length ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No se encontraron facturas</td></tr>
              ) : (
                filteredFacturas.map((f) => (
                  <tr key={String(f.id)} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{f.numeroFactura || `#${f.id}`}</p>
                      {f.cae && <p className="text-xs text-gray-500">CAE: {f.cae}</p>}
                    </td>
                    <td className="py-4 px-4 text-gray-900">{clientsMap[String(f.clientId)] || `ID: ${f.clientId}`}</td>
                    <td className="py-4 px-4 text-gray-500">{f.fechaEmision ? new Date(f.fechaEmision).toLocaleDateString('es-AR') : '-'}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">{formatCurrency(f.total || 0)}</td>
                    <td className="py-4 px-4">{getEstadoBadge(f.estado)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {f.estado === 'BORRADOR' && (
                          <>
                            <button
                              onClick={() => handleEmitir(f)}
                              disabled={emitirMutation.isPending}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Emitir factura en AFIP"
                            >
                              <Send size={14} />
                              <span>{emitirMutation.isPending ? 'Emitiendo...' : 'Emitir'}</span>
                            </button>
                            <button
                              onClick={() => handleAnular(f)}
                              disabled={anularMutation.isPending}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Anular factura"
                            >
                              <Ban size={14} />
                              <span>Anular</span>
                            </button>
                          </>
                        )}
                        {f.estado === 'EMITIDA_AFIP' && (
                          <span className="text-sm text-green-600 font-medium">Emitida</span>
                        )}
                        {f.estado === 'ANULADA' && (
                          <span className="text-sm text-red-500 font-medium">Anulada</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEmitirModal && selectedFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Emitir Factura en AFIP</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Factura {selectedFactura.numeroFactura || `#${selectedFactura.id}`} - {clientsMap[String(selectedFactura.clientId)] || 'Cliente'}
                </p>
              </div>
              <button onClick={() => { setShowEmitirModal(false); setSelectedFactura(null); setErrorMsg(''); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="p-4 mx-6 mt-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
              <AlertTriangle size={18} className="text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-sm text-yellow-800">
                Esta accion emitira la factura oficialmente ante AFIP. Una vez emitida, no podra ser modificada ni anulada desde el sistema.
              </p>
            </div>

            <form onSubmit={handleEmitirConfirm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Comprobante *</label>
                  <select name="tipoComprobante" defaultValue={selectedFactura.tipoComprobante || 6} className="input-field" required>
                    {TIPOS_COMPROBANTE.map(tc => (
                      <option key={tc.value} value={tc.value}>{tc.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Punto de Venta *</label>
                  <input type="number" name="puntoVenta" defaultValue={selectedFactura.puntoVenta || 4} className="input-field" required min={1} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
                  <select name="concepto" defaultValue={1} className="input-field" required>
                    {CONCEPTOS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condicion IVA Receptor *</label>
                  <select name="condicionIvaReceptorId" defaultValue={5} className="input-field" required>
                    {CONDICIONES_IVA.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Fechas de Servicio (requerido para Servicios)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Servicio Desde</label>
                    <input type="date" name="fechaServicioDesde" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Servicio Hasta</label>
                    <input type="date" name="fechaServicioHasta" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Vto. Pago</label>
                    <input type="date" name="fechaVencimientoPago" className="input-field text-sm" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento *</label>
                  <select name="tipoDocumento" defaultValue={80} className="input-field" required>
                    {TIPOS_DOCUMENTO.map(td => (
                      <option key={td.value} value={td.value}>{td.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numero Documento *</label>
                  <input type="number" name="numeroDocumento" defaultValue={clientCuitMap[String(selectedFactura.clientId)]?.replace(/-/g, '') || ''} className="input-field" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Cliente *</label>
                <input type="text" name="nombreCliente" defaultValue={clientsMap[String(selectedFactura.clientId)] || ''} className="input-field" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda *</label>
                  <select name="monedaId" defaultValue="PES" className="input-field" required>
                    {MONEDAS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cotizacion Moneda *</label>
                  <input type="number" name="monedaCotiz" defaultValue={1} step="0.01" min="0.01" className="input-field" required />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Importes AFIP</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">IVA</label>
                    <input type="number" name="impIVA" defaultValue={0} step="0.01" min="0" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tributos</label>
                    <input type="number" name="impTrib" defaultValue={0} step="0.01" min="0" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Op. Exentas</label>
                    <input type="number" name="impOpEx" defaultValue={0} step="0.01" min="0" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">No Gravado</label>
                    <input type="number" name="impTotConc" defaultValue={0} step="0.01" min="0" className="input-field text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total a facturar:</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedFactura.total || 0)}</span>
                </div>
              </div>

              {emitirMutation.isPending && (
                <div className="flex items-center justify-center space-x-2 py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  <span className="text-sm text-gray-600">Emitiendo en AFIP...</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => { setShowEmitirModal(false); setSelectedFactura(null); }} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={emitirMutation.isPending} className="btn-primary flex items-center space-x-2 disabled:opacity-50">
                  <Send size={16} />
                  <span>{emitirMutation.isPending ? 'Emitiendo...' : 'Confirmar Emision'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">N Factura</label>
                  <input {...createForm.register('numeroFactura')} className="input-field" placeholder="Auto-generado" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Emision *</label>
                  <input type="date" {...createForm.register('fechaEmision')} className="input-field" />
                  {createForm.formState.errors.fechaEmision && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.fechaEmision.message}</p>}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Datos AFIP</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Comprobante *</label>
                    <select {...createForm.register('tipoComprobante')} className="input-field">
                      {TIPOS_COMPROBANTE.map(tc => (
                        <option key={tc.value} value={tc.value}>{tc.label}</option>
                      ))}
                    </select>
                    {createForm.formState.errors.tipoComprobante && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.tipoComprobante.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Punto de Venta *</label>
                    <input type="number" {...createForm.register('puntoVenta', { valueAsNumber: true })} className="input-field" />
                    {createForm.formState.errors.puntoVenta && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.puntoVenta.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
                    <select {...createForm.register('concepto', { valueAsNumber: true })} className="input-field">
                      {CONCEPTOS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento *</label>
                    <select {...createForm.register('tipoDocumento', { valueAsNumber: true })} className="input-field">
                      {TIPOS_DOCUMENTO.map(td => (
                        <option key={td.value} value={td.value}>{td.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numero Documento *</label>
                    <input type="number" {...createForm.register('numeroDocumento', { valueAsNumber: true })} className="input-field" />
                    {createForm.formState.errors.numeroDocumento && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.numeroDocumento.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condicion IVA *</label>
                    <select {...createForm.register('condicionIvaReceptorId', { valueAsNumber: true })} className="input-field">
                      {CONDICIONES_IVA.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Cliente *</label>
                    <input {...createForm.register('nombreCliente')} className="input-field" placeholder="Se auto-completa" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda *</label>
                    <select {...createForm.register('monedaId')} className="input-field">
                      {MONEDAS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cotizacion *</label>
                    <input type="number" step="0.01" {...createForm.register('monedaCotiz', { valueAsNumber: true })} className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Servicio Desde</label>
                    <input type="date" {...createForm.register('fechaServicioDesde')} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Servicio Hasta</label>
                    <input type="date" {...createForm.register('fechaServicioHasta')} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vto. Pago</label>
                    <input type="date" {...createForm.register('fechaVencimientoPago')} className="input-field" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
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
                            <input {...createForm.register(`items.${index}.concepto`)} className="input-field py-1 text-sm" placeholder="Descripcion" />
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

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Importes AFIP</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal Items</label>
                    <input type="number" step="0.01" value={subtotalItems} disabled className="input-field bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IVA</label>
                    <input type="number" step="0.01" {...createForm.register('impIVA', { valueAsNumber: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tributos</label>
                    <input type="number" step="0.01" {...createForm.register('impTrib', { valueAsNumber: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Op. Exentas</label>
                    <input type="number" step="0.01" {...createForm.register('impOpEx', { valueAsNumber: true })} className="input-field" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No Gravado</label>
                    <input type="number" step="0.01" {...createForm.register('impTotConc', { valueAsNumber: true })} className="input-field" />
                  </div>
                  <div className="col-span-3 flex items-end justify-end">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Subtotal: {formatCurrency(subtotalItems)}</p>
                      <p className="text-sm text-gray-500">IVA: {formatCurrency(impIVA)}</p>
                      {(impTrib > 0 || impOpEx > 0 || impTotConc > 0) && (
                        <p className="text-sm text-gray-500">
                          Otros: {formatCurrency(impTrib + impOpEx + impTotConc)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center pt-4 border-t border-gray-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" {...createForm.register('emitirAfip')} className="h-4 w-4 text-primary-600 border-gray-300 rounded" />
                  <span className="text-sm text-gray-700">Emitir directamente a AFIP</span>
                </label>
                <p className="text-xs text-gray-500 ml-4">Si no marca esta opcion, la factura se creara como borrador.</p>
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