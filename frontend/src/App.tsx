import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Shared/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminCategories from './pages/Admin/Categories';
import AdminSuppliers from './pages/Admin/Suppliers';
import AdminReports from './pages/Admin/reports';
import StaffDashboard from './pages/Staff/StaffDashboard';
import Products from './pages/Shared/Products';
import StockMovements from './pages/Shared/StockMovements';
import { authService } from './services/auth.service';
import Users from './pages/Admin/users';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
    const token = localStorage.getItem('token');
    const user = authService.getUser();
    
    if (!token) return <Navigate to="/login" />;
    if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/staff-dashboard" />;
    
    return children;
}

function App() {
    const user = authService.getUser();
    const isAdmin = user?.role === 'ADMIN';

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Admin Routes */}
                <Route path="/dashboard" element={
                    <PrivateRoute adminOnly>
                        <AdminDashboard />
                    </PrivateRoute>
                } />
                <Route path="/categories" element={
                    <PrivateRoute adminOnly>
                        <AdminCategories />
                    </PrivateRoute>
                } />
                <Route path="/suppliers" element={
                    <PrivateRoute adminOnly>
                        <AdminSuppliers />
                    </PrivateRoute>
                } />
                <Route path="/reports" element={
                    <PrivateRoute adminOnly>
                        <AdminReports />
                    </PrivateRoute>
                } />


                <Route path="/users" element={   
                    <PrivateRoute adminOnly>
                        <Users />
                    </PrivateRoute>
                } />
                
                {/* Staff Routes */}
                <Route path="/staff-dashboard" element={
                    <PrivateRoute>
                        <StaffDashboard />
                    </PrivateRoute>
                } />
                
                {/* Shared Routes */}
                <Route path="/products" element={
                    <PrivateRoute>
                        <Products />
                    </PrivateRoute>
                } />
                <Route path="/stock-movements" element={
                    <PrivateRoute>
                        <StockMovements />
                    </PrivateRoute>
                } />
                
                <Route path="/" element={<Navigate to={isAdmin ? '/dashboard' : '/staff-dashboard'} />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;