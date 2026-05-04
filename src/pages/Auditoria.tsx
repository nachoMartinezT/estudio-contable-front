import React, { useState } from 'react';
import { Search, Filter, Clock, User, Database, AlertCircle, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../lib/api';
import { AuditLog } from '../types';

const Auditoria: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterAccion, setFilterAccion] = useState<string>('');

  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: () => auditApi.getLogs().then(res => res.data),
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = 
      log.usuarioNombre.toLowerCase().includes(search.toLowerCase()) ||
      log.accion.toLowerCase().includes(search.toLowerCase()) ||
      log.entidad.toLowerCase().includes(search.toLowerCase());
    
    const matchesAccion = !filterAccion || log.accion === filterAccion;
    
    return matchesSearch && matchesAccion;
  });

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getIconForEntidad = (entidad: string) => {
    switch (entidad) {
      case 'CLIENTE':
        return <User className="text-blue-500" size={16} />;
      case 'FACTURA':
        return <Database className="text-green-500" size={16} />;
      case 'USUARIO':
        return <User className="text-purple-500" size={16} />;
      case 'PDF':
        return <Database className="text-orange-500" size={16} />;
      default:
        return <Database className="text-gray-500" size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const uniqueAcciones = [...new Set(logs?.map(log => log.accion) || [])];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Auditoría</h1>
        <p className="text-gray-600 mt-2">Registro completo de todas las acciones en el sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Registros</p>
          <p className="text-2xl font-bold text-gray-900">{logs?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Hoy</p>
          <p className="text-2xl font-bold text-gray-900">
            {logs?.filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString()).length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Usuarios Activos</p>
          <p className="text-2xl font-bold text-gray-900">
            {[...new Set(logs?.filter(log => log.accion === 'LOGIN').map(log => log.usuarioId))].length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Acciones Críticas</p>
          <p className="text-2xl font-bold text-gray-900">
            {logs?.filter(log => ['DELETE', 'LOGIN_FAILED'].includes(log.accion)).length || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por usuario, acción o entidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterAccion}
          onChange={(e) => setFilterAccion(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Todas las acciones</option>
          {uniqueAcciones.map(accion => (
            <option key={accion} value={accion}>{accion}</option>
          ))}
        </select>
        <button className="btn-secondary flex items-center space-x-2">
          <Filter size={20} />
          <span>Fechas</span>
        </button>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Registros de Auditoría</h3>
            <p className="text-gray-500">Historial completo de acciones en el sistema</p>
          </div>
          <AlertCircle className="text-gray-400" size={20} />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando registros de auditoría...
            </div>
          ) : filteredLogs?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron registros
            </div>
          ) : (
            filteredLogs?.map((log) => (
              <div key={log.id} className="border-l-4 border-gray-200 pl-4 py-4 hover:bg-gray-50 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {getIconForEntidad(log.entidad)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccionColor(log.accion)}`}>
                          {log.accion}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <User className="text-gray-400 mt-0.5" size={16} />
                        <div>
                          <p className="font-medium text-gray-900">{log.usuarioNombre}</p>
                          <p className="text-sm text-gray-500">{log.ipAddress}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Database className="text-gray-400" size={16} />
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{log.entidad}</span>
                            {log.entidadId && <span className="text-gray-500 ml-2">ID: {log.entidadId}</span>}
                          </p>
                        </div>
                      </div>
                      
                      {Object.keys(log.detalles).length > 0 && (
                        <div className="mt-3">
                          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                            <Eye size={14} className="mr-1" />
                            Ver detalles
                          </button>
                          {log.detalles && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              <pre className="whitespace-pre-wrap text-xs">
                                {JSON.stringify(log.detalles, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {log.userAgent?.split(' ')[0] || 'Unknown'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Mostrando {filteredLogs?.length || 0} de {logs?.length || 0} registros
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Anterior
            </button>
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
              1
            </span>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar Registros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center space-x-3">
              <Database className="text-blue-500" size={20} />
              <div>
                <p className="font-medium text-gray-900">CSV Completo</p>
                <p className="text-sm text-gray-500">Exportar todos los registros</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center space-x-3">
              <Database className="text-green-500" size={20} />
              <div>
                <p className="font-medium text-gray-900">Reporte Diario</p>
                <p className="text-sm text-gray-500">Registros del día de hoy</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center space-x-3">
              <Database className="text-purple-500" size={20} />
              <div>
                <p className="font-medium text-gray-900">Acciones Críticas</p>
                <p className="text-sm text-gray-500">DELETE, LOGIN_FAILED</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;