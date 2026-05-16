import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { Mail, ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al solicitar recuperacion de contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft size={16} className="mr-1" />
            Volver al login
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <Mail className="text-primary-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Contraseña</h1>
            <p className="text-gray-600">
              Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded-lg text-center">
              <CheckCircle size={48} className="mx-auto mb-3 text-green-600" />
              <p className="font-medium">Email enviado</p>
              <p className="text-sm mt-2">
                Revisa tu bandeja de entrada. Si no encuentras el email, revisa la carpeta de spam.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Volver al login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <AlertTriangle size={18} className="mr-2 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Enviando...
                  </span>
                ) : (
                  'Enviar Instrucciones'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
