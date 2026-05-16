import React, { useState, useEffect } from 'react';
import { Save, User, CreditCard, Shield, Bell, Globe, CheckCircle, AlertTriangle, Loader2, Lock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi, authApi } from '../lib/api';

const Configuracion: React.FC = () => {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: tenantConfig, isLoading } = useQuery({
    queryKey: ['tenant-config'],
    queryFn: () => tenantApi.getMyConfig().then(res => res.data),
  });

  const [settings, setSettings] = useState({
    empresa: {
      nombre: '',
      cuit: '',
      email: '',
    },
    facturacion: {
      puntoVenta: 1,
      iva: 21,
      monedaDefault: 'ARS',
      diasVencimiento: 30,
    },
    notificaciones: {
      emailFacturas: true,
      emailRecordatorios: true,
      emailReportes: false,
    },
  });

  useEffect(() => {
    if (tenantConfig) {
      setSettings(prev => ({
        ...prev,
        empresa: {
          nombre: tenantConfig.razonSocial || '',
          cuit: tenantConfig.cuit || '',
          email: tenantConfig.emailContacto || '',
        },
      }));
    }
  }, [tenantConfig]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => tenantApi.updateMyConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-config'] });
      setSuccessMsg('Configuracion guardada exitosamente');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Error al guardar configuracion');
    },
  });

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => authApi.changePassword(data),
    onSuccess: () => {
      setSuccessMsg('Contraseña actualizada correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Error al cambiar contraseña');
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    updateMutation.mutate({
      razonSocial: settings.empresa.nombre,
      cuit: settings.empresa.cuit,
      emailContacto: settings.empresa.email,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
        <span className="ml-2 text-gray-600">Cargando configuracion...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertTriangle size={18} className="mr-2" />
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle size={18} className="mr-2" />
          {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuracion</h1>
          <p className="text-gray-600 mt-2">Personaliza los datos de tu estudio contable</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          <span>{updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>

      {/* Datos de la Empresa */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <User className="text-blue-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">Datos de la Empresa</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Razon Social *</label>
            <input
              type="text"
              value={settings.empresa.nombre}
              onChange={(e) => handleChange('empresa', 'nombre', e.target.value)}
              className="input-field"
              placeholder="Nombre del estudio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CUIT *</label>
            <input
              type="text"
              value={settings.empresa.cuit}
              onChange={(e) => handleChange('empresa', 'cuit', e.target.value)}
              className="input-field"
              placeholder="30-12345678-9"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email de Contacto *</label>
            <input
              type="email"
              value={settings.empresa.email}
              onChange={(e) => handleChange('empresa', 'email', e.target.value)}
              className="input-field"
              placeholder="contacto@estudio.com"
            />
          </div>
        </div>
      </div>

      {/* Facturacion */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="text-green-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">Facturacion</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Punto de Venta Default</label>
            <input
              type="number"
              value={settings.facturacion.puntoVenta}
              onChange={(e) => handleChange('facturacion', 'puntoVenta', parseInt(e.target.value) || 1)}
              className="input-field"
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">IVA Default (%)</label>
            <input
              type="number"
              value={settings.facturacion.iva}
              onChange={(e) => handleChange('facturacion', 'iva', parseInt(e.target.value) || 0)}
              className="input-field"
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moneda Default</label>
            <select
              value={settings.facturacion.monedaDefault}
              onChange={(e) => handleChange('facturacion', 'monedaDefault', e.target.value)}
              className="input-field"
            >
              <option value="ARS">Pesos (ARS)</option>
              <option value="USD">Dolares (USD)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dias Vencimiento</label>
            <input
              type="number"
              value={settings.facturacion.diasVencimiento}
              onChange={(e) => handleChange('facturacion', 'diasVencimiento', parseInt(e.target.value) || 0)}
              className="input-field"
              min={0}
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Los valores de facturacion se usan como defaults al crear nuevas facturas.
        </p>
      </div>

      {/* Notificaciones */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="text-purple-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">Notificaciones por Email</h2>
        </div>
        <div className="space-y-4">
          {[
            { id: 'emailFacturas', label: 'Enviar email al emitir factura' },
            { id: 'emailRecordatorios', label: 'Recordatorios de vencimiento' },
            { id: 'emailReportes', label: 'Reportes mensuales' },
          ].map((item) => (
            <label key={item.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificaciones[item.id as keyof typeof settings.notificaciones] as boolean}
                onChange={(e) => handleChange('notificaciones', item.id, e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Las notificaciones se envian a los emails configurados en cada cliente.
        </p>
      </div>

      {/* Cambiar Contraseña */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="text-red-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">Cambiar Contraseña</h2>
        </div>
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="input-field"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="input-field"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              <span>{changePasswordMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Integraciones */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="text-orange-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">Integraciones</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">AFIP</p>
              <p className="text-sm text-gray-500">Facturacion electronica oficial</p>
            </div>
            <a href="/admin" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Configurar en Admin SaaS →
            </a>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">MercadoPago</p>
              <p className="text-sm text-gray-500">Links de pago para clientes</p>
            </div>
            <a href="/admin" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Configurar en Admin SaaS →
            </a>
          </div>
        </div>
      </div>

      {/* Informacion del Sistema */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="text-gray-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">Informacion del Sistema</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Version</span>
            <span className="font-medium">2.1.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Estado API Gateway</span>
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
