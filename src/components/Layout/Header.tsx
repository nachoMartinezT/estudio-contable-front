import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar clientes, facturas, documentos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* User dropdown */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="font-medium text-gray-900">{user?.nombre}</p>
            <p className="text-sm text-gray-500">{user?.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {user?.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
            <ChevronDown className="absolute -bottom-1 -right-1 text-gray-400 bg-white rounded-full" size={16} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;