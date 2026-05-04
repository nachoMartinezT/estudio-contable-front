import React from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { clientesApi } from '../../lib/api';
import { Cliente } from '../../types';

const clienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  tipoDocumento: z.enum(['DNI', 'CUIT', 'CUIL', 'PASAPORTE']),
  numeroDocumento: z.string().min(3, 'Número de documento requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Teléfono requerido'),
  direccion: z.string().min(5, 'Dirección requerida'),
  estado: z.enum(['ACTIVO', 'INACTIVO']),
});

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
      nombre: cliente.nombre,
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      estado: cliente.estado,
    } : {
      tipoDocumento: 'CUIT',
      estado: 'ACTIVO',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ClienteFormData) =>
      isEdit
        ? clientesApi.update(cliente!.id, data)
        : clientesApi.create(data),
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
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                {...register('nombre')}
                type="text"
                className="input-field"
                placeholder="Nombre del cliente"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            {/* Tipo Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento *
              </label>
              <select
                {...register('tipoDocumento')}
                className="input-field"
              >
                <option value="DNI">DNI</option>
                <option value="CUIT">CUIT</option>
                <option value="CUIL">CUIL</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
              {errors.tipoDocumento && (
                <p className="mt-1 text-sm text-red-600">{errors.tipoDocumento.message}</p>
              )}
            </div>

            {/* Número Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Documento *
              </label>
              <input
                {...register('numeroDocumento')}
                type="text"
                className="input-field"
                placeholder="Ej: 20-12345678-9"
              />
              {errors.numeroDocumento && (
                <p className="mt-1 text-sm text-red-600">{errors.numeroDocumento.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                className="input-field"
                placeholder="cliente@ejemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                {...register('telefono')}
                type="tel"
                className="input-field"
                placeholder="+54 11 1234-5678"
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                {...register('estado')}
                className="input-field"
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
              {errors.estado && (
                <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección *
            </label>
            <textarea
              {...register('direccion')}
              rows={3}
              className="input-field"
              placeholder="Dirección completa"
            />
            {errors.direccion && (
              <p className="mt-1 text-sm text-red-600">{errors.direccion.message}</p>
            )}
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