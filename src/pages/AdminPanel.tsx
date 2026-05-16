import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Upload, X, Copy, Check, AlertCircle, Building2, Shield, CreditCard, Trash2, Edit, KeyRound } from 'lucide-react';
import { adminApi } from '../lib/api';
import { Tenant } from '../types';

const TAB_ESTUDIOS = 'estudios';
const TAB_AFIP = 'afip';
const TAB_MP = 'mp';

const tenantSchema = z.object({
  nombreEstudio: z.string().min(3, 'Nombre requerido'),
  cuitEstudio: z.string().min(11, 'CUIT requerido'),
  nombreAdmin: z.string().min(2, 'Nombre del admin requerido'),
  apellidoAdmin: z.string().min(2, 'Apellido del admin requerido'),
  emailAdmin: z.string().email('Email inválido'),
});

const afipSchema = z.object({
  afipCuit: z.string().min(1, 'CUIT emisor requerido'),
  afipCertPassword: z.string().optional(),
  afipHomologacion: z.boolean().optional(),
});

const mpSchema = z.object({
  accessToken: z.string().optional(),
  publicKey: z.string().optional(),
  webhookSecret: z.string().optional(),
  mpEnabled: z.boolean().optional(),
});

const TABS = [
  { key: TAB_ESTUDIOS, label: 'Estudios', icon: <Building2 size={18} /> },
  { key: TAB_AFIP, label: 'AFIP', icon: <Shield size={18} /> },
  { key: TAB_MP, label: 'MercadoPago', icon: <CreditCard size={18} /> },
];

const AdminPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(TAB_ESTUDIOS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [editTenantId, setEditTenantId] = useState<string | null>(null);
  const [editSubModules, setEditSubModules] = useState<Record<string, boolean>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [selectedTenantAfip, setSelectedTenantAfip] = useState('');
  const [selectedTenantMp, setSelectedTenantMp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: tenants, isLoading } = useQuery<Tenant[]>({
    queryKey: ['adminTenants'],
    queryFn: () => adminApi.getTenants().then((res) => res.data),
  });

  const createTenantMutation = useMutation({
    mutationFn: (data: z.infer<typeof tenantSchema>) => adminApi.createTenant(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminTenants'] });
      setTempPassword(res.data?.tempPassword || res.data?.password || '');
      createForm.reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al crear estudio');
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTenants'] });
      setSuccessMsg('Estudio eliminado');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al eliminar estudio');
    },
  });

  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetTempPassword, setResetTempPassword] = useState('');

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => adminApi.resetUserPassword(userId),
    onSuccess: (res) => {
      setResetTempPassword(res.data?.tempPassword || '');
      setSuccessMsg('Contraseña regenerada exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Error al regenerar contraseña');
    },
  });

  const editTenantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTenants'] });
      setSuccessMsg('Estudio actualizado');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Error al actualizar');
    },
  });

  const updateSubMutation = useMutation({
    mutationFn: ({ id, moduleName, active }: { id: string; moduleName: string; active: boolean }) =>
      adminApi.updateSubscription(id, { moduleName, active }),
    onSuccess: () => {
      setSuccessMsg('Módulo actualizado');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Error al actualizar módulo');
    },
  });

  const handleEditTenant = async (tenantId: string) => {
    setEditTenantId(tenantId);
    setEditLoading(true);
    try {
      const res = await adminApi.getTenant(tenantId);
      const data = res.data;
      editForm.reset({
        razonSocial: data.razonSocial || '',
        cuit: data.cuit || '',
        emailContacto: data.emailContacto || '',
        activo: data.activo ?? true,
      });
      const modules: Record<string, boolean> = {};
      (data.activeModules || []).forEach((m: string) => { modules[m] = true; });
      setEditSubModules(modules);
    } catch {
      setErrorMsg('Error al cargar datos del estudio');
    } finally {
      setEditLoading(false);
    }
  };

  const editSchema = z.object({
    razonSocial: z.string().min(3, 'Nombre requerido'),
    cuit: z.string().min(11, 'CUIT requerido'),
    emailContacto: z.string().email('Email inválido').optional().or(z.literal('')),
    activo: z.boolean(),
  });

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
  });

  const MODULES = [
    { key: 'clients', label: 'Clientes' },
    { key: 'invoices', label: 'Facturación' },
    { key: 'afip', label: 'AFIP' },
    { key: 'audit', label: 'Auditoría' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'documents', label: 'Documentos' },
  ];

  const saveAfipMutation = useMutation({
    mutationFn: (data: z.infer<typeof afipSchema>) =>
      adminApi.updateAfipConfig(selectedTenantAfip, data),
    onSuccess: () => {
      setSuccessMsg('Configuración AFIP guardada');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al guardar configuración AFIP');
    },
  });

  const uploadCertMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return adminApi.uploadCert(selectedTenantAfip, formData);
    },
    onSuccess: () => {
      setSuccessMsg('Certificado subido exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al subir certificado');
    },
  });

  const saveMpMutation = useMutation({
    mutationFn: (data: z.infer<typeof mpSchema>) =>
      adminApi.updateMpConfig(selectedTenantMp, data),
    onSuccess: () => {
      setSuccessMsg('Configuración MercadoPago guardada');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al guardar configuración MP');
    },
  });

  const createForm = useForm<z.infer<typeof tenantSchema>>({
    resolver: zodResolver(tenantSchema),
  });

  const afipForm = useForm<z.infer<typeof afipSchema>>({
    defaultValues: { afipHomologacion: false },
  });

  const mpForm = useForm<z.infer<typeof mpSchema>>({
    defaultValues: { mpEnabled: false },
  });

  useEffect(() => {
    if (!selectedTenantAfip) return;
    adminApi.getAfipConfig(selectedTenantAfip)
      .then((res) => {
        afipForm.reset({
          afipCuit: res.data.afipCuit || '',
          afipCertPassword: res.data.afipCertPassword || '',
          afipHomologacion: res.data.afipHomologacion ?? false,
        });
      })
      .catch(() => {
        afipForm.reset({
          afipCuit: '',
          afipCertPassword: '',
          afipHomologacion: false,
        });
      });
  }, [selectedTenantAfip, afipForm]);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const formatCuit = (cuit: string) => {
    const clean = cuit.replace(/\D/g, '');
    if (clean.length === 11) {
      return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
    }
    return cuit;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Administra estudios contables y configuraciones del sistema</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2"><AlertCircle size={18} /><span>{errorMsg}</span></div>
          <button onClick={() => setErrorMsg('')}><X size={16} /></button>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X size={16} /></button>
        </div>
      )}

      {/* Modal: Contraseña regenerada */}
      {resetTempPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 font-medium mb-2">Contraseña regenerada</p>
              <p className="text-sm text-orange-700 mb-3">Nueva contraseña temporal:</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-orange-300 text-lg font-mono text-center select-all">{resetTempPassword}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resetTempPassword);
                    setPasswordCopied(true);
                    setTimeout(() => setPasswordCopied(false), 2000);
                  }}
                  className="p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200"
                  title="Copiar"
                >
                  {passwordCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-500" />}
                </button>
              </div>
            </div>
            <button onClick={() => { setResetTempPassword(''); setResetPasswordUserId(null); }} className="btn-primary w-full mt-4">Cerrar</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Estudios */}
      {activeTab === TAB_ESTUDIOS && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setShowCreateModal(true); setTempPassword(''); setErrorMsg(''); }} className="btn-primary flex items-center space-x-2">
              <Plus size={20} />
              <span>Nuevo estudio</span>
            </button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Nombre</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">CUIT</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Creado</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">Cargando estudios...</td></tr>
                  ) : !tenants?.length ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">No hay estudios registrados</td></tr>
                  ) : (
                    tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{t.razonSocial}</td>
                        <td className="py-4 px-4 text-gray-600">{formatCuit(t.cuit)}</td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {new Date(t.createdAt).toLocaleDateString('es-AR')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${t.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {t.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1">
                            <button onClick={() => handleEditTenant(String(t.id))}
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Editar">
                              <Edit size={16} />
                            </button>
                            {t.adminUserId && (
                              <button
                                onClick={() => {
                                  if (confirm(`¿Regenerar la contraseña del administrador de "${t.razonSocial}"?`)) {
                                    setResetPasswordUserId(String(t.adminUserId));
                                    resetPasswordMutation.mutate(String(t.adminUserId));
                                  }
                                }}
                                disabled={resetPasswordMutation.isPending && resetPasswordUserId === String(t.adminUserId)}
                                className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg disabled:opacity-50" title="Regenerar contraseña del admin">
                                <KeyRound size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar el estudio "${t.razonSocial}"? Esta acción no se puede deshacer.`)) {
                                  deleteTenantMutation.mutate(String(t.id));
                                }
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar">
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

          {/* Create Tenant Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Nuevo Estudio</h2>
                  <button onClick={() => { setShowCreateModal(false); setTempPassword(''); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                </div>
                {tempPassword ? (
                  <div className="p-6 space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium mb-2">Estudio creado exitosamente</p>
                      <p className="text-sm text-green-700 mb-3">Contraseña temporal del administrador:</p>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 bg-white px-3 py-2 rounded border border-green-300 text-lg font-mono text-center select-all">{tempPassword}</code>
                        <button onClick={handleCopyPassword} className="p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200" title="Copiar">
                          {passwordCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-500" />}
                        </button>
                      </div>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); setTempPassword(''); }} className="btn-primary w-full">Cerrar</button>
                  </div>
                ) : (
                  <form onSubmit={createForm.handleSubmit((data) => createTenantMutation.mutate(data))} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del estudio *</label>
                      <input type="text" {...createForm.register('nombreEstudio')} className="input-field" placeholder="Estudio Contable S.A." />
                      {createForm.formState.errors.nombreEstudio && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.nombreEstudio.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CUIT *</label>
                      <input type="text" {...createForm.register('cuitEstudio')} className="input-field" placeholder="30-12345678-9" />
                      {createForm.formState.errors.cuitEstudio && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.cuitEstudio.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del administrador *</label>
                      <input type="text" {...createForm.register('nombreAdmin')} className="input-field" placeholder="Juan" />
                      {createForm.formState.errors.nombreAdmin && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.nombreAdmin.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido del administrador *</label>
                      <input type="text" {...createForm.register('apellidoAdmin')} className="input-field" placeholder="Pérez" />
                      {createForm.formState.errors.apellidoAdmin && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.apellidoAdmin.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email del administrador *</label>
                      <input type="email" {...createForm.register('emailAdmin')} className="input-field" placeholder="admin@estudio.com" />
                      {createForm.formState.errors.emailAdmin && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.emailAdmin.message}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancelar</button>
                      <button type="submit" disabled={createTenantMutation.isPending} className="btn-primary">
                        {createTenantMutation.isPending ? 'Creando...' : 'Crear Estudio'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
          {/* Edit Tenant Modal */}
          {editTenantId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Editar Estudio</h2>
                  <button onClick={() => setEditTenantId(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                </div>
                {editLoading ? (
                  <div className="p-12 text-center text-gray-500">Cargando...</div>
                ) : (
                  <div className="p-6 space-y-6">
                    <form onSubmit={editForm.handleSubmit((data) => editTenantMutation.mutate({ id: editTenantId, data }))} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
                        <input {...editForm.register('razonSocial')} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CUIT *</label>
                        <input {...editForm.register('cuit')} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Contacto</label>
                        <input {...editForm.register('emailContacto')} className="input-field" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Activo</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" {...editForm.register('activo')} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                      <button type="submit" disabled={editTenantMutation.isPending} className="btn-primary w-full">
                        {editTenantMutation.isPending ? 'Guardando...' : 'Guardar datos'}
                      </button>
                    </form>

                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Módulos de Suscripción</h3>
                      <div className="space-y-2">
                        {MODULES.map((mod) => (
                          <div key={mod.key} className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">{mod.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer"
                                checked={!!editSubModules[mod.key]}
                                onChange={(e) => {
                                  const active = e.target.checked;
                                  setEditSubModules(prev => ({ ...prev, [mod.key]: active }));
                                  updateSubMutation.mutate({ id: editTenantId, moduleName: mod.key, active });
                                }}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: AFIP */}
      {activeTab === TAB_AFIP && (
        <div className="space-y-4">
          <div className="card">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Estudio</label>
              <select
                value={selectedTenantAfip}
                onChange={(e) => setSelectedTenantAfip(e.target.value)}
                className="input-field"
              >
                <option value="">Seleccionar estudio...</option>
                {tenants?.map((t) => (
                  <option key={t.id} value={String(t.id)}>{t.razonSocial}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedTenantAfip && (
            <form onSubmit={afipForm.handleSubmit((data) => saveAfipMutation.mutate(data))} className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CUIT Emisor</label>
                <input type="text" {...afipForm.register('afipCuit')} className="input-field max-w-md" placeholder="30-12345678-9" />
                {afipForm.formState.errors.afipCuit && <p className="mt-1 text-sm text-red-600">{afipForm.formState.errors.afipCuit.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password del certificado</label>
                <input type="password" {...afipForm.register('afipCertPassword')} className="input-field max-w-md" placeholder="Password del .p12" />
              </div>
              <div className="flex items-center justify-between max-w-md">
                <span className="text-sm font-medium text-gray-700">Entorno de homologación</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" {...afipForm.register('afipHomologacion')} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <label className="btn-secondary cursor-pointer flex items-center space-x-2">
                  <Upload size={16} />
                  <span>{uploadCertMutation.isPending ? 'Subiendo...' : 'Subir certificado .p12'}</span>
                  <input
                    type="file"
                    accept=".p12"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadCertMutation.mutate(file);
                    }}
                  />
                </label>
                <button type="submit" disabled={saveAfipMutation.isPending} className="btn-primary">
                  {saveAfipMutation.isPending ? 'Guardando...' : 'Guardar configuración'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab: MercadoPago */}
      {activeTab === TAB_MP && (
        <div className="space-y-4">
          <div className="card">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Estudio</label>
              <select
                value={selectedTenantMp}
                onChange={(e) => setSelectedTenantMp(e.target.value)}
                className="input-field"
              >
                <option value="">Seleccionar estudio...</option>
                {tenants?.map((t) => (
                  <option key={t.id} value={String(t.id)}>{t.razonSocial}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedTenantMp && (
            <form onSubmit={mpForm.handleSubmit((data) => saveMpMutation.mutate(data))} className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                <input type="text" {...mpForm.register('accessToken')} className="input-field max-w-lg" placeholder="APP_USR-..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
                <input type="text" {...mpForm.register('publicKey')} className="input-field max-w-lg" placeholder="APP_USR-..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                <input type="text" {...mpForm.register('webhookSecret')} className="input-field max-w-lg" placeholder="Secret..." />
              </div>
              <div className="flex items-center justify-between max-w-lg">
                <span className="text-sm font-medium text-gray-700">MercadoPago habilitado</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" {...mpForm.register('mpEnabled')} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL del Webhook</label>
                <div className="flex items-center max-w-lg">
                  <input
                    type="text"
                    readOnly
                    value={`https://contableapi.guidapixel.tech/api/v1/mp/webhook/${selectedTenantMp}`}
                    className="input-field flex-1 bg-gray-50 text-gray-600 cursor-text select-all"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(`https://contableapi.guidapixel.tech/api/v1/mp/webhook/${selectedTenantMp}`)}
                    className="ml-2 p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    title="Copiar URL"
                  >
                    <Copy size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button type="submit" disabled={saveMpMutation.isPending} className="btn-primary">
                  {saveMpMutation.isPending ? 'Guardando...' : 'Guardar configuración'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
