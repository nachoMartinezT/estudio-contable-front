import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import QueryProvider from './providers/QueryProvider';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RoleRoute from './components/Auth/RoleRoute';

import Login from './components/Auth/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Layout from './components/Layout/Layout';

import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Facturas from './pages/Facturas';
import PDFGenerator from './pages/PDFGenerator';
import Auditoria from './pages/Auditoria';
import Configuracion from './pages/Configuracion';
import CuentaCorriente from './pages/CuentaCorriente';
import HonorariosRecurrentes from './pages/HonorariosRecurrentes';
import Empleados from './pages/Empleados';
import MiCuenta from './pages/MiCuenta';
import MisDocumentos from './pages/MisDocumentos';
import AdminPanel from './pages/AdminPanel';

const App: React.FC = () => {
  return (
    <Router>
      <QueryProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clientes" element={
                <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <Clientes />
                </RoleRoute>
              } />
              <Route path="facturas" element={
                <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <Facturas />
                </RoleRoute>
              } />
              <Route path="pdf" element={
                <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <PDFGenerator />
                </RoleRoute>
              } />
              <Route path="cuenta-corriente" element={
                <RoleRoute allowedRoles={['ADMIN', 'STAFF']} requiredPerms={['canViewInvoices']}>
                  <CuentaCorriente />
                </RoleRoute>
              } />
              <Route path="honorarios" element={
                <RoleRoute allowedRoles={['ADMIN', 'STAFF']} requiredPerms={['canViewInvoices']}>
                  <HonorariosRecurrentes />
                </RoleRoute>
              } />
              <Route path="auditoria" element={
                <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <Auditoria />
                </RoleRoute>
              } />
              <Route path="empleados" element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <Empleados />
                </RoleRoute>
              } />
              <Route path="configuracion" element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <Configuracion />
                </RoleRoute>
              } />
              <Route path="mi-cuenta" element={
                <RoleRoute allowedRoles={['CLIENT']}>
                  <MiCuenta />
                </RoleRoute>
              } />
              <Route path="mis-documentos" element={
                <RoleRoute allowedRoles={['CLIENT']}>
                  <MisDocumentos />
                </RoleRoute>
              } />
              <Route path="admin" element={
                <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                  <AdminPanel />
                </RoleRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </QueryProvider>
    </Router>
  );
};

export default App;
