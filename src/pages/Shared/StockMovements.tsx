import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { authService } from '../../services/auth.service';

interface StockMovement {
    id: number;
    productId: number;
    productName: string;
    productSKU: string;
    type: 'IN' | 'OUT';
    quantity: number;
    previousStock: number;
    newStock: number;
    reason: string;
    createdAt: string;
    createdBy: string;
}

interface Product {
    id: number;
    name: string;
    SKU: string;
    currentStock: number;
    sellingPrice: number;
    category: { id: number; name: string };
    status: string;
}

export default function StockMovements() {
    const navigate = useNavigate();
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const user = authService.getUser();
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        fetchMovements();
        fetchProducts();
    }, []);

    const fetchMovements = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/stock-movements');
            console.log('Movements response:', response.data);
            
            // Handle different response structures safely
            let movementsData = [];
            if (response.data?.data && Array.isArray(response.data.data)) {
                movementsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                movementsData = response.data;
            } else {
                movementsData = [];
            }
            
            // Ensure each movement has required properties
            const safeMovements = movementsData.map((m: any) => ({
                id: m?.id || 0,
                productId: m?.productId || 0,
                productName: m?.productName || m?.product?.name || 'Unknown Product',
                productSKU: m?.productSKU || m?.product?.SKU || 'N/A',
                type: m?.type || 'IN',
                quantity: m?.quantity || 0,
                previousStock: m?.previousStock || 0,
                newStock: m?.newStock || 0,
                reason: m?.reason || '',
                createdAt: m?.createdAt || new Date().toISOString(),
                createdBy: m?.createdBy || m?.user?.name || 'System'
            }));
            
            setMovements(safeMovements);
        } catch (error: any) {
            console.error('Failed to fetch movements:', error);
            setError(error.response?.data?.message || 'Failed to load stock movements');
            setMovements([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            const productsData = response.data?.data || response.data || [];
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddStockMovement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || quantity <= 0) {
            showToast('Please select a product and valid quantity', 'error');
            return;
        }

        const product = products.find(p => p.id.toString() === selectedProduct);
        if (movementType === 'OUT' && product && quantity > product.currentStock) {
            showToast(`Insufficient stock! Only ${product.currentStock} units available`, 'error');
            return;
        }

        try {
            await api.post('/stock-movements', {
                productId: parseInt(selectedProduct),
                type: movementType,
                quantity,
                reason: reason || (movementType === 'IN' ? 'Stock replenishment' : 'Customer purchase')
            });
            
            showToast(`Stock ${movementType === 'IN' ? 'added' : 'removed'} successfully`, 'success');
            setShowAddModal(false);
            resetForm();
            fetchMovements();
            fetchProducts();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to process stock movement', 'error');
        }
    };

    const resetForm = () => {
        setSelectedProduct('');
        setMovementType('IN');
        setQuantity(1);
        setReason('');
    };

    const getSelectedProductStock = () => {
        const product = products.find(p => p.id.toString() === selectedProduct);
        return product?.currentStock || 0;
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // FIXED: Safe filtering with proper null checks
    const filteredMovements = movements.filter(movement => {
        // Safely handle undefined or null values
        const productName = movement?.productName || '';
        const productSKU = movement?.productSKU || '';
        const search = searchTerm?.toLowerCase() || '';
        
        const matchesSearch = search === '' || 
                             productName.toLowerCase().includes(search) ||
                             productSKU.toLowerCase().includes(search);
        
        const matchesType = typeFilter === 'all' || movement?.type === typeFilter;
        
        return matchesSearch && matchesType;
    });

    const totalStockIn = movements.filter(m => m?.type === 'IN').reduce((sum, m) => sum + (m?.quantity || 0), 0);
    const totalStockOut = movements.filter(m => m?.type === 'OUT').reduce((sum, m) => sum + (m?.quantity || 0), 0);
    const uniqueProducts = new Set(movements.map(m => m?.productId).filter(id => id)).size;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Page</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading stock movements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
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
                            className="text-sm text-blue-600 font-semibold"
                        >
                            Stock Movements
                        </button>
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
                            className="text-sm text-gray-600 hover:text-blue-600"
                        >
                            Reports
                        </button>
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
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2"> Stock Movements</h1>
                            <p className="text-gray-500">Track and manage inventory changes</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                            + Add Stock Movement
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Movements</p>
                        <p className="text-2xl font-bold text-gray-900">{movements.length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Stock In</p>
                        <p className="text-2xl font-bold text-green-600">{totalStockIn}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Stock Out</p>
                        <p className="text-2xl font-bold text-red-600">{totalStockOut}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Products Tracked</p>
                        <p className="text-2xl font-bold text-purple-600">{uniqueProducts}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by product name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="all">All Movements</option>
                                <option value="IN">Stock In Only</option>
                                <option value="OUT">Stock Out Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Date & Time</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Product</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">SKU</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Type</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Quantity</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Stock Change</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Reason</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMovements.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-gray-500">
                                            <div className="text-4xl mb-2">📭</div>
                                            <p>No stock movements found</p>
                                            <p className="text-xs mt-1">Click "Add Stock Movement" to get started</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMovements.map((movement) => (
                                        <tr key={movement.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-600 text-xs">
                                                {movement.createdAt ? new Date(movement.createdAt).toLocaleString() : '-'}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-900">{movement.productName}</td>
                                            <td className="py-3 px-4 font-mono text-xs text-gray-500">{movement.productSKU}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                                                    movement.type === 'IN' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {movement.type === 'IN' ? '📥 Stock In' : '📤 Stock Out'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center font-semibold">
                                                <span className={movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}>
                                                    {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="text-xs text-gray-500">
                                                    {movement.previousStock} → {movement.newStock}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 text-xs">{movement.reason || '-'}</td>
                                            <td className="py-3 px-4 text-gray-600 text-xs">{movement.createdBy}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Stock Movement</h2>
                        <form onSubmit={handleAddStockMovement}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a product</option>
                                        {products.filter(p => p.status === 'ACTIVE').map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - Stock: {product.currentStock}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type *</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setMovementType('IN')}
                                            className={`flex-1 py-2 rounded-lg font-semibold ${
                                                movementType === 'IN'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            📥 Stock In
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMovementType('OUT')}
                                            className={`flex-1 py-2 rounded-lg font-semibold ${
                                                movementType === 'OUT'
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            📤 Stock Out
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        min="1"
                                        max={movementType === 'OUT' ? getSelectedProductStock() : undefined}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {movementType === 'OUT' && selectedProduct && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Available stock: {getSelectedProductStock()} units
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Optional"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                                >
                                    Process Movement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-white border rounded-lg shadow-lg p-4">
                    <div className={`flex items-center gap-2 ${toast.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        <span>{toast.type === 'success' ? '✓' : '✗'}</span>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}