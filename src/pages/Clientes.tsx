import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../lib/api';
import { Cliente } from '../types';
import ClienteFormModal from '../components/Clientes/ClienteFormModal';

const Clientes: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const queryClient = useQueryClient();

  const { data: clientes, isLoading } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.getAll().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const filteredClientes = clientes?.filter(cliente =>
    cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
    cliente.email.toLowerCase().includes(search.toLowerCase()) ||
    cliente.numeroDocumento.includes(search)
  );

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      deleteMutation.mutate(id);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return <span className="badge-success">Activo</span>;
      case 'INACTIVO':
        return <span className="badge-error">Inactivo</span>;
      default:
        return <span className="badge-warning">{estado}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-2">Gestiona tus clientes y su información</p>
        </div>
        <button
          onClick={() => {
            setSelectedCliente(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Filter size={20} />
          <span>Filtrar</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Clientes</p>
          <p className="text-2xl font-bold text-gray-900">{filteredClientes?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Clientes Activos</p>
          <p className="text-2xl font-bold text-gray-900">
            {filteredClientes?.filter(c => c.estado === 'ACTIVO').length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Nuevos este mes</p>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
      </div>

      {/* Clientes Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Documento</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Contacto</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Fecha Registro</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Cargando clientes...
                  </td>
                </tr>
              ) : filteredClientes?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                filteredClientes?.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{cliente.nombre}</p>
                        <p className="text-sm text-gray-500">{cliente.tipoDocumento}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium">{cliente.numeroDocumento}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-900">{cliente.email}</p>
                      <p className="text-sm text-gray-500">{cliente.telefono}</p>
                    </td>
                    <td className="py-4 px-4">
                      {getEstadoBadge(cliente.estado)}
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {new Date(cliente.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
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

      {/* Modal */}
      {showModal && (
        <ClienteFormModal
          cliente={selectedCliente}
          onClose={() => {
            setShowModal(false);
            setSelectedCliente(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            setShowModal(false);
            setSelectedCliente(null);
          }}
        />
      )}
    </div>
  );
};

export default Clientes;