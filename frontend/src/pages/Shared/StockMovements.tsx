import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { authService } from '../../services/auth.service';
import { PackageIcon ,RefreshCw,X,Search} from 'lucide-react';

interface StockMovement {
    id: number;
    productId: number;
    productName: string;
    productSKU: string;
    movementType: 'STOCK_IN' | 'STOCK_OUT'| 'ADJUSTMENT' | 'RETURN';
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
    const [movementType, setMovementType] = useState<'IN' | 'OUT'|'RETURN'|'ADJUSTMENT'>('IN');
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [error, setError] = useState<string | null>(null);
   // const [submitting, setSubmitting] = useState(false);
    
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
                movementType: m?.movementType || 'STOCK_IN',
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
        if (!product) {
            showToast('Selected product not found', 'error');
            return;
        }
        if (movementType === 'OUT' && quantity > product.currentStock) {
            showToast(`Insufficient stock! Only ${product.currentStock} units available`, 'error');
            return;
        }


       

    // 1. STOCK IN validation
    if (movementType === 'IN') {
        if (quantity <= 0) {
            showToast('❌ Quantity must be greater than 0 for Stock In', 'error');
            return;
        }
        // Optional: Max limit warning
        if (quantity > 1000) {
            const confirmLarge = window.confirm(`⚠️ You are adding ${quantity} units. This is a large quantity. Are you sure?`);
            if (!confirmLarge) return;
        }
    }

    // 2. STOCK OUT validation
    if (movementType === 'OUT') {
        if (quantity <= 0) {
            showToast('❌ Quantity must be greater than 0 for Stock Out', 'error');
            return;
        }
        if (product.currentStock <= 0) {
            showToast(`❌ Cannot remove stock. "${product.name}" is currently OUT OF STOCK (0 units available).`, 'error');
            return;
        }
        if (quantity > product.currentStock) {
            showToast(`❌ Cannot remove ${quantity} units. Only ${product.currentStock} units available in stock.`, 'error');
            return;
        }
    }

    // 3. RETURN validation
    if (movementType === 'RETURN') {
        if (quantity <= 0) {
            showToast('❌ Quantity must be greater than 0 for Return', 'error');
            return;
        }
        // Optional: Check if product exists (can return even if out of stock)
        if (product.currentStock === 0 && quantity > 0) {
            const confirmReturn = window.confirm(`⚠️ "${product.name}" is currently out of stock. Are you sure you want to return ${quantity} units?`);
            if (!confirmReturn) return;
        }
        // Prevent unrealistic returns (e.g., returning 1000 units of a low-volume product)
        if (quantity > 500) {
            const confirmLargeReturn = window.confirm(`⚠️ You are returning ${quantity} units. This is a large quantity. Are you sure?`);
            if (!confirmLargeReturn) return;
        }
    }

    // 4. ADJUSTMENT validation
    if (movementType === 'ADJUSTMENT') {
        if (quantity < 0) {
            showToast('❌ Adjustment cannot set stock to negative. Please enter 0 or a positive number.', 'error');
            return;
        }
        if (quantity === product.currentStock) {
            showToast(`⚠️ Stock is already at ${quantity} units. No adjustment needed.`, 'error');
            return;
        }
        // Warn if adjustment is drastic
        const difference = Math.abs(quantity - product.currentStock);
        if (difference > 100) {
            const confirmAdjust = window.confirm(`⚠️ This will change stock from ${product.currentStock} to ${quantity} (${difference} units difference). Are you sure?`);
            if (!confirmAdjust) return;
        }
    }


        try {
            await api.post('/stock-movements', {
                productId: parseInt(selectedProduct),
                movementType: movementType === 'IN'? 'STOCK_IN' :
                              movementType === 'OUT'? 'STOCK_OUT':
                               movementType === 'RETURN'? 'RETURN' :'ADJUSTMENT',
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
        
        const matchesType = typeFilter === 'all' || 
        (typeFilter === 'IN'&& movement?.movementType === 'STOCK_IN') ||
        (typeFilter === 'OUT' && movement?.movementType === 'STOCK_OUT');
        
        return matchesSearch && matchesType;
    });

    const totalStockIn = movements.filter(m => m?.movementType === 'STOCK_IN').reduce((sum, m) => sum + (m?.quantity || 0), 0);
    const totalStockOut = movements.filter(m => m?.movementType  === 'STOCK_OUT').reduce((sum, m) => sum + (m?.quantity || 0), 0);
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
                            <PackageIcon size={18} className="inline-block mr-1" />
                            Products
                        </button>
                        <button 
                            onClick={() => navigate('/stock-movements')}
                            className="text-sm text-blue-600 font-semibold"
                        >
                            <RefreshCw size={18} className="inline-block mr-1" />
                            Stock Movements
                        </button>
                        {isAdmin && (<button 
                            onClick={() => navigate('/categories')}
                           className="text-sm text-gray-600 hover:text-blue-600"
                        >
                            Categories
                        </button>)}
                        
                        {isAdmin && (<button 
                            onClick={() => navigate('/suppliers')}
                            className="text-sm text-gray-600 hover:text-blue-600"
                        >
                            Suppliers
                        </button>)}
                        
                        {isAdmin && ( <button 
                            onClick={() => navigate('/reports')}
                            className="text-sm text-gray-600 hover:text-blue-600"
                        >
                            Reports
                        </button>)}
                       
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
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></span>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                                <option value ="ADJUSTMENT">Adjustments</option>
                                <option value ="RETURN">Returns</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table
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
                                            <div className="text-4xl mb-2"></div>
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
                                                movement.movementType  === 'STOCK_IN' ? 'bg-green-100 text-green-700' 
                                                :movement.movementType === 'STOCK_OUT' ? 'bg-red-100 text-red-700'
                                                :movement.movementType === 'ADJUSTMENT'? 'bg-yellow-100 text-yellow-700'
                                                :movement.movementType === 'RETURN'? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                    
                                                }`}>
                                                    {movement.movementType  === 'STOCK_IN' ? ' Stock In' : movement.movementType === 'STOCK_OUT' ? ' Stock Out' : movement.movementType === 'ADJUSTMENT' ? ' Adjustment' : movement.movementType === 'RETURN' ? ' Return' : movement.movementType}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center font-semibold">
                                                <span className={movement.movementType  === 'STOCK_IN' ? 'text-green-600' : movement.movementType === 'STOCK_OUT' ? 'text-red-600' : movement.movementType === 'ADJUSTMENT' ? 'text-yellow-600' : movement.movementType === 'RETURN' ? 'text-blue-600' : 'text-gray-600'

                                                }>
                                                    {movement.movementType === 'STOCK_IN' ? '+' :
                                                    movement.movementType === 'STOCK_OUT' ? '-':
                                                    movement.movementType === 'RETURN' ? '+':''}{movement.quantity}
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
                </div> */}

                {/* Table - Products Page Style */}
{/* <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
        <table className="w-full">
            <thead>
                <tr className="border border-slate-200">
                    <th className="text-left py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Date & Time</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Product</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Type</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Quantity</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Stock Change</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Reason</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Created By</th>
                \\</tr>

            </thead>
            <tbody>
                {filteredMovements.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                            No stock movements found
                        </td>
                    </tr>
                ) : (
                    filteredMovements.map((movement, idx) => (
                        <tr key={movement.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                            <td className="py-3.5 px-6 text-sm text-slate-600">
                                {movement.createdAt ? new Date(movement.createdAt).toLocaleString() : '-'}
                            </td>
                            <td className="py-3.5 px-6">
                                <p className="font-xl text-slate-700">{movement.productName}</p>
                            </td>
                            <td className="py-3.5 px-6">
                                <p className="text-xs text-slate-400">{movement.productSKU}</p>
                            </td>
                            <td className="py-3.5 px-6 text-center">
                                <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                                    movement.movementType === 'STOCK_IN' ? 'bg-green-100 text-green-700' :
                                    movement.movementType === 'STOCK_OUT' ? 'bg-rose-100 text-rose-700' :
                                    movement.movementType === 'ADJUSTMENT' ? 'bg-amber-100 text-amber-700' :
                                    movement.movementType === 'RETURN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {movement.movementType === 'STOCK_IN' ? 'IN' :
                                     movement.movementType === 'STOCK_OUT' ? 'OUT' :
                                     movement.movementType === 'ADJUSTMENT' ? 'ADJ' : 'RET'}
                                </span>
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
                            <td className="py-3.5 px-6 text-center text-xs text-slate-500">
                                {movement.previousStock} → {movement.newStock}
                            </td>
                            <td className="py-3.5 px-6 text-sm text-slate-600">
                                {movement.reason || '-'}
                            </td>
                            <td className="py-3.5 px-6 text-sm text-slate-600">
                                {movement.createdBy}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
</div> */}








{/* Table - Glass Floating Style */}
<div className="backdrop-blur-md bg-white/30 rounded-xl border border-white/40 shadow-xl shadow-blue-500/10 overflow-hidden">
    <div className="overflow-x-auto">
        <table className="w-full">
            <thead>
                <tr className="border border-white/30 bg-white/20">
                    <th className="text-left py-3.5 px-6 text-xs font-semibold text-slate-700 uppercase">Date & Time</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-700 uppercase">Product</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-700 uppercase">SKU</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-700 uppercase">Type</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-700 uppercase">Quantity</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-700 uppercase">Stock Change</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-700 uppercase">Reason</th>
                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-700 uppercase">Created By</th>
                </tr>
            </thead>
            <tbody>
                {filteredMovements.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                            No stock movements found
                        </td>
                    </tr>
                ) : (
                    filteredMovements.map((movement, idx) => (
                        <tr key={movement.id} className={`border-b border-white/20 transition-all ${idx % 2 === 0 ? 'bg-white/10' : 'bg-white/5'} hover:bg-white/30`}>
                            <td className="py-3.5 px-6 text-sm text-slate-700">
                                {movement.createdAt ? new Date(movement.createdAt).toLocaleString() : '-'}
                            </td>
                            <td className="py-3.5 px-6">
                                <p className="font-xl text-slate-700">{movement.productName}</p>
                            </td>
                            <td className="py-3.5 px-6">
                                <p className="text-xs text-slate-500">{movement.productSKU}</p>
                            </td>
                            <td className="py-3.5 px-6 text-center">
                                <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                                    movement.movementType === 'STOCK_IN' ? 'bg-green-100 text-green-700' :
                                    movement.movementType === 'STOCK_OUT' ? 'bg-rose-100 text-rose-700' :
                                    movement.movementType === 'ADJUSTMENT' ? 'bg-amber-100 text-amber-700' :
                                    movement.movementType === 'RETURN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {movement.movementType === 'STOCK_IN' ? 'IN' :
                                     movement.movementType === 'STOCK_OUT' ? 'OUT' :
                                     movement.movementType === 'ADJUSTMENT' ? 'ADJ' : 'RET'}
                                </span>
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
                            <td className="py-3.5 px-6 text-center text-xs text-slate-500">
                                {movement.previousStock} → {movement.newStock}
                            </td>
                            <td className="py-3.5 px-6 text-sm text-slate-600">
                                {movement.reason || '-'}
                            </td>
                            <td className="py-3.5 px-6 text-sm text-slate-600">
                                {movement.createdBy}
                            </td>
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-between z-50">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">


                    <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>


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
                                             Stock In
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
                                             Stock Out
                                        </button>
                                        <button type='button' onClick={()=> setMovementType('RETURN')}
                                        className={`flex-1 py-2 rounded-lg font-semibold ${
                                            movementType === 'RETURN'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700'}`}>
                                                    Return</button>

                                                 <button type='button' onClick={()=> setMovementType('ADJUSTMENT')}
                                        className={`flex-1 py-2 rounded-lg font-semibold ${
                                            movementType === 'ADJUSTMENT'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-gray-100 text-gray-700'}`}>

                                                    Adjustment
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
                                        <p className={`text-xs text-gray-500 mt-1">${quantity > getSelectedProductStock() ? 'text-red-600' : 'text-gray-500'}`}>
                                            Available stock: {getSelectedProductStock()} units {quantity > getSelectedProductStock() && `... cannot remove more than available!`}
                                        </p>
                                    )}


                                    {selectedProduct && movementType === 'ADJUSTMENT' && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Current stock: {getSelectedProductStock()} units → New stock: {quantity} units
                                            </p>
                                )}

                                {selectedProduct && movementType === 'RETURN' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Current stock: {getSelectedProductStock()} units → After return: {getSelectedProductStock() + quantity} units
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