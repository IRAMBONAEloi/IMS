import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import {
  LayoutDashboard,
  Package,
  RefreshCw,
  Tags,
  Truck,
  BarChart3,
  Users,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });
  
  const user = authService.getUser();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen));
  }, [sidebarOpen]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (isAdmin) {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Products', path: '/products', icon: <Package className="w-5 h-5" /> },
        { name: 'Categories', path: '/categories', icon: <Tags className="w-5 h-5" /> },
        { name: 'Suppliers', path: '/suppliers', icon: <Truck className="w-5 h-5" /> },
        { name: 'Stock Movements', path: '/stock-movements', icon: <RefreshCw className="w-5 h-5" /> },
        { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
        { name: 'Users', path: '/users', icon: <Users className="w-5 h-5" /> },
      ];
    }
    return [
      { name: 'Dashboard', path: '/staff-dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Products', path: '/products', icon: <Package className="w-5 h-5" /> },
      { name: 'Stock Movements', path: '/stock-movements', icon: <RefreshCw className="w-5 h-5" /> },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-2xl ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${!sidebarOpen && 'hidden lg:flex'}`}
      >
        {/* Logo */}
        <div 
          onClick={() => navigate(isAdmin ? '/dashboard' : '/staff-dashboard')}
          className="cursor-pointer h-24 flex items-center justify-center border-b border-gray-700 hover:bg-gray-800 transition-colors"
        >
          {sidebarOpen ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <span className="text-2xl font-bold text-white">IMS</span>
              </div>
              <span className="text-sm font-bold tracking-wide">INVENTORY</span>
              <span className="text-[10px] text-gray-400">Management System</span>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl px-2 py-2 shadow-lg">
              <span className="text-sm font-bold text-white">IMS</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 transition-all duration-200 my-1 ${
                  sidebarOpen ? 'px-5 py-3' : 'px-2 py-3 justify-center'
                } ${
                  isActive
                    ? 'bg-gray-700 border-l-4 border-blue-500'
                    : 'hover:bg-gray-800'
                }`}
              >
                <span className={isActive ? 'text-blue-400' : 'text-gray-300'}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className={`text-sm font-medium ${isActive ? 'text-blue-400' : 'text-gray-300'}`}>
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 uppercase">{user?.role}</p>
              </div>
            )}
          </div>
          {sidebarOpen ? (
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-gray-700 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-24 bg-gray-700 rounded-full p-1 shadow-lg hover:bg-gray-600 transition-colors hidden lg:block"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}