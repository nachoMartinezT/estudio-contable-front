import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FileSpreadsheet, 
  FileBarChart, 
  Settings, 
  LogOut,
  UserCircle,
  Bell
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/clientes', icon: <Users size={20} />, label: 'Clientes' },
    { path: '/facturas', icon: <FileText size={20} />, label: 'Facturas' },
    { path: '/pdf', icon: <FileSpreadsheet size={20} />, label: 'Documentos PDF' },
    { path: '/auditoria', icon: <FileBarChart size={20} />, label: 'Auditoría' },
    { path: '/configuracion', icon: <Settings size={20} />, label: 'Configuración' },
  ];
  
  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Guida Contable</h1>
            <p className="text-sm text-gray-500">SaaS</p>
          </div>
        </div>
      </div>
      
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <UserCircle className="text-primary-600" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{user?.nombre}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={18} className="text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;