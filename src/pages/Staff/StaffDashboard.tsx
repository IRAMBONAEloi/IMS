import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { authService } from '../../services/auth.service';
import { LayoutDashboard, Package, RefreshCw } from 'lucide-react';

interface DashboardData {
    totalProducts: number;
    activeProducts: number;
    totalCategories: number;
    totalSuppliers: number;
    totalStockValue: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    recentMovements: any[];
}

export default function StaffDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? saved === 'true' : true;
    });
    const user = authService.getUser();

    useEffect(() => {
        localStorage.setItem('sidebarOpen', String(sidebarOpen));
    }, [sidebarOpen]);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/dashboard');
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Staff only menu items with Lucide icons
    const menuItems = [
        { name: 'Dashboard', path: '/staff-dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Products', path: '/products', icon: <Package className="w-5 h-5" /> },
        { name: 'Stock Movements', path: '/stock-movements', icon: <RefreshCw className="w-5 h-5" /> },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const summaryCards = [
        { title: 'Total Products', value: data?.totalProducts || 0 },
        { title: 'Active Products', value: data?.activeProducts || 0 },
        { title: 'Categories', value: data?.totalCategories || 0 },
        { title: 'Suppliers', value: data?.totalSuppliers || 0 },
        { title: 'Low Stock', value: data?.lowStockProducts || 0 },
        { title: 'Out of Stock', value: data?.outOfStockProducts || 0 },
    ];

    const getMovementBadge = (type: string) => {
        switch (type) {
            case 'STOCK_IN':
                return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-700">STOCK IN</span>;
            case 'STOCK_OUT':
                return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-700">STOCK OUT</span>;
            case 'ADJUSTMENT':
                return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">ADJUSTMENT</span>;
            case 'RETURN':
                return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-700">RETURN</span>;
            default:
                return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-600">{type}</span>;
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-blue-100 flex relative">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed lg:relative z-30
                    h-screen
                    bg-cyan-900 text-white
                    transition-all duration-300
                    flex flex-col shadow-lg
                    ${sidebarOpen ? 'w-64' : 'w-20'}
                `}
            >
                {/* Logo with click redirect */}
                <div 
                    onClick={() => navigate('/staff-dashboard')}
                    className="cursor-pointer h-20 flex items-center justify-center border-b border-cyan-700"
                >
                    {sidebarOpen ? (
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-1">
                                <span className="text-xl font-bold text-cyan-900">I</span>
                            </div>
                            <span className="text-sm font-bold tracking-wide">INVENTORY</span>
                            <span className="text-[10px] text-blue-200">Management System</span>
                        </div>
                    ) : (
                        <div className="bg-cyan-50 hover:bg-white rounded-lg px-2 py-1.5">
                            <span className="text-sm font-bold text-cyan-900">IMS</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 py-4 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => {
                                navigate(item.path);
                                if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                }
                            }}
                            className={`
                                w-full flex items-center
                                transition-all duration-200
                                ${sidebarOpen ? 'px-5 py-3' : 'px-2 py-2 justify-center'}
                                ${location.pathname === item.path
                                    ? 'bg-cyan-800 border-l-4 border-white'
                                    : 'hover:bg-cyan-800'}
                            `}
                        >
                            {sidebarOpen ? (
                                <span className="text-sm">{item.name}</span>
                            ) : (
                                <span className="text-white">{item.icon}</span>
                            )}
                        </button>
                    ))}

                    <div className="px-4 mt-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-full py-2 bg-cyan-50 hover:bg-white text-cyan-900 rounded-lg text-sm font-bold transition"
                        >
                            {sidebarOpen ? '<' : '>'}
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-cyan-700">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-cyan-50 rounded-full flex items-center justify-center font-bold text-cyan-900">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        {sidebarOpen && (
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-gray-50 uppercase">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    {sidebarOpen && (
                        <button
                            onClick={handleLogout}
                            className="mt-4 w-full py-2 bg-cyan-700 hover:bg-red-600 rounded-lg text-sm font-medium transition"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto lg:ml-0">
                <div className="sticky top-0 z-10 bg-white shadow-sm px-4 sm:px-6 py-4">
                    <div className="bg-cyan-900 rounded-lg px-4 sm:px-6 py-5 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
                            <p className="text-sm text-blue-200 mt-1">Welcome back, {user?.name}</p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden bg-yellow-500 px-3 py-2 rounded-md text-cyan-900 font-bold"
                        >
                            ☰
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
                        {summaryCards.map((card, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-sm border p-4 flex-1">
                                <p className="text-xs font-semibold text-cyan-900 uppercase truncate">
                                    {card.title}
                                </p>
                                <p className="text-xl font-bold text-gray-800 mt-2 truncate">
                                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b bg-cyan-700">
                            <h2 className="text-lg font-semibold text-white">Recent Stock Movements</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="text-center py-3 px-5 text-xs font-semibold text-blue-700">Product</th>
                                        <th className="text-center py-3 px-5 text-xs font-semibold text-blue-700">Type</th>
                                        <th className="text-center py-3 px-5 text-xs font-semibold text-blue-700">Quantity</th>
                                        <th className="text-center py-3 px-5 text-xs font-semibold text-blue-700">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.recentMovements?.slice(0, 10).map((movement) => (
                                        <tr key={movement.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-5">
                                                <p className="font-medium text-gray-800">{movement.product?.name}</p>
                                                <p className="text-xs text-gray-400">{movement.product?.SKU}</p>
                                            </td>
                                            <td className="py-3 px-5">{getMovementBadge(movement.movementType)}</td>
                                            <td className="py-3 px-5">
                                                <span className={`font-semibold ${
                                                    movement.movementType === 'STOCK_IN' ? 'text-green-600' :
                                                    movement.movementType === 'STOCK_OUT' ? 'text-red-600' : 
                                                    movement.movementType === 'ADJUSTMENT' ? 'text-purple-600':
                                                    movement.movementType === 'RETURN' ? 'text-blue-600':'text-yellow-600'
                                                }`}>
                                                    {movement.movementType === 'STOCK_IN' ? '+' :
                                                    movement.movementType === 'STOCK_OUT' ? '-' :
                                                    movement.movementType === 'ADJUSTMENT' ? '*' :
                                                    movement.movementType === 'RETURN' ? '+' :''}{movement.quantity}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-xs text-gray-500">
                                                {new Date(movement.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}