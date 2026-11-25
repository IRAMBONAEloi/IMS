import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { authService } from '../../services/auth.service';
import AddProductModal from '../../components/AddProductModal';
import EditProductModal from '../../components/EditProductModal';
import { Package, Search, Grid3x3, List, Plus, LogOut, User,  Package as PackageIcon, Tags, Truck, RefreshCw, BarChart3,  } from 'lucide-react';

interface Product {
    id: number;
    SKU: string;
    name: string;
    description: string;
    imageUrl?: string;
    currentStock: number;
    minimumStock: number;
    unitPrice: number;
    sellingPrice: number;
    status: string;
    category: { id: number; name: string };
    supplier: { id: number; name: string } | null;
}

export default function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    
    const user = authService.getUser();
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products');
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.SKU.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || 
                               product.category.name === selectedCategory ||
                               product.category.id.toString() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch(sortBy) {
            case 'price':
                return a.sellingPrice - b.sellingPrice;
            case 'stock':
                return a.currentStock - b.currentStock;
            default:
                return a.name.localeCompare(b.name);
        }
    });

    const getStockColor = (currentStock: number, minimumStock: number, isInactive: boolean) => {
        if (isInactive) return '#9ca3af'; // Gray for inactive
        if (currentStock <= minimumStock) return '#ef4444';
        if (currentStock <= minimumStock * 2) return '#f59e0b';
        return '#10b981';
    };

    const getStockPercentage = (currentStock: number) => {
        return Math.min((currentStock / 100) * 100, 100);
    };

    const menuItems = isAdmin 
        ? [
            { name: 'Products', path: '/products', icon:<PackageIcon size={18} /> },
            { name: 'Stock Movements', path: '/stock-movements', icon:<RefreshCw size={18} /> },
            { name: 'Suppliers', path: '/suppliers', icon:<Truck size={18}/> },
            { name: 'Categories', path: '/categories', icon:<Tags size={18}/>  },
            { name: 'Reports', path: '/reports',icon:<BarChart3 size={18}/>},
        ]
        : [
            { name: 'Products', path: '/products', icon: <PackageIcon size={18} /> },
            { name: 'Stock Movements', path: '/stock-movements', icon: <RefreshCw size={18} /> },
        ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <div 
                        onClick={() => navigate(isAdmin ? '/dashboard' : '/staff-dashboard')}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">IMS</span>
                        </div>
                        <span className="font-bold text-gray-800">Inventory System</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {menuItems.map((item) => (
                            <button 
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`text-sm flex items-center gap-1.5 ${location.pathname === item.path ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
                            >
                                {item.icon}
                                {item.name}
                            </button>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User size={16} className="text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-700 hidden md:inline">{user?.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors flex items-center gap-1"
                        >
                            <LogOut size={14} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PackageIcon size={28} className="text-blue-600" />
                        Product Catalog
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products by name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-24">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</h3>
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                                    selectedCategory === 'all' 
                                        ? 'bg-blue-50 text-blue-700 font-semibold' 
                                        : 'hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                All Products
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.name)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                                        selectedCategory === category.name 
                                            ? 'bg-blue-50 text-blue-700 font-semibold' 
                                            : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                            {isAdmin && (
                                <div className="mt-4 pt-4 border-t">
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Add Product
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                Showing {sortedProducts.length} products
                            </span>
                            <div className="flex gap-3 items-center">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="price">Sort by Price</option>
                                    <option value="stock">Sort by Stock</option>
                                </select>
                                <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1 ${
                                            viewMode === 'grid' 
                                                ? 'bg-blue-600 text-white' 
                                                : 'text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Grid3x3 size={14} />
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1 ${
                                            viewMode === 'list' 
                                                ? 'bg-blue-600 text-white' 
                                                : 'text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <List size={14} />
                                        List
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grid View */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {sortedProducts.map(product => {
                                    const isInactive = product.status === 'INACTIVE';
                                    return (
                                        <div 
                                            key={product.id} 
                                            className={`bg-white border rounded-xl overflow-hidden transition-all ${
                                                isInactive 
                                                    ? 'border-gray-300 opacity-75 grayscale-[0.2] bg-gray-50' 
                                                    : 'border-gray-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                                            }`}
                                           
                                        >
                                            {/* Product Image */}
                                            <div className="h-48 bg-gradient-to-br from-white to-white overflow-hidden relative">
                                                {product.imageUrl ? (
                                                    <img 
                                                        src={`http://localhost:5000${product.imageUrl}`}
                                                        alt={product.name}
                                                        className={`h-full w-full object-contain p-2 ${isInactive ? 'opacity-50' : ''}`}
                                                    />
                                                ) : (
                                                    <Package size={48} className={`mx-auto mt-12 ${isInactive ? 'text-gray-400' : 'text-gray-400'}`} />
                                                )}
                                                
                                                <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium">
                                                    {product.category.name}
                                                </div>
                                                
                                                {isInactive && (
                                                    <div className="absolute inset-0 bg-gray-400/20 flex items-center justify-center">
                                                        <span className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full">
                                                            INACTIVE
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-4">
                                                <h3 className={`font-semibold mb-1 line-clamp-1 ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                                                    {product.name}
                                                </h3>
                                                <div className={`font-mono text-xs mb-3 ${isInactive ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {product.SKU}
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className={isInactive ? 'text-gray-400' : 'text-gray-500'}>
                                                            Stock: {product.currentStock}
                                                        </span>
                                                        <span className={isInactive ? 'text-gray-400' : 'text-gray-500'}>
                                                            Min: {product.minimumStock}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${getStockPercentage(product.currentStock)}%`,
                                                                backgroundColor: getStockColor(product.currentStock, product.minimumStock, isInactive)
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                    <div>
                                                        <span className={`text-xs ${isInactive ? 'text-gray-400' : 'text-gray-500'}`}>Price</span>
                                                        <div className={`text-lg font-bold ${isInactive ? 'text-gray-500' : 'text-blue-600'}`}>
                                                            ${product.sellingPrice.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setShowEditModal(true);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                            isInactive
                                                                ? 'bg-gray-200 text-gray-500'
                                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                        }`}
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* List View */
                            <div className="space-y-4">
                                {sortedProducts.map(product => {
                                    const isInactive = product.status === 'INACTIVE';
                                    return (
                                        <div 
                                            key={product.id} 
                                            className={`border rounded-xl overflow-hidden transition-shadow ${
                                                isInactive 
                                                    ? 'bg-gray-50 border-gray-300 opacity-75 grayscale-[0.2]' 
                                                    : 'bg-white border-gray-200 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex">
                                                {/* Product Image */}
                                                <div className={`w-24 h-24 flex items-center justify-center flex-shrink-0 ${
                                                    isInactive ? 'bg-gray-100' : 'bg-gradient-to-br from-gray-100 to-gray-200'
                                                }`}>
                                                    {product.imageUrl ? (
                                                        <img 
                                                            src={`http://localhost:5000${product.imageUrl}`}
                                                            alt={product.name}
                                                            className={`h-full w-full object-cover ${isInactive ? 'opacity-50 grayscale' : ''}`}
                                                        />
                                                    ) : (
                                                        <Package size={32} className={isInactive ? 'text-gray-400' : 'text-gray-400'} />
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className={`font-semibold ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                                                                    {product.name}
                                                                </h3>
                                                                {isInactive && (
                                                                    <span className="px-2 py-0.5 bg-gray-500 text-white text-xs font-semibold rounded-full">
                                                                        INACTIVE
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className={`font-mono text-xs mt-1 ${isInactive ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {product.SKU}
                                                            </div>
                                                            <div className={`text-xs mt-1 ${isInactive ? 'text-gray-400' : 'text-gray-400'}`}>
                                                                {product.category.name}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-lg font-bold ${isInactive ? 'text-gray-500' : 'text-blue-600'}`}>
                                                                ${product.sellingPrice.toFixed(2)}
                                                            </div>
                                                            <div className={`text-xs mt-1 ${isInactive ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                Selling Price
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center mt-3">
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <span className={`text-xs ${isInactive ? 'text-gray-400' : 'text-gray-500'}`}>Stock</span>
                                                                <div className={`text-sm font-medium ${isInactive ? 'text-gray-500' : ''}`}>
                                                                    {product.currentStock} units
                                                                </div>
                                                                <div className="w-24 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                                    <div 
                                                                        className="h-full rounded-full"
                                                                        style={{
                                                                            width: `${getStockPercentage(product.currentStock)}%`,
                                                                            backgroundColor: getStockColor(product.currentStock, product.minimumStock, isInactive)
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className={`text-xs ${isInactive ? 'text-gray-400' : 'text-gray-500'}`}>Min Stock</span>
                                                                <div className={`text-sm font-medium ${isInactive ? 'text-gray-500' : ''}`}>
                                                                    {product.minimumStock}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setShowEditModal(true);
                                                            }}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                                isInactive
                                                                    ? 'bg-gray-200 text-gray-500'
                                                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                            }`}
                                                        >
                                                            Edit Product
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {sortedProducts.length === 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                                <Package size={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No products found</p>
                                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddProductModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    fetchProducts();
                    setShowAddModal(false);
                }}
            />
            
            <EditProductModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                }}
                onSuccess={() => {
                    fetchProducts();
                    setShowEditModal(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct as any}
            />
        </div>
    );
}