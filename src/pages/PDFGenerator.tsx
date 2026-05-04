import React, { useState } from 'react';
import { FileText, Download, Printer, Eye, Clock, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { pdfApi } from '../lib/api';

const PDFGenerator: React.FC = () => {
  const [tipoDocumento, setTipoDocumento] = useState<'FACTURA' | 'PRESUPUESTO' | 'REPORTE'>('FACTURA');
  const [formData, setFormData] = useState({
    facturaId: '',
    clienteNombre: '',
    items: [
      { descripcion: '', cantidad: 1, precioUnitario: 0 },
    ],
  });

  const generarPDFMutation = useMutation({
    mutationFn: () => {
      switch (tipoDocumento) {
        case 'FACTURA':
          return pdfApi.generarFactura(formData.facturaId);
        case 'PRESUPUESTO':
          return pdfApi.generarPresupuesto(formData);
        case 'REPORTE':
          return pdfApi.generarReporte(formData);
        default:
          throw new Error('Tipo de documento no válido');
      }
    },
  });

  const tiposDocumento = [
    { value: 'FACTURA', label: 'Factura', icon: <FileText />, color: 'bg-blue-50 text-blue-600' },
    { value: 'PRESUPUESTO', label: 'Presupuesto', icon: <FileText />, color: 'bg-green-50 text-green-600' },
    { value: 'REPORTE', label: 'Reporte', icon: <FileText />, color: 'bg-purple-50 text-purple-600' },
  ];

  const plantillas = [
    { id: 1, nombre: 'Factura Simple', tipo: 'FACTURA', ultimaModificacion: '2024-01-15' },
    { id: 2, nombre: 'Factura Detallada', tipo: 'FACTURA', ultimaModificacion: '2024-01-10' },
    { id: 3, nombre: 'Presupuesto Estándar', tipo: 'PRESUPUESTO', ultimaModificacion: '2024-01-12' },
    { id: 4, nombre: 'Reporte Mensual', tipo: 'REPORTE', ultimaModificacion: '2024-01-05' },
    { id: 5, nombre: 'Balance General', tipo: 'REPORTE', ultimaModificacion: '2023-12-20' },
  ];

  const handleGenerarPDF = () => {
    generarPDFMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generador de PDF</h1>
        <p className="text-gray-600 mt-2">Crea y personaliza documentos PDF para tus clientes</p>
      </div>

      {/* Document Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiposDocumento.map((tipo) => (
          <button
            key={tipo.value}
            onClick={() => setTipoDocumento(tipo.value as any)}
            className={`p-6 rounded-xl border-2 transition-all duration-200 ${
              tipoDocumento === tipo.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${tipo.color}`}>
                {tipo.icon}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{tipo.label}</p>
                <p className="text-sm text-gray-500 mt-1">Generar documento {tipo.label.toLowerCase()}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración del Documento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  value={formData.clienteNombre}
                  onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })}
                  className="input-field"
                  placeholder="Nombre del cliente"
                />
              </div>

              {tipoDocumento === 'FACTURA' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Factura
                  </label>
                  <input
                    type="text"
                    value={formData.facturaId}
                    onChange={(e) => setFormData({ ...formData, facturaId: e.target.value })}
                    className="input-field"
                    placeholder="Ej: FAC-2024-001"
                  />
                </div>
              )}

              {/* Items Table */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items / Servicios
                </label>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Descripción</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Cantidad</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Precio Unitario</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={item.descripcion}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].descripcion = e.target.value;
                                setFormData({ ...formData, items: newItems });
                              }}
                              className="input-field py-1"
                              placeholder="Descripción del servicio"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].cantidad = parseInt(e.target.value) || 0;
                                setFormData({ ...formData, items: newItems });
                              }}
                              className="input-field py-1"
                              min="1"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="number"
                              value={item.precioUnitario}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].precioUnitario = parseFloat(e.target.value) || 0;
                                setFormData({ ...formData, items: newItems });
                              }}
                              className="input-field py-1"
                              step="0.01"
                            />
                          </td>
                          <td className="py-2 px-4 font-medium">
                            ${(item.cantidad * item.precioUnitario).toLocaleString('es-AR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      items: [...formData.items, { descripcion: '', cantidad: 1, precioUnitario: 0 }],
                    });
                  }}
                  className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Agregar otro item
                </button>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleGenerarPDF}
                  disabled={generarPDFMutation.isPending}
                  className="btn-primary w-full py-3"
                >
                  {generarPDFMutation.isPending ? (
                    <>
                      <Clock className="inline mr-2 animate-spin" size={18} />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="inline mr-2" size={18} />
                      Generar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {generarPDFMutation.data && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">PDF Generado</h3>
                <CheckCircle className="text-green-500" size={20} />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {tipoDocumento === 'FACTURA' ? 'Factura' : tipoDocumento === 'PRESUPUESTO' ? 'Presupuesto' : 'Reporte'} Generado
                    </p>
                    <p className="text-sm text-gray-500">
                      Tamaño: {(generarPDFMutation.data.data.tamaño / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={generarPDFMutation.data.data.url}
                      download={generarPDFMutation.data.data.nombreArchivo}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Download size={16} />
                      <span>Descargar</span>
                    </a>
                    <button className="btn-secondary flex items-center space-x-2">
                      <Printer size={16} />
                      <span>Imprimir</span>
                    </button>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="text-gray-400" size={24} />
                    <div>
                      <p className="font-medium">{generarPDFMutation.data.data.nombreArchivo}</p>
                      <p className="text-sm text-gray-500">Generado hace 2 minutos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Templates Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plantillas Disponibles</h3>
            <div className="space-y-3">
              {plantillas
                .filter(p => p.tipo === tipoDocumento)
                .map((plantilla) => (
                  <button
                    key={plantilla.id}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{plantilla.nombre}</p>
                        <p className="text-sm text-gray-500">
                          Modificado: {new Date(plantilla.ultimaModificacion).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <Eye className="text-gray-400" size={18} />
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración Avanzada</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Mostrar logo</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Incluir IVA detallado</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Firma digital</span>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Código QR</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial Reciente</h3>
            <div className="space-y-3">
              {[
                { id: 1, nombre: 'Factura FAC-2024-00123', fecha: '2024-01-15 14:30', tipo: 'FACTURA' },
                { id: 2, nombre: 'Presupuesto PRES-2024-001', fecha: '2024-01-14 10:15', tipo: 'PRESUPUESTO' },
                { id: 3, nombre: 'Reporte Mensual Enero', fecha: '2024-01-10 16:45', tipo: 'REPORTE' },
              ].map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{doc.nombre}</p>
                    <p className="text-xs text-gray-500">{doc.fecha}</p>
                  </div>
                  <Download className="text-gray-400 hover:text-primary-600 cursor-pointer" size={16} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;