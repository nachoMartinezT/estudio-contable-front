import React, { useState } from 'react';
import { Save, Bell, Shield, User, Globe, CreditCard, Upload, Key } from 'lucide-react';

const Configuracion: React.FC = () => {
  const [settings, setSettings] = useState({
    empresa: {
      nombre: 'Guida Contable SA',
      cuit: '30-12345678-9',
      direccion: 'Av. Corrientes 1234, CABA',
      telefono: '+54 11 1234-5678',
      email: 'contacto@guidacontable.com',
    },
    facturacion: {
      puntoVenta: 4,
      tipoComprobante: 'Factura A',
      iva: 21,
      monedaDefault: 'ARS',
      diasVencimiento: 30,
    },
    seguridad: {
      requerir2FA: false,
      timeoutSesion: 30,
      registroIntentosFallidos: true,
      maxIntentosLogin: 5,
    },
    notificaciones: {
      emailFacturas: true,
      emailRecordatorios: true,
      emailReportes: false,
      pushNotificaciones: true,
    },
    integraciones: {
      afipHabilitada: true,
      pdfFirmaDigital: false,
      apiExterna: '',
    },
  });

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
    console.log('Guardando configuración:', settings);
    // Aquí iría la llamada API para guardar
    alert('Configuración guardada exitosamente');
  };

  const sections = [
    {
      id: 'empresa',
      title: 'Datos de la Empresa',
      icon: <User className="text-blue-600" size={20} />,
      fields: [
        { id: 'nombre', label: 'Nombre', type: 'text' },
        { id: 'cuit', label: 'CUIT', type: 'text' },
        { id: 'direccion', label: 'Dirección', type: 'text' },
        { id: 'telefono', label: 'Teléfono', type: 'tel' },
        { id: 'email', label: 'Email', type: 'email' },
      ],
    },
    {
      id: 'facturacion',
      title: 'Facturación',
      icon: <CreditCard className="text-green-600" size={20} />,
      fields: [
        { id: 'puntoVenta', label: 'Punto de Venta', type: 'number' },
        { id: 'tipoComprobante', label: 'Tipo Comprobante', type: 'select', options: ['Factura A', 'Factura B', 'Factura C', 'Factura E', 'Factura M'] },
        { id: 'iva', label: 'IVA (%)', type: 'number' },
        { id: 'monedaDefault', label: 'Moneda Default', type: 'select', options: ['ARS', 'USD'] },
        { id: 'diasVencimiento', label: 'Días Vencimiento', type: 'number' },
      ],
    },
    {
      id: 'seguridad',
      title: 'Seguridad',
      icon: <Shield className="text-red-600" size={20} />,
      fields: [
        { id: 'requerir2FA', label: 'Requerir 2FA', type: 'checkbox' },
        { id: 'timeoutSesion', label: 'Timeout Sesión (min)', type: 'number' },
        { id: 'registroIntentosFallidos', label: 'Registrar Intentos Fallidos', type: 'checkbox' },
        { id: 'maxIntentosLogin', label: 'Máx. Intentos Login', type: 'number' },
      ],
    },
    {
      id: 'notificaciones',
      title: 'Notificaciones',
      icon: <Bell className="text-purple-600" size={20} />,
      fields: [
        { id: 'emailFacturas', label: 'Email Nueva Factura', type: 'checkbox' },
        { id: 'emailRecordatorios', label: 'Email Recordatorios', type: 'checkbox' },
        { id: 'emailReportes', label: 'Email Reportes Mensuales', type: 'checkbox' },
        { id: 'pushNotificaciones', label: 'Notificaciones Push', type: 'checkbox' },
      ],
    },
    {
      id: 'integraciones',
      title: 'Integraciones',
      icon: <Globe className="text-orange-600" size={20} />,
      fields: [
        { id: 'afipHabilitada', label: 'AFIP Habilitada', type: 'checkbox' },
        { id: 'pdfFirmaDigital', label: 'Firma Digital PDF', type: 'checkbox' },
        { id: 'apiExterna', label: 'API Externa URL', type: 'text' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2">Personaliza y configura tu sistema</p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center space-x-2"
        >
          <Save size={20} />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {/* Configuration Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="card">
            <div className="flex items-center space-x-3 mb-6">
              {section.icon}
              <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.fields.map((field) => {
                const sectionData = settings[section.id as keyof typeof settings];
                const value = sectionData[field.id as keyof typeof sectionData];

                return (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    
                    {field.type === 'checkbox' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => handleChange(section.id, field.id, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Habilitado</span>
                      </div>
                    ) : field.type === 'select' ? (
                      <select
                        value={value as string}
                        onChange={(e) => handleChange(section.id, field.id, e.target.value)}
                        className="input-field"
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={value as string | number}
                        onChange={(e) => handleChange(section.id, field.id, field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                        className="input-field"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate Upload */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="text-yellow-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Certificado AFIP</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto text-gray-400 mb-4" size={32} />
              <p className="text-gray-600 mb-2">Arrastra y suelta tu certificado .p12</p>
              <p className="text-sm text-gray-500 mb-4">o haz clic para seleccionar</p>
              <button className="btn-secondary">
                Seleccionar Archivo
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              <p className="mb-2">Requisitos del certificado:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Formato .p12 o .pfx</li>
                <li>Vigente y válido</li>
                <li>Clave privada incluida</li>
                <li>Certificado emitido por AFIP</li>
              </ul>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="text-gray-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Información del Sistema</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Versión</span>
              <span className="font-medium">2.1.0</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Última Actualización</span>
              <span className="font-medium">15 Ene 2024</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Usuarios Activos</span>
              <span className="font-medium">12</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Espacio Usado</span>
              <span className="font-medium">245 MB / 5 GB</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Estado API Gateway</span>
              <span className="badge-success">Online</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Estado AFIP</span>
              <span className="badge-success">Conectado</span>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="btn-secondary w-full">
              Ver Logs del Sistema
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 bg-red-50">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="text-red-600" size={20} />
          <h2 className="text-xl font-semibold text-red-900">Zona de Peligro</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-red-700">
            Estas acciones son irreversibles. Procede con precaución.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border border-red-300 bg-white text-red-700 rounded-lg hover:bg-red-50 text-left">
              <div className="flex items-center space-x-3">
                <Shield size={20} />
                <div>
                  <p className="font-medium">Eliminar Datos de Prueba</p>
                  <p className="text-sm">Limpia datos de desarrollo</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 border border-red-300 bg-white text-red-700 rounded-lg hover:bg-red-50 text-left">
              <div className="flex items-center space-x-3">
                <Shield size={20} />
                <div>
                  <p className="font-medium">Reiniciar Configuración</p>
                  <p className="text-sm">Restaura valores por defecto</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 border border-red-300 bg-white text-red-700 rounded-lg hover:bg-red-50 text-left">
              <div className="flex items-center space-x-3">
                <Shield size={20} />
                <div>
                  <p className="font-medium">Exportar Backup</p>
                  <p className="text-sm">Descarga copia de seguridad</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 border border-red-300 bg-red-600 text-white rounded-lg hover:bg-red-700 text-left">
              <div className="flex items-center space-x-3">
                <Shield size={20} />
                <div>
                  <p className="font-medium">Eliminar Cuenta</p>
                  <p className="text-sm">Elimina todos los datos permanentemente</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;