import React from 'react';
import { Users, FileText, TrendingUp, DollarSign, AlertCircle, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api';
import { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats().then(res => res.data),
  });

  const statCards = [
    {
      title: 'Total Clientes',
      value: stats?.totalClientes || 0,
      icon: <Users className="text-blue-600" size={24} />,
      color: 'bg-blue-50',
      change: '+12% desde el mes pasado',
    },
    {
      title: 'Facturas Activas',
      value: stats?.totalFacturas || 0,
      icon: <FileText className="text-green-600" size={24} />,
      color: 'bg-green-50',
      change: `${stats?.facturasPendientes || 0} pendientes`,
    },
    {
      title: 'Ingresos del Mes',
      value: `$${(stats?.ingresosMes || 0).toLocaleString('es-AR')}`,
      icon: <DollarSign className="text-purple-600" size={24} />,
      color: 'bg-purple-50',
      change: `${(stats?.variacionIngresos || 0) > 0 ? '+' : ''}${stats?.variacionIngresos || 0}% vs mes anterior`,
    },
    {
      title: 'Facturas Pagadas',
      value: stats?.facturasPagadas || 0,
      icon: <TrendingUp className="text-orange-600" size={24} />,
      color: 'bg-orange-50',
      change: '87% tasa de cobro',
    },
  ];

  const recentActivities = [
    { id: 1, user: 'María González', action: 'creó factura', target: '#FAC-2024-00123', time: 'Hace 5 minutos' },
    { id: 2, user: 'Carlos López', action: 'actualizó cliente', target: 'Tech Solutions SA', time: 'Hace 15 minutos' },
    { id: 3, user: 'Ana Martínez', action: 'generó reporte PDF', target: 'Balance Mensual', time: 'Hace 1 hora' },
    { id: 4, user: 'Pedro Sánchez', action: 'envió a AFIP', target: '#FAC-2024-00122', time: 'Hace 2 horas' },
    { id: 5, user: 'Laura Fernández', action: 'creó cliente nuevo', target: 'Global Logistics', time: 'Hace 3 horas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general de tu estudio contable</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ingresos Mensuales</h3>
              <p className="text-sm text-gray-500">Últimos 6 meses</p>
            </div>
            <Calendar className="text-gray-400" size={20} />
          </div>
          
          {/* Simple chart placeholder */}
          <div className="space-y-4">
            {[
              { month: 'Ene', value: 85 },
              { month: 'Feb', value: 92 },
              { month: 'Mar', value: 78 },
              { month: 'Abr', value: 95 },
              { month: 'May', value: 88 },
              { month: 'Jun', value: 100 },
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-12 text-sm text-gray-500">{item.month}</div>
                <div className="flex-1 ml-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 rounded-full h-2" 
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-medium">${(item.value * 1000).toLocaleString('es-AR')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
              <p className="text-sm text-gray-500">Últimas acciones en el sistema</p>
            </div>
            <AlertCircle className="text-gray-400" size={20} />
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-500">
                    {activity.action} <span className="font-medium">{activity.target}</span>
                  </p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Nueva Factura</p>
                <p className="text-sm text-gray-500">Crear factura rápidamente</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Agregar Cliente</p>
                <p className="text-sm text-gray-500">Registrar nuevo cliente</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Generar Reporte</p>
                <p className="text-sm text-gray-500">Reporte mensual PDF</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;