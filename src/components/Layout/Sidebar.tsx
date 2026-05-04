import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  Wallet,
  DollarSign,
  FileBarChart,
  Settings,
  LogOut,
  UserCircle,
  Bell,
  UserCog,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [];

  if (user) {
    navItems.push({ path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' });

    if (user.rol === 'SUPER_ADMIN') {
      navItems.push({ path: '/admin', icon: <ShieldCheck size={20} />, label: 'Panel de Administración' });
    }

    if (user.rol === 'ADMIN' || user.rol === 'STAFF') {
      navItems.push({ path: '/clientes', icon: <Users size={20} />, label: 'Clientes' });
      navItems.push({ path: '/facturas', icon: <FileText size={20} />, label: 'Facturas' });
      navItems.push({ path: '/documentos', icon: <FolderOpen size={20} />, label: 'Documentos' });

      const canViewInvoices = user.rol === 'ADMIN' || user.perms?.includes('canViewInvoices');
      if (canViewInvoices) {
        navItems.push({ path: '/cuenta-corriente', icon: <Wallet size={20} />, label: 'Cuenta Corriente' });
        navItems.push({ path: '/honorarios', icon: <DollarSign size={20} />, label: 'Honorarios Recurrentes' });
      }

      navItems.push({ path: '/auditoria', icon: <FileBarChart size={20} />, label: 'Auditoría' });
    }

    if (user.rol === 'ADMIN') {
      navItems.push({ path: '/empleados', icon: <UserCog size={20} />, label: 'Empleados' });
      navItems.push({ path: '/configuracion', icon: <Settings size={20} />, label: 'Configuración' });
    }

    if (user.rol === 'CLIENT') {
      navItems.push({ path: '/mi-cuenta', icon: <CreditCard size={20} />, label: 'Mi Cuenta' });
      navItems.push({ path: '/mis-documentos', icon: <FolderOpen size={20} />, label: 'Mis Documentos' });
    }
  }

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
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

      <nav className="flex-1 p-4 overflow-y-auto">
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
