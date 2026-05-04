import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import QueryProvider from './providers/QueryProvider';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Auth Pages
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Facturas from './pages/Facturas';
import PDFGenerator from './pages/PDFGenerator';
import Auditoria from './pages/Auditoria';
import Configuracion from './pages/Configuracion';

const App: React.FC = () => {
  return (
    <Router>
      <QueryProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="facturas" element={<Facturas />} />
              <Route path="pdf" element={<PDFGenerator />} />
              <Route path="auditoria" element={<Auditoria />} />
              <Route path="configuracion" element={<Configuracion />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </QueryProvider>
    </Router>
  );
};

export default App;