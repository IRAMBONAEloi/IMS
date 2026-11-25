import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { authService } from '../../services/auth.service';
import { 
    LayoutDashboard, Package, RefreshCw, ChevronLeft, ChevronRight,
    TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign, 
    Box, Layers, ShoppingBag, LogOut, User, ArrowRight
} from 'lucide-react';

interface DashboardData {
    totalProducts: number;
    activeProducts: number;
    totalCategories: number;
    totalSuppliers: number;
    lowStockProducts: number;
    outofStockProducts: number;
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

    const menuItems = [
        { name: 'Dashboard', path: '/staff-dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Products', path: '/products', icon: <Package size={20} /> },
        { name: 'Stock Movements', path: '/stock-movements', icon: <RefreshCw size={20} /> },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const summaryCards = [
        { title: 'Total Products', value: data?.totalProducts || 0, icon: <Box size={24} />, color: 'blue' },
        { title: 'Active Products', value: data?.activeProducts || 0, icon: <CheckCircle size={24} />, color: 'green' },
        { title: 'Categories', value: data?.totalCategories || 0, icon: <Layers size={24} />, color: 'purple' },
        { title: 'Suppliers', value: data?.totalSuppliers || 0, icon: <ShoppingBag size={24} />, color: 'orange' },
        { title: 'Low Stock', value: data?.lowStockProducts || 0, icon: <AlertCircle size={24} />, color: 'red' },
        { title: 'Out of Stock', value: data?.outofStockProducts || 0, icon: <ShoppingBag size={24} />, color: 'gray' },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { light: string; text: string; border: string }> = {
            blue: { light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
            green: { light: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
            purple: { light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
            orange: { light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
            yellow: { light: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
            red: { light: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
            gray: { light: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
        };
        return colors[color] || colors.blue;
    };

    const getMovementBadge = (type: string) => {
        switch (type) {
            case 'STOCK_IN':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">IN</span>;
            case 'STOCK_OUT':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">OUT</span>;
            case 'ADJUSTMENT':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">ADJ</span>;
            case 'RETURN':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">RET</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">{type}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:relative z-30
                    h-screen
                    bg-white
                    transition-all duration-300
                    flex flex-col shadow-lg
                    border-r border-slate-200
                    ${sidebarOpen ? 'w-64' : 'w-20'}
                `}
            >
                <div 
                    onClick={() => navigate('/staff-dashboard')}
                    className="cursor-pointer h-16 flex items-center justify-center border-b border-slate-200 px-4"
                >
                    {sidebarOpen ? (
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">I</span>
                            </div>
                            <div>
                                <span className="font-bold text-slate-800">INVENTORY</span>
                                <p className="text-[10px] text-slate-400 -mt-0.5">Management System</p>
                                <p className="text-[8px] text-blue-500 font-semibold">STAFF PORTAL</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">I</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`
                                w-full flex items-center gap-3
                                transition-all duration-200 rounded-lg
                                ${sidebarOpen ? 'px-3 py-2.5' : 'justify-center py-3'}
                                ${location.pathname === item.path
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <span className={location.pathname === item.path ? 'text-blue-600' : 'text-slate-400'}>
                                {item.icon}
                            </span>
                            {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                                <p className="text-xs text-blue-600 uppercase font-semibold">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    {sidebarOpen && (
                        <button
                            onClick={handleLogout}
                            className="mt-3 w-full py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all"
                        >
                            Logout
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-all"
                >
                    {sidebarOpen ? <ChevronLeft size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div className="px-8 py-5">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Staff Dashboard</h1>
                                <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.name}</p>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
                            >
                                ☰
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-6">
                    {summaryCards.map((card, idx) => {
                        const colors = getColorClasses(card.color);
                        return (
                            <div key={idx} className="group relative bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className={`absolute top-0 right-0 w-16 h-16 ${colors.light} rounded-bl-2xl opacity-50`}></div>
                                <div className="relative z-10">
                                    <div className={`w-10 h-10 ${colors.light} rounded-lg flex items-center justify-center mb-3 ${colors.text}`}>
                                        {card.icon}
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{card.title}</p>
                                    <p className="text-lg font-bold text-slate-800 mt-1">{card.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                    {data?.lowStockProducts > 0 && (
                        <div className=" mx-6 mb-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={24} className="text-amber-600" />
                                <div>
                                    <h3 className="font-semibold text-amber-800">Low Stock Alert</h3>
                                    <p className="text-sm text-amber-700">
                                        {data.lowStockProducts} product{data.lowStockProducts !== 1 ? 's are' : ' is'} running low on stock. 
                                        Please review and restock soon.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    
                {/* Recent Stock Movements */}
                <div className="mx-6 mb-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">Recent Stock Movements</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Latest inventory transactions</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Product</th>
                                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Type</th>
                                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Quantity</th>
                                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.recentMovements?.slice(0, 10).map((movement, idx) => (
                                    <tr key={movement.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="py-3.5 px-6">
                                            <div>
                                                <p className="font-medium text-slate-800">{movement.product?.name}</p>
                                                <p className="text-xs text-slate-400">{movement.product?.SKU}</p>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6 text-center">
                                            {getMovementBadge(movement.movementType)}
                                        </td>
                                        <td className="py-3.5 px-6 text-center">
                                            <span className={`font-semibold ${
                                                movement.movementType === 'STOCK_IN' ? 'text-green-600' :
                                                movement.movementType === 'STOCK_OUT' ? 'text-rose-600' : 
                                                movement.movementType === 'RETURN' ? 'text-blue-600' : 'text-amber-600'
                                            }`}>
                                                {movement.movementType === 'STOCK_IN' ? '+' :
                                                 movement.movementType === 'STOCK_OUT' ? '-' :
                                                 movement.movementType === 'RETURN' ? '+' : '±'}{movement.quantity}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6 text-center text-sm text-slate-500">
                                            {new Date(movement.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.recentMovements || data.recentMovements.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-400">
                                            No stock movements recorded yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions for Staff */}
                <div className="mx-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">Record Stock Movement</h3>
                                <p className="text-sm text-slate-500 mt-1">Add stock in, out, or make adjustments</p>
                                <button
                                    onClick={() => navigate('/stock-movements')}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                >
                                    Go to Stock Movements
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <RefreshCw size={24} className="text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">Browse Products</h3>
                                <p className="text-sm text-slate-500 mt-1">View product catalog and details</p>
                                <button
                                    onClick={() => navigate('/products')}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                                >
                                    View Products
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Package size={24} className="text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}