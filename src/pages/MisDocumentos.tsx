import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Download, Trash2, FileText, AlertCircle, Plus } from 'lucide-react';
import { documentosApi } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const MisDocumentos: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const clientId = user?.clientId || '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: documents, isLoading } = useQuery({
    queryKey: ['clientDocuments', clientId],
    queryFn: () => documentosApi.getByClient(clientId).then((res) => res.data),
    enabled: !!clientId,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => documentosApi.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientDocuments', clientId] });
      setSuccessMsg('Documento subido exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al subir documento');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientDocuments', clientId] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await documentosApi.download(id);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers?.['content-disposition'];
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
      a.download = filenameMatch?.[1] || `documento-${id}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setErrorMsg('Error al descargar documento');
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-AR');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Documentos</h1>
        <p className="text-gray-600 mt-2">Administra tus documentos y archivos</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2"><AlertCircle size={18} /><span>{errorMsg}</span></div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-100 rounded">X</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{successMsg}</div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="btn-primary flex items-center space-x-2"
        >
          <Upload size={18} />
          <span>{uploadMutation.isPending ? 'Subiendo...' : 'Subir documento'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Archivo</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Categoría</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Tamaño</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">Cargando documentos...</td></tr>
              ) : !documents?.length ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No hay documentos subidos</td></tr>
              ) : (
                documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.nombreArchivo || doc.fileName || doc.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {doc.categoria || doc.category || '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {doc.tamaño ? formatFileSize(doc.tamaño) : '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {doc.createdAt ? formatDate(doc.createdAt) : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(String(doc.id))}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Descargar"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(String(doc.id))}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
};

export default MisDocumentos;
