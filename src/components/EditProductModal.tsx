import { useState, useEffect } from 'react';
import api from '../services/api';
import { Upload, Power, PowerOff, AlertCircle, X } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    name: string;
}

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
    categoryId: number;
    supplierId: number | null;
}

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: Product | null;
}

export default function EditProductModal({ isOpen, onClose, onSuccess, product }: EditProductModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    const [showActivateConfirm, setShowActivateConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        SKU: '',
        name: '',
        description: '',
        categoryId: '',
        supplierId: '',
        unitPrice: '',
        sellingPrice: '',
        minimumStock: '',
        currentStock: '',
        status: 'ACTIVE',
    });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            fetchSuppliers();
            if (product) {
                loadProductData();
            }
        }
    }, [isOpen, product]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        }
    };

    const loadProductData = () => {
        if (product) {
            setFormData({
                SKU: product.SKU,
                name: product.name,
                description: product.description || '',
                categoryId: product.categoryId.toString(),
                supplierId: product.supplierId ? product.supplierId.toString() : '',
                unitPrice: product.unitPrice.toString(),
                sellingPrice: product.sellingPrice.toString(),
                minimumStock: product.minimumStock.toString(),
                currentStock: product.currentStock.toString(),
                status: product.status,
            });

            setImagePreview(product.imageUrl ? `http://localhost:5000${product.imageUrl}` : null);
            setImageFile(null);
            setError('');
        }
    };

    const resetForm = () => {
        setFormData({
            SKU: '',
            name: '',
            description: '',
            categoryId: '',
            supplierId: '',
            unitPrice: '',
            sellingPrice: '',
            minimumStock: '',
            currentStock: '',
            status: 'ACTIVE',
        });
        setImageFile(null);
        setImagePreview(null);
        setError('');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif','image/x-avif'];
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPG, PNG, AVIF, and WEBP images are allowed');
                return;
            }
            
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.status === 'INACTIVE') {
            setError('Cannot edit inactive product. Please activate it first.');
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            const submitFormData = new FormData();

            if (imageFile) {
                submitFormData.append('image', imageFile);
            }
            
            submitFormData.append('SKU', formData.SKU);
            submitFormData.append('name', formData.name);
            
            if (formData.description) {
                submitFormData.append('description', formData.description);
            }

            submitFormData.append('categoryId', formData.categoryId);

            if (formData.supplierId) {
                submitFormData.append('supplierId', formData.supplierId);
            }

            submitFormData.append('unitPrice', formData.unitPrice);
            submitFormData.append('sellingPrice', formData.sellingPrice);
            submitFormData.append('minimumStock', formData.minimumStock);
            submitFormData.append('currentStock', formData.currentStock);
            submitFormData.append('status', formData.status);

            await api.put(`/products/${product?.id}`, submitFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onSuccess();
            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Update error:', err);
            setError(err.response?.data?.message || err.response?.data?.errors?.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        setActionLoading(true);
        try {
            await api.patch(`/products/${product?.id}/deactivate`);
            onSuccess();
            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Deactivate error:', err);
            setError(err.response?.data?.message || 'Failed to deactivate product');
        } finally {
            setActionLoading(false);
            setShowDeactivateConfirm(false);
        }
    };

    const handleActivate = async () => {
        setActionLoading(true);
        try {
            await api.patch(`/products/${product?.id}/activate`);
            onSuccess();
            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Activate error:', err);
            setError(err.response?.data?.message || 'Failed to activate product');
        } finally {
            setActionLoading(false);
            setShowActivateConfirm(false);
        }
    };

    if (!isOpen) return null;

    const isActive = formData.status === 'ACTIVE';

    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                    
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-cyan-800 to-cyan-900 px-6 py-5 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="w-1 h-6 bg-yellow-400 rounded-full"></span>
                                    Edit Product
                                </h2>
                                <p className="text-cyan-200 text-sm mt-1">Update product information</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={18} className="text-red-500" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Inactive Warning */}
                        {!isActive && (
                            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={18} className="text-amber-500" />
                                    <p className="text-sm text-amber-800">
                                        <strong>Product is inactive</strong> — Activate it to make changes or use it in stock movements.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                
                                {/* Product Image - Full Width */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Product Image
                                    </label>
                                    <div className="flex items-center gap-5">
                                        {imagePreview ? (
                                            <div className="relative group">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-28 h-28 rounded-xl object-cover border-2 border-gray-200 shadow-md"
                                                />
                                                {isActive && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImageFile(null);
                                                            setImagePreview(null);
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all shadow-md"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={`w-28 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                                                isActive 
                                                    ? 'border-gray-300 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50 cursor-pointer' 
                                                    : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                            }`}>
                                                <Upload size={24} className={isActive ? 'text-gray-400' : 'text-gray-300'} />
                                                <span className={`text-xs mt-1 ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    Upload
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/avif,image/x-avif"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    disabled={!isActive}
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400">JPG, PNG, WEBP, AVIF up to 5MB</p>
                                            <p className="text-xs text-gray-400 mt-1">Leave empty to keep current image</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SKU */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        SKU <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.SKU}
                                        onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                                            !isActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:border-yellow-400'
                                        }`}
                                        required
                                        disabled={!isActive}
                                    />
                                </div>

                                {/* Product Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                                            !isActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:border-yellow-400'
                                        }`}
                                        required
                                        disabled={!isActive}
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                                            !isActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:border-yellow-400'
                                        }`}
                                        required
                                        disabled={!isActive}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Supplier */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Supplier <span className="text-gray-400 text-xs">(Optional)</span>
                                    </label>
                                    <select
                                        value={formData.supplierId}
                                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                                            !isActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:border-yellow-400'
                                        }`}
                                        disabled={!isActive}
                                    >
                                        <option value="">No Supplier</option>
                                        {suppliers.map((sup) => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Unit Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Unit Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.unitPrice}
                                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                                            !isActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:border-yellow-400'
                                        }`}
                                        required
                                        min="0"
                                        disabled={!isActive}
                                    />
                                </div>

                                {/* Selling Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Selling Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.sellingPrice}
                                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                                            !isActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:border-yellow-400'
                                        }`}
                                        required
                                        min="0"
                                        disabled={!isActive}
                                    />
                                </div>

                                {/* Minimum Stock */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Minimum Stock
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minimumStock}
                                        onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                                            !isActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:border-yellow-400'
                                        }`}
                                        min="0"
                                        disabled={!isActive}
                                    />
                                </div>

                                {/* Current Stock */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Current Stock
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.currentStock}
                                        onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                                            !isActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:border-yellow-400'
                                        }`}
                                        min="0"
                                        disabled={!isActive}
                                    />
                                </div>

                                <div className="hidden">
                                    <input type="hidden" value={formData.status} />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all resize-none ${
                                            !isActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:border-yellow-400'
                                        }`}
                                        placeholder="Product description..."
                                        disabled={!isActive}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                                <div>
                                    {isActive ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowDeactivateConfirm(true)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            <PowerOff size={16} />
                                            Deactivate Product
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowActivateConfirm(true)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            <Power size={16} />
                                            Activate Product
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    {isActive && (
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-cyan-900 font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Saving...
                                                </span>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Deactivate Confirmation Modal */}
            {showDeactivateConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 mb-4">
                                <AlertCircle className="h-7 w-7 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Deactivate Product</h3>
                            <p className="text-gray-500">
                                Are you sure you want to deactivate <strong className="text-gray-700">{product?.name}</strong>?
                            </p>
                            <p className="text-xs text-gray-400 mt-3">
                                Deactivated products will not appear in stock movements or reports, but their history will be preserved.
                            </p>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowDeactivateConfirm(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeactivate}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Yes, Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Activate Confirmation Modal */}
            {showActivateConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-4">
                                <AlertCircle className="h-7 w-7 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Activate Product</h3>
                            <p className="text-gray-500">
                                Are you sure you want to activate <strong className="text-gray-700">{product?.name}</strong>?
                            </p>
                            <p className="text-xs text-gray-400 mt-3">
                                Activated products will be available for stock movements and reports.
                            </p>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowActivateConfirm(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleActivate}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Yes, Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


