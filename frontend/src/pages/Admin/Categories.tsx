import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {  
  Tags, 
  Search,
  Plus,
  Edit,
  Save,
  X,
  Grid3x3,
  List,
  FolderTree,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../../services/api';
import { authService } from '../../services/auth.service';

interface Category {
    id: number;
    name: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    productCount?: number;
}

export default function Categories() {
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    const user = authService.getUser();
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/categories');
            const categoriesData = response.data.data || response.data || [];
            
            // Fetch product counts for each category
            const productsResponse = await api.get('/products');
            const products = productsResponse.data.data || [];
            
            const categoriesWithCount = categoriesData.map((category: Category) => ({
                ...category,
                status: category.status || 'ACTIVE',
                productCount: products.filter((p: any) => p.category?.id === category.id).length
            }));
            
            setCategories(categoriesWithCount);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            showToast('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('Category name is required', 'error');
            return;
        }

        try {
            await api.post('/categories', {
                name: formData.name,
                description: formData.description,
                status: 'ACTIVE'
            });
            showToast('Category added successfully', 'success');
            setShowAddModal(false);
            resetForm();
            fetchCategories();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to add category', 'error');
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('Category name is required', 'error');
            return;
        }

        try {
            await api.put(`/categories/${selectedCategory?.id}`, {
                name: formData.name,
                description: formData.description
            });
            showToast('Category updated successfully', 'success');
            setShowEditModal(false);
            setSelectedCategory(null);
            resetForm();
            fetchCategories();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update category', 'error');
        }
    };

    const openStatusModal = (category: Category) => {
        // Check if trying to deactivate a category WITH products
        const productCount = category.productCount ?? 0;
                if (category.status === 'ACTIVE' && productCount > 0) {
            showToast(`Cannot deactivate "${category.name}" because it has ${category.productCount} product(s) associated with it.`, 'error');
            return;
        }
        
        // Allow deactivation for active categories with 0 products
        // Allow activation for inactive categories
        setSelectedCategory(category);
        setShowStatusModal(true);
    };

    const handleStatusChange = async () => {
        if (!selectedCategory) return;
        
        const newStatus = selectedCategory.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const actionText = newStatus === 'ACTIVE' ? 'activated' : 'deactivated';

        try {
           await api.put(`/categories/${selectedCategory.id}`, { status: newStatus,
              name:selectedCategory.name,
              description: selectedCategory.description || ''
             });

             
            showToast(`Category ${actionText} successfully`, 'success');
            setShowStatusModal(false);
            
            setCategories(prevCategories => 
                prevCategories.map(cat =>
                    cat.id === selectedCategory.id? {...cat, status: newStatus}
                    :cat
                )
            );
            setSelectedCategory(null);
            await fetchCategories();

           
        } catch (error: any) {
            showToast(error.response?.data?.message || `Failed to ${actionText} category`, 'error');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '' });
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setFormData({ name: category.name, description: category.description || '' });
        setShowEditModal(true);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (category.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Show active categories first, then inactive
    const sortedCategories = [...filteredCategories].sort((a, b) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
        return a.name.localeCompare(b.name);
    });

    const activeCount = categories.filter(c => c.status === 'ACTIVE').length;
    const inactiveCount = categories.filter(c => c.status === 'INACTIVE').length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading categories...</p>
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
                                    className={`text-sm ${location.pathname === '/categories' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
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
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">🏷️ Categories Management</h1>
                            <p className="text-gray-500">Organize your products with categories</p>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowAddModal(true);
                                }}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Category
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Categories</p>
                        <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Active Categories</p>
                        <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Inactive Categories</p>
                        <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Products</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {categories.reduce((sum, c) => sum + (c.productCount || 0), 0)}
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Showing {sortedCategories.length} categories ({activeCount} active, {inactiveCount} inactive)
                    </span>
                    <div className="flex gap-3 items-center">
                        <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    viewMode === 'grid' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Grid3x3 className="w-4 h-4" />
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    viewMode === 'list' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <List className="w-4 h-4" />
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Display */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {sortedCategories.map(category => {
                            const productCount = category.productCount ?? 0;
                            const hasProducts = productCount > 0;
                            const isActive = category.status === 'ACTIVE';
                            
                            return (
                                <div key={category.id} className={`bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${
                                    !isActive ? 'border-gray-300 opacity-75' : 'border-gray-200'
                                }`}>
                                    <div className={`px-4 py-3 border-b ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FolderTree className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    isActive 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {category.productCount || 0} products
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className={`font-semibold text-lg mb-2 ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {category.name}
                                        </h3>
                                        {category.description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                                        )}
                                        {!category.description && (
                                            <p className="text-sm text-gray-400 italic mb-4">No description</p>
                                        )}
                                        
                                        <div className="pt-3 border-t border-gray-200">
                                            <div className="text-xs text-gray-500 mb-2">
                                                Created: {new Date(category.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        {isAdmin && (
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openStatusModal(category)}
                                                    disabled={isActive && hasProducts}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                                        isActive
                                                            ? hasProducts
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                    }`}
                                                    title={isActive && hasProducts ? `Cannot deactivate: ${category.productCount} product(s) use this category` : isActive ? 'Deactivate this category' : 'Activate this category'}
                                                >
                                                    {isActive ? (
                                                        <>
                                                            <EyeOff className="w-4 h-4" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-4 h-4" />
                                                            Activate
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                        {isActive && hasProducts && (
                                            <p className="text-xs text-gray-600 mt-2 text-center">
                                                ⚠️ Has {category.productCount} product(s) - Cannot deactivate
                                            </p>
                                        )}
                                        {isActive && !hasProducts && (
                                            <p className="text-xs text-green-600 mt-2 text-center">
                                                ✓ No products - Can be deactivated
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedCategories.map(category => {
                            const hasProducts = !!(category.productCount && category.productCount > 0);
                            const isActive = category.status === 'ACTIVE';
                            
                            return (
                                <div key={category.id} className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow ${
                                    !isActive ? 'border-gray-300 opacity-75' : 'border-gray-200'
                                }`}>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <FolderTree className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                                    <h3 className={`font-semibold text-lg ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {category.name}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        isActive 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {hasProducts && isActive && (
                                                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                                            {category.productCount} products
                                                        </span>
                                                    )}
                                                    {!hasProducts && isActive && (
                                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                            0 products
                                                        </span>
                                                    )}
                                                </div>
                                                {category.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                                                )}
                                                <div className="flex gap-4 text-sm text-gray-500">
                                                    <span>📦 {category.productCount || 0} products</span>
                                                    <span>📅 Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => openStatusModal(category)}
                                                        disabled={isActive && hasProducts}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                            isActive
                                                                ? hasProducts
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                        }`}
                                                        title={isActive && hasProducts ? `Cannot deactivate: ${category.productCount} product(s) use this category` : isActive ? 'Deactivate this category' : 'Activate this category'}
                                                    >
                                                        {isActive ? (
                                                            <>
                                                                <EyeOff className="w-4 h-4" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="w-4 h-4" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {isActive && hasProducts && (
                                            <p className="text-xs text-red-600 mt-3 pt-2 border-t border-gray-100">
                                                ⚠️ Cannot deactivate: This category has {category.productCount} product(s) associated with it
                                            </p>
                                        )}
                                        {isActive && !hasProducts && (
                                            <p className="text-xs text-green-600 mt-3 pt-2 border-t border-gray-100">
                                                ✓ No products - This category can be deactivated
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {sortedCategories.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <Tags className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">No categories found</p>
                        <p className="text-sm text-gray-400 mt-1">Click "Add Category" to get started</p>
                    </div>
                )}
            </div>

            {/* Status Change Confirmation Modal */}
            {showStatusModal && selectedCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-full ${selectedCategory.status === 'ACTIVE' ? 'bg-red-100' : 'bg-green-100'}`}>
                                {selectedCategory.status === 'ACTIVE' ? (
                                    <EyeOff className="w-6 h-6 text-red-600" />
                                ) : (
                                    <Eye className="w-6 h-6 text-green-600" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedCategory.status === 'ACTIVE' ? 'Deactivate Category' : 'Activate Category'}
                            </h2>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-600 mb-2">
                                Are you sure you want to <span className="font-semibold">{selectedCategory.status === 'ACTIVE' ? 'deactivate' : 'activate'}</span> 
                                {' '}category <span className="font-semibold text-gray-900">"{selectedCategory.name}"</span>?
                            </p>
                            
                            {selectedCategory.status === 'ACTIVE' ? (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                        <div className="text-sm text-yellow-800">
                                            <p className="font-semibold mb-1">Deactivating this category:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Will hide it from product selection forms</li>
                                                <li>Existing products will still keep this category</li>
                                                <li>You can reactivate it anytime</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-semibold mb-1">Activating this category:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Will make it available in product selection forms</li>
                                                <li>Can be used for new products</li>
                                                <li>You can deactivate it again if needed</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setSelectedCategory(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusChange}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                                    selectedCategory.status === 'ACTIVE'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                {selectedCategory.status === 'ACTIVE' ? (
                                    <>
                                        <EyeOff className="w-4 h-4" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        Activate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Add New Category</h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddCategory}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Electronics, Clothing, Books"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Optional description for this category"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showEditModal && selectedCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Edit Category</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedCategory(null);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateCategory}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedCategory(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Update Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-white border rounded-lg shadow-lg p-4 animate-slide-in max-w-md">
                    <div className={`flex items-start gap-3 ${toast.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="text-lg">{toast.type === 'success' ? '✓' : '✗'}</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}