import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Layout Components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';
import PublicLayout from './components/layout/PublicLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import PleaseVerifyEmail from './pages/auth/PleaseVerifyEmail';
import EmailVerification from './pages/auth/EmailVerification';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import PublicProducts from './pages/products/PublicProducts';
import Orders from './pages/orders/Orders';
import Chat from './pages/chat/Chat';
import Invoices from './pages/invoices/Invoices';
import Reports from './pages/reports/Reports';
import Users from './pages/users/Users';

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated()) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}

function App() {
  const { init, isLoading } = useAuthStore();
  
  React.useEffect(() => {
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<PublicProducts />} />
            </Route>

            <Route path="/login" element={<PublicRoute><AuthLayout><Login /></AuthLayout></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><AuthLayout><Register /></AuthLayout></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><AuthLayout><ForgotPassword /></AuthLayout></PublicRoute>} />
            <Route path="/reset-password/:token" element={<PublicRoute><AuthLayout><ResetPassword /></AuthLayout></PublicRoute>} />
            <Route path="/please-verify" element={<PublicRoute><AuthLayout><PleaseVerifyEmail /></AuthLayout></PublicRoute>} />
            <Route path="/verify-email/:token" element={<PublicRoute><AuthLayout><EmailVerification /></AuthLayout></PublicRoute>} />

            {/* Protected Routes */}
            <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route path="products" element={<ProtectedRoute allowedRoles={['admin', 'producer', 'manager', 'retailer']}><Products /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'retailer', 'producer']}><Orders /></ProtectedRoute>} />
              <Route path="chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="invoices" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'retailer']}><Invoices /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Reports /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;