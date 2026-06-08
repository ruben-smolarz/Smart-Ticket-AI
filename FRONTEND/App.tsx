import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Agregamos Navigate
import Header from './components/common/Header';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import TicketsListPage from './components/tickets/TicketsListPage';
import CreateTicketPage from './components/tickets/CreateTicketPage';
import TicketDetailPage from './components/tickets/TicketDetailPage';
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import Spinner from './components/common/Spinner';

const App: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Spinner size="lg" /> {/* Podemos usar size="lg" aquí */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Rutas Protegidas (Usuarios) */}
          <Route path="/" element={
            <ProtectedRoute>
              <TicketsListPage />
            </ProtectedRoute>
          } />
          <Route path="/tickets/new" element={
            <ProtectedRoute>
              <CreateTicketPage />
            </ProtectedRoute>
          } />
          <Route path="/tickets/:id" element={
            <ProtectedRoute>
              <TicketDetailPage />
            </ProtectedRoute>
          } />
          
          {/* Rutas Protegidas (Admin) */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />

          {/* Fallback: Redirigir al inicio en lugar de mostrar Login directamente */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;