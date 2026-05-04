import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, Download, Send, MoreVertical } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '../lib/api';
import { Factura } from '../types';

const Facturas: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');

  const { data: facturas, isLoading } = useQuery<Factura[]>({
    queryKey: ['facturas'],
        queryFn: () => invoicesApi.getAll().then(res => res.data),
  });

  const filteredFacturas = facturas?.filter(factura => {
    const matchesSearch = 
      factura.numero.toLowerCase().includes(search.toLowerCase()) ||
      factura.clienteNombre.toLowerCase().includes(search.toLowerCase());
    
    const matchesEstado = !filterEstado || factura.estado === filterEstado;
    
    return matchesSearch && matchesEstado;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <span className="badge-warning">Pendiente</span>;
      case 'PAGADA':
        return <span className="badge-success">Pagada</span>;
      case 'ANULADA':
        return <span className="badge-error">Anulada</span>;
      case 'ENVIADA_AFIP':
        return <span className="badge-success bg-blue-100 text-blue-800">AFIP</span>;
      default:
        return <span className="badge-warning">{estado}</span>;
    }
  };

  const getTipoFactura = (tipo: string) => {
    const tipos: Record<string, string> = {
      'A': 'Factura A',
      'B': 'Factura B',
      'C': 'Factura C',
      'E': 'Factura E',
      'M': 'Factura M',
    };
    return tipos[tipo] || tipo;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const totalPendiente = filteredFacturas
    ?.filter(f => f.estado === 'PENDIENTE')
    .reduce((sum, f) => sum + f.total, 0) || 0;

  const totalPagado = filteredFacturas
    ?.filter(f => f.estado === 'PAGADA')
    .reduce((sum, f) => sum + f.total, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600 mt-2">Gestiona y emite facturas para tus clientes</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nueva Factura</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Facturas</p>
          <p className="text-2xl font-bold text-gray-900">{filteredFacturas?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Pendiente por Cobrar</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPendiente)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Cobrado</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPagado)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por número, cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADA">Pagada</option>
          <option value="ANULADA">Anulada</option>
          <option value="ENVIADA_AFIP">Enviada AFIP</option>
        </select>
        <button className="btn-secondary flex items-center space-x-2">
          <Filter size={20} />
          <span>Más Filtros</span>
        </button>
      </div>

      {/* Facturas Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Factura</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Tipo</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Total</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Cargando facturas...
                  </td>
                </tr>
              ) : filteredFacturas?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No se encontraron facturas
                  </td>
                </tr>
              ) : (
                filteredFacturas?.map((factura) => (
                  <tr key={factura.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{factura.numero}</p>
                        {factura.afipCAE && (
                          <p className="text-sm text-gray-500">CAE: {factura.afipCAE}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-900">{factura.clienteNombre}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-900">
                        {new Date(factura.fechaEmision).toLocaleDateString('es-AR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vto: {new Date(factura.fechaVencimiento).toLocaleDateString('es-AR')}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {getTipoFactura(factura.tipo)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900">{formatCurrency(factura.total)}</p>
                      <p className="text-sm text-gray-500">{factura.moneda}</p>
                    </td>
                    <td className="py-4 px-4">
                      {getEstadoBadge(factura.estado)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Ver">
                          <FileText size={16} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Descargar">
                          <Download size={16} />
                        </button>
                        {factura.estado === 'PENDIENTE' && (
                          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Enviar a AFIP">
                            <Send size={16} />
                          </button>
                        )}
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Mostrando {filteredFacturas?.length || 0} facturas
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn-secondary">
            <Download className="mr-2" size={16} />
            Exportar CSV
          </button>
          <button className="btn-primary">
            <Send className="mr-2" size={16} />
            Enviar Lote AFIP
          </button>
        </div>
      </div>
    </div>
  );
};

export default Facturas;