import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Settings, Copy, Check, AlertCircle } from 'lucide-react';
import { tenantApi } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { User, StaffPermissions } from '../types';

const employeeSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  apellido: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
});

const PERMISSION_LABELS: Record<string, string> = {
  canManageClients: 'Gestionar clientes',
  canViewInvoices: 'Ver facturas y cuenta corriente',
  canCreateInvoices: 'Crear facturas',
  canManageDocuments: 'Gestionar documentos',
  canViewDashboard: 'Ver dashboard',
  canManageStaff: 'Gestionar empleados',
};

const Empleados: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['tenantStaff'],
    queryFn: () => tenantApi.getStaff().then((res) => res.data),
  });

  const staffUsers = users || [];

  const { data: permCodes, isLoading: permsLoading } = useQuery<string[]>({
    queryKey: ['staffPermissions', tenantId, selectedEmployeeId],
    queryFn: () => tenantApi.getPermissions(tenantId, selectedEmployeeId!).then((res) => res.data),
    enabled: !!tenantId && !!selectedEmployeeId,
  });

  const permissions: Record<string, boolean> = {
    canManageClients: permCodes?.includes('MANAGE_CLIENTS') ?? false,
    canViewInvoices: permCodes?.includes('VIEW_INVOICES') ?? false,
    canCreateInvoices: permCodes?.includes('CREATE_INVOICES') ?? false,
    canManageDocuments: permCodes?.includes('MANAGE_DOCUMENTS') ?? false,
    canViewDashboard: permCodes?.includes('VIEW_DASHBOARD') ?? false,
    canManageStaff: permCodes?.includes('MANAGE_STAFF') ?? false,
  };

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof employeeSchema>) =>
      tenantApi.createUser(tenantId, { ...data, role: 'STAFF' }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['tenantUsers', tenantId] });
      setTempPassword(res.data?.tempPassword || res.data?.password || '');
      createForm.reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al crear empleado');
    },
  });

  const updatePermsMutation = useMutation({
    mutationFn: (data: Record<string, boolean>) =>
      tenantApi.updatePermissions(tenantId, selectedEmployeeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffPermissions', tenantId, selectedEmployeeId] });
    },
  });

  const handleTogglePerm = (key: string) => {
    const updated = {
      canManageClients: key === 'canManageClients' ? !permissions.canManageClients : permissions.canManageClients,
      canViewInvoices: key === 'canViewInvoices' ? !permissions.canViewInvoices : permissions.canViewInvoices,
      canCreateInvoices: key === 'canCreateInvoices' ? !permissions.canCreateInvoices : permissions.canCreateInvoices,
      canManageDocuments: key === 'canManageDocuments' ? !permissions.canManageDocuments : permissions.canManageDocuments,
      canViewDashboard: key === 'canViewDashboard' ? !permissions.canViewDashboard : permissions.canViewDashboard,
      canManageStaff: key === 'canManageStaff' ? !permissions.canManageStaff : permissions.canManageStaff,
    };
    updatePermsMutation.mutate(updated);
  };

  const createForm = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
  });

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleTogglePerm = (key: string) => {
    const updated = {
      canManageClients: key === 'canManageClients' ? !permissions.canManageClients : permissions.canManageClients,
      canViewInvoices: key === 'canViewInvoices' ? !permissions.canViewInvoices : permissions.canViewInvoices,
      canCreateInvoices: key === 'canCreateInvoices' ? !permissions.canCreateInvoices : permissions.canCreateInvoices,
      canManageDocuments: key === 'canManageDocuments' ? !permissions.canManageDocuments : permissions.canManageDocuments,
      canViewDashboard: key === 'canViewDashboard' ? !permissions.canViewDashboard : permissions.canViewDashboard,
      canManageStaff: key === 'canManageStaff' ? !permissions.canManageStaff : permissions.canManageStaff,
    };
    updatePermsMutation.mutate(updated);
  };

  const selectedEmployee = staffUsers.find((u) => u.id === selectedEmployeeId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
        <p className="text-gray-600 mt-2">Gestiona los empleados y sus permisos de acceso</p>
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

      <div className="flex justify-end">
        <button onClick={() => { setShowCreateModal(true); setTempPassword(''); setErrorMsg(''); }} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nuevo empleado</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Nombre</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Permisos</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">Cargando empleados...</td></tr>
              ) : staffUsers.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">No hay empleados registrados</td></tr>
              ) : (
                staffUsers.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{emp.nombre}</td>
                    <td className="py-4 px-4 text-gray-600">{emp.email}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.perms && emp.perms.length > 0
                          ? emp.perms.map((p) => (
                              <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                {PERMISSION_LABELS[p] || p}
                              </span>
                            ))
                          : <span className="text-xs text-gray-400">Sin permisos</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedEmployeeId(emp.id === selectedEmployeeId ? null : emp.id)}
                        className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="Configurar permisos"
                      >
                        <Settings size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Side Panel */}
      {selectedEmployeeId && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-30" onClick={() => setSelectedEmployeeId(null)}></div>
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto z-50">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Permisos</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedEmployee?.nombre}</p>
              </div>
              <button onClick={() => setSelectedEmployeeId(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {permsLoading ? (
                <div className="text-center py-8 text-gray-500">Cargando permisos...</div>
              ) : (
                Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-700">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={permissions[key]}
                        onChange={() => handleTogglePerm(key)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Nuevo Empleado</h2>
              <button onClick={() => { setShowCreateModal(false); setTempPassword(''); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            {tempPassword ? (
              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">Empleado creado exitosamente</p>
                  <p className="text-sm text-green-700 mb-3">Comparte esta contraseña temporal con el empleado:</p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border border-green-300 text-lg font-mono text-center select-all">{tempPassword}</code>
                    <button onClick={handleCopyPassword} className="p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200" title="Copiar">
                      {passwordCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-500" />}
                    </button>
                  </div>
                  {passwordCopied && <p className="text-xs text-green-600 mt-1">Copiado al portapapeles</p>}
                </div>
                <button onClick={() => { setShowCreateModal(false); setTempPassword(''); queryClient.invalidateQueries({ queryKey: ['tenantUsers', tenantId] }); }} className="btn-primary w-full">
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input type="text" {...createForm.register('nombre')} className="input-field" placeholder="Nombre del empleado" />
                  {createForm.formState.errors.nombre && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.nombre.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input type="text" {...createForm.register('apellido')} className="input-field" placeholder="Apellido del empleado" />
                  {createForm.formState.errors.apellido && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.apellido.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" {...createForm.register('email')} className="input-field" placeholder="empleado@email.com" />
                  {createForm.formState.errors.email && <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.email.message}</p>}
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancelar</button>
                  <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                    {createMutation.isPending ? 'Creando...' : 'Crear Empleado'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Empleados;
