import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider } from './services/auth-context';
import { useAuth } from './services/auth-context-value';
import Login from './pages/Shared/Login';
import Dashboard from './pages/Admin/Dashboard';
import Products from './pages/Shared/Products';
import StockMovements from './pages/Shared/StockMovements';
import CatalogPage from './pages/Shared/CatalogPage';
import Reports from './pages/Admin/reports';
import Users from './pages/Admin/users';

function PrivateRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="ims-auth-loading" role="status">Opening your workspace…</main>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Login />;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/staff-dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
      <Route path="/products/:id/edit" element={<PrivateRoute><Products /></PrivateRoute>} />
      <Route path="/stock-movements" element={<PrivateRoute><StockMovements /></PrivateRoute>} />
      <Route path="/categories" element={<PrivateRoute adminOnly><CatalogPage kind="categories" /></PrivateRoute>} />
      <Route path="/suppliers" element={<PrivateRoute adminOnly><CatalogPage kind="suppliers" /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute adminOnly><Reports /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute adminOnly><Users /></PrivateRoute>} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider><AppRoutes /></AuthProvider>
    </BrowserRouter>
  );
}
