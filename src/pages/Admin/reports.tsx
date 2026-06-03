import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, 
  RefreshCw, 
  Tags, 
  Truck, 
  BarChart3, 
  Users, 
  LogOut,
  Search,
  AlertTriangle,
  PackageX,
  TrendingUp,
  DollarSign,
  PieChart,
  FileText,
  Download,
  Printer
} from 'lucide-react';
import api from '../../services/api';
import { authService } from '../../services/auth.service';

interface Product {
    id: number;
    SKU: string;
    name: string;
    currentStock: number;
    minimumStock: number;
    unitPrice: number;
    sellingPrice: number;
    category: { name: string };
    supplier: { name: string } | null;
}

interface InventoryItem {
    id: number;
    name: string;
    SKU: string;
    currentStock: number;
    unitPrice: number;
    sellingPrice: number;
    totalValue: number;
    category: { name: string };
}

interface InventorySummary {
    totalProducts: number;
    totalValue: number;
    averageValuePerProduct: number;
    totalStockUnits: number;
}

export default function Reports() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('low-stock');
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
    const [inventoryValue, setInventoryValue] = useState<{ items: InventoryItem[]; summary: InventorySummary }>({ 
        items: [], 
        summary: { totalProducts: 0, totalValue: 0, averageValuePerProduct: 0, totalStockUnits: 0 } 
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    const user = authService.getUser();
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        fetchReports();
    }, [activeTab]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            if (activeTab === 'low-stock') {
                const response = await api.get('/reports/low-stock');
                setLowStockProducts(response.data.data || []);
            } else if (activeTab === 'out-of-stock') {
                const response = await api.get('/reports/out-of-stock');
                setOutOfStockProducts(response.data.data || []);
            } else if (activeTab === 'inventory-value') {
                const response = await api.get('/reports/inventory-value');
                setInventoryValue(response.data.data || { items: [], summary: {} });
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            showToast('Failed to load reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleExport = () => {
        showToast('Export feature coming soon', 'success');
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredLowStock = lowStockProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.SKU.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOutOfStock = outOfStockProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.SKU.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInventory = inventoryValue.items?.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.SKU.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const tabs = [
        { id: 'low-stock', name: 'Low Stock Products', icon: <AlertTriangle className="w-4 h-4" />, color: 'yellow' },
        { id: 'out-of-stock', name: 'Out of Stock Products', icon: <PackageX className="w-4 h-4" />, color: 'red' },
        { id: 'inventory-value', name: 'Inventory Value', icon: <DollarSign className="w-4 h-4" />, color: 'green' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div 
                        onClick={() => navigate(isAdmin ? '/dashboard' : '/staff-dashboard')}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">IMS</span>
                        </div>
                        <span className="font-bold text-gray-800">Inventory System</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/products')}
                            className="text-sm text-gray-600 hover:text-blue-600"
                        >
                            Products
                        </button>
                        <button 
                            onClick={() => navigate('/stock-movements')}
                            className="text-sm text-gray-600 hover:text-blue-600"
                        >
                            Stock Movements
                        </button>
                        {isAdmin && (
                            <>
                                <button 
                                    onClick={() => navigate('/categories')}
                                    className="text-sm text-gray-600 hover:text-blue-600"
                                >
                                    Categories
                                </button>
                                <button 
                                    onClick={() => navigate('/suppliers')}
                                    className="text-sm text-gray-600 hover:text-blue-600"
                                >
                                    Suppliers
                                </button>
                                <button 
                                    onClick={() => navigate('/reports')}
                                    className={`text-sm ${location.pathname === '/reports' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
                                >
                                    Reports
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-blue-600">
                                    {user?.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <span className="text-sm text-gray-700 hidden md:inline">{user?.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 Reports & Analytics</h1>
                            <p className="text-gray-500">View inventory reports and performance metrics</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                        </div>
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="bg-white border border-gray-200 rounded-xl mb-6">
                    <div className="flex border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all
                                    ${activeTab === tab.id
                                        ? `text-${tab.color}-600 border-b-2 border-${tab.color}-500 bg-${tab.color}-50/30`
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                                `}
                            >
                                {tab.icon}
                                {tab.name}
                                {activeTab === tab.id && (
                                    <span className={`w-1.5 h-1.5 rounded-full bg-${tab.color}-500`} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Low Stock Report */}
                {activeTab === 'low-stock' && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b bg-yellow-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                        Low Stock Products
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Products below minimum stock level</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Total: {filteredLowStock.length} products
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product Name</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Current Stock</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Min Stock</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLowStock.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-mono text-xs text-gray-600">{product.SKU}</td>
                                            <td className="py-3 px-4 font-medium text-gray-800">{product.name}</td>
                                            <td className="py-3 px-4 text-gray-600">{product.category?.name || '-'}</td>
                                            <td className="py-3 px-4 text-gray-600">{product.supplier?.name || '-'}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="font-semibold text-orange-600">{product.currentStock}</span>
                                            </td>
                                            <td className="py-3 px-4 text-center text-gray-500">{product.minimumStock}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Low Stock
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLowStock.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-gray-500">
                                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p>No low stock products found</p>
                                                <p className="text-xs mt-1">All products are above minimum stock levels</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Out of Stock Report */}
                {activeTab === 'out-of-stock' && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b bg-red-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <PackageX className="w-5 h-5 text-red-600" />
                                        Out of Stock Products
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Products with zero inventory</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Total: {filteredOutOfStock.length} products
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product Name</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Min Stock</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Selling Price</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                     </tr>
                                </thead>
                                <tbody>
                                    {filteredOutOfStock.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-mono text-xs text-gray-600">{product.SKU}</td>
                                            <td className="py-3 px-4 font-medium text-gray-800">{product.name}</td>
                                            <td className="py-3 px-4 text-gray-600">{product.category?.name || '-'}</td>
                                            <td className="py-3 px-4 text-gray-600">{product.supplier?.name || '-'}</td>
                                            <td className="py-3 px-4 text-center text-gray-500">{product.minimumStock}</td>
                                            <td className="py-3 px-4 text-center font-semibold text-blue-600">${product.sellingPrice}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                                    <PackageX className="w-3 h-3" />
                                                    Out of Stock
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOutOfStock.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-gray-500">
                                                <PackageX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p>No out of stock products found</p>
                                                <p className="text-xs mt-1">All products have stock available</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Inventory Value Report */}
                {activeTab === 'inventory-value' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90">Total Products</p>
                                        <p className="text-3xl font-bold mt-1">{inventoryValue.summary?.totalProducts || 0}</p>
                                    </div>
                                    <Package className="w-10 h-10 opacity-50" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90">Total Stock Units</p>
                                        <p className="text-3xl font-bold mt-1">{inventoryValue.summary?.totalStockUnits || 0}</p>
                                    </div>
                                    <TrendingUp className="w-10 h-10 opacity-50" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90">Total Inventory Value</p>
                                        <p className="text-xl font-bold mt-1">
                                            ${(inventoryValue.summary?.totalValue || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <DollarSign className="w-10 h-10 opacity-50" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90">Avg Value/Product</p>
                                        <p className="text-xl font-bold mt-1">
                                            ${(inventoryValue.summary?.averageValuePerProduct || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <PieChart className="w-10 h-10 opacity-50" />
                                </div>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b bg-green-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-green-600" />
                                            Inventory Value Details
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">Breakdown by product</p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Total: {filteredInventory.length} products
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product Name</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInventory.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.SKU}</td>
                                                <td className="py-3 px-4 font-medium text-gray-800">{item.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.category?.name || '-'}</td>
                                                <td className="py-3 px-4 text-center font-semibold">{item.currentStock}</td>
                                                <td className="py-3 px-4 text-center text-gray-600">${item.sellingPrice || item.unitPrice}</td>
                                                <td className="py-3 px-4 text-center font-semibold text-green-600">
                                                    ${(item.totalValue || item.currentStock * (item.sellingPrice || item.unitPrice)).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredInventory.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p>No inventory items found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-white border rounded-lg shadow-lg p-4 animate-slide-in max-w-md">
                    <div className={`flex items-start gap-3 ${toast.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="text-lg">{toast.type === 'success' ? '✓' : '✗'}</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}







