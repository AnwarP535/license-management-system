import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { SubscriptionPacksPage } from './pages/SubscriptionPacksPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { CustomerSubscriptionPage } from './pages/CustomerSubscriptionPage';
import { CustomerSubscriptionHistoryPage } from './pages/CustomerSubscriptionHistoryPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'customer') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Shared dashboard - shows different content based on role */}
        <Route 
          path="dashboard" 
          element={
            user?.role === 'admin' ? <DashboardPage /> : <CustomerDashboardPage />
          } 
        />
        
        {/* Admin-only routes */}
        <Route
          path="customers"
          element={
            <AdminRoute>
              <CustomersPage />
            </AdminRoute>
          }
        />
        <Route
          path="subscription-packs"
          element={
            <AdminRoute>
              <SubscriptionPacksPage />
            </AdminRoute>
          }
        />
        <Route
          path="subscriptions"
          element={
            <AdminRoute>
              <SubscriptionsPage />
            </AdminRoute>
          }
        />
        
        {/* Customer-only routes */}
        <Route
          path="subscription"
          element={
            <CustomerRoute>
              <CustomerSubscriptionPage />
            </CustomerRoute>
          }
        />
        <Route
          path="subscription-history"
          element={
            <CustomerRoute>
              <CustomerSubscriptionHistoryPage />
            </CustomerRoute>
          }
        />
        
        <Route 
          path="/" 
          element={
            <Navigate 
              to="/dashboard" 
              replace 
            />
          } 
        />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
