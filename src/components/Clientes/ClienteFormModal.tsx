import React from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { clientsApi } from '../../lib/api';
import { Cliente } from '../../types';

const clienteSchema = z.object({
  razonSocial: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  cuit: z.string().min(11, 'CUIT requerido (11 dígitos)'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Teléfono requerido'),
  condicionIVA: z.string().optional(),
  honorarioMensual: z.number().min(0).optional(),
});

const IVA_CONDICIONES = [
  { value: '', label: 'Seleccionar...' },
  { value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
  { value: 'Monotributista', label: 'Monotributista' },
  { value: 'Exento', label: 'Exento' },
  { value: 'Consumidor Final', label: 'Consumidor Final' },
  { value: 'No Categorizado', label: 'No Categorizado' },
];

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormModalProps {
  cliente?: Cliente | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ClienteFormModal: React.FC<ClienteFormModalProps> = ({ cliente, onClose, onSuccess }) => {
  const isEdit = !!cliente;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente ? {
      razonSocial: cliente.razonSocial,
      cuit: cliente.cuit,
      email: cliente.email,
      telefono: cliente.telefono,
      condicionIVA: cliente.condicionIVA || '',
      honorarioMensual: cliente.honorarioMensual || 0,
    } : {
      honorarioMensual: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ClienteFormData) =>
      isEdit
        ? clientsApi.update(cliente!.id, data)
        : clientsApi.create(data),
    onSuccess: () => {
      onSuccess();
      reset();
    },
  });

  const onSubmit = (data: ClienteFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Actualiza la información del cliente' : 'Completa los datos del nuevo cliente'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {mutation.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Error al guardar el cliente
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social / Nombre *</label>
              <input {...register('razonSocial')} type="text" className="input-field" placeholder="Nombre o razón social" />
              {errors.razonSocial && <p className="mt-1 text-sm text-red-600">{errors.razonSocial.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CUIT *</label>
              <input {...register('cuit')} type="text" className="input-field" placeholder="30-12345678-9" />
              {errors.cuit && <p className="mt-1 text-sm text-red-600">{errors.cuit.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input {...register('email')} type="email" className="input-field" placeholder="cliente@ejemplo.com" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
              <input {...register('telefono')} type="tel" className="input-field" placeholder="+54 11 1234-5678" />
              {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condición IVA</label>
              <select {...register('condicionIVA')} className="input-field">
                {IVA_CONDICIONES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Honorario Mensual</label>
              <input {...register('honorarioMensual', { valueAsNumber: true })} type="number" step="0.01" className="input-field" placeholder="0.00" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary"
            >
              {mutation.isPending ? 'Guardando...' : isEdit ? 'Actualizar Cliente' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteFormModal;