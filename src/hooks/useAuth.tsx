import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authApi } from '../lib/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function mapUserFromMeResponse(meData: any, jwtPayload: Record<string, any> | null): User {
  return {
    id: meData.id,
    email: meData.email,
    nombre: meData.nombre,
    apellido: meData.apellido,
    rol: (meData.role || jwtPayload?.role?.replace('ROLE_', '') || 'STAFF') as User['rol'],
    tenantId: meData.tenantId,
    tenantName: meData.tenantName,
    perms: jwtPayload?.perms || [],
    clientId: meData.clientId,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authApi.me()
        .then(response => {
          const jwtPayload = decodeJwtPayload(token);
          setUser(mapUserFromMeResponse(response.data, jwtPayload));
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { token } = response.data;

      localStorage.setItem('auth_token', token);

      const jwtPayload = decodeJwtPayload(token);
      const meResponse = await authApi.me();
      setUser(mapUserFromMeResponse(meResponse.data, jwtPayload));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/login';
  };

  const authContextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
