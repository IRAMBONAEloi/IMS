import { useState, useEffect } from 'react';
import api from '../services/api';
import { Upload, X } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    name: string;
}

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const [isNewSupplier, setIsNewSupplier] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');
    
    const [formData, setFormData] = useState({
        SKU: '',
        name: '',
        description: '',
        categoryId: '',
        supplierId: '',
        unitPrice: '',
        sellingPrice: '',
        minimumStock: '0',
        currentStock: '0',
    });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            fetchSuppliers();
            resetForm();
        }
    }, [isOpen]);

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

    const resetForm = () => {
        setFormData({
            SKU: '',
            name: '',
            description: '',
            categoryId: '',
            supplierId: '',
            unitPrice: '',
            sellingPrice: '',
            minimumStock: '0',
            currentStock: '0',
        });
        setIsNewSupplier(false);
        setNewSupplierName('');
        setImageFile(null);
        setImagePreview(null);
        setError('');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
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
        setLoading(true);
        setError('');

        try {
            let supplierId = formData.supplierId ? parseInt(formData.supplierId) : null;
            
            // Create new supplier if needed
            if (isNewSupplier && newSupplierName.trim()) {
                const supplierRes = await api.post('/suppliers', { name: newSupplierName });
                supplierId = supplierRes.data.data.id;
            }

            // Create FormData object for product submission
            const submitFormData = new FormData();
            
            // Add image if exists
            if (imageFile) {
                submitFormData.append('image', imageFile);
            }
            
            // Add all product fields as form data
            submitFormData.append('SKU', formData.SKU);
            submitFormData.append('name', formData.name);
            if (formData.description) {
                submitFormData.append('description', formData.description);
            }
            submitFormData.append('categoryId', formData.categoryId);
            if (supplierId) {
                submitFormData.append('supplierId', supplierId.toString());
            }
            submitFormData.append('unitPrice', formData.unitPrice);
            submitFormData.append('sellingPrice', formData.sellingPrice);
            submitFormData.append('minimumStock', formData.minimumStock);
            submitFormData.append('currentStock', formData.currentStock);

            // Send as FormData with multipart header
            await api.post('/products', submitFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            onSuccess();
            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Error adding product:', err);
            setError(err.response?.data?.message || err.response?.data?.errors?.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-slate-100 rounded-lg transition"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                            <p className="text-sm text-rose-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Image Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Product Image
                                </label>
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-24 h-24 rounded-lg object-cover border border-slate-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
                                            <Upload size={24} className="text-slate-400" />
                                            <span className="text-xs text-slate-500 mt-1">Upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                    <p className="text-xs text-slate-400">JPG, PNG, WEBP up to 5MB</p>
                                </div>
                            </div>

                            {/* SKU */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    SKU *
                                </label>
                                <input
                                    type="text"
                                    value={formData.SKU}
                                    onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    placeholder="ELEC-HEAD-001"
                                />
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    placeholder="Wireless Headphones"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Category *
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Supplier */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Supplier
                                </label>
                                <select
                                    value={isNewSupplier ? 'new' : formData.supplierId}
                                    onChange={(e) => {
                                        if (e.target.value === 'new') {
                                            setIsNewSupplier(true);
                                            setFormData({ ...formData, supplierId: '' });
                                        } else {
                                            setIsNewSupplier(false);
                                            setFormData({ ...formData, supplierId: e.target.value });
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">No Supplier</option>
                                    {suppliers.map((sup) => (
                                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                                    ))}
                                    <option value="new">+ Create New Supplier</option>
                                </select>
                                
                                {isNewSupplier && (
                                    <input
                                        type="text"
                                        placeholder="Enter new supplier name"
                                        value={newSupplierName}
                                        onChange={(e) => setNewSupplierName(e.target.value)}
                                        className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required={isNewSupplier}
                                    />
                                )}
                            </div>

                            {/* Unit Price */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Unit Price *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    min="0"
                                    placeholder="59.99"
                                />
                            </div>

                            {/* Selling Price */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Selling Price *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.sellingPrice}
                                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    min="0"
                                    placeholder="79.99"
                                />
                            </div>

                            {/* Minimum Stock */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Minimum Stock
                                </label>
                                <input
                                    type="number"
                                    value={formData.minimumStock}
                                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    placeholder="8"
                                />
                            </div>

                            {/* Current Stock */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Current Stock
                                </label>
                                <input
                                    type="number"
                                    value={formData.currentStock}
                                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    placeholder="25"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Product description..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition font-medium text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding...' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}





// import { useState, useEffect } from 'react';
// import api from '../services/api';
// import { Upload, X } from 'lucide-react';

// interface Category {
//     id: number;
//     name: string;
// }

// interface Supplier {
//     id: number;
//     name: string;
// }

// interface AddProductModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSuccess: () => void;
// }

// export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
//     const [categories, setCategories] = useState<Category[]>([]);
//     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [imageFile, setImageFile] = useState<File | null>(null);
//     const [imagePreview, setImagePreview] = useState<string | null>(null);
    
//     const [isNewSupplier, setIsNewSupplier] = useState(false);
//     const [newSupplierName, setNewSupplierName] = useState('');
    
//     const [formData, setFormData] = useState({
//         SKU: '',
//         name: '',
//         description: '',
//         categoryId: '',
//         supplierId: '',
//         unitPrice: '',
//         sellingPrice: '',
//         minimumStock: '0',
//         currentStock: '0',
//     });

//     useEffect(() => {
//         if (isOpen) {
//             fetchCategories();
//             fetchSuppliers();
//             resetForm();
//         }
//     }, [isOpen]);

//     const fetchCategories = async () => {
//         try {
//             const response = await api.get('/categories');
//             setCategories(response.data.data);
//         } catch (error) {
//             console.error('Failed to fetch categories:', error);
//         }
//     };

//     const fetchSuppliers = async () => {
//         try {
//             const response = await api.get('/suppliers');
//             setSuppliers(response.data.data);
//         } catch (error) {
//             console.error('Failed to fetch suppliers:', error);
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             SKU: '',
//             name: '',
//             description: '',
//             categoryId: '',
//             supplierId: '',
//             unitPrice: '',
//             sellingPrice: '',
//             minimumStock: '0',
//             currentStock: '0',
//         });
//         setIsNewSupplier(false);
//         setNewSupplierName('');
//         setImageFile(null);
//         setImagePreview(null);
//         setError('');
//     };

//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             setImageFile(file);
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setImagePreview(reader.result as string);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         try {
//             let supplierId = formData.supplierId ? parseInt(formData.supplierId) : null;
            
//             if (isNewSupplier && newSupplierName.trim()) {
//                 const supplierRes = await api.post('/suppliers', { name: newSupplierName });
//                 supplierId = supplierRes.data.data.id;
//             }

//             // Create FormData for multipart upload
//             const submitFormData = new FormData();
//             submitFormData.append('SKU', formData.SKU);
//             submitFormData.append('name', formData.name);
//             submitFormData.append('description', formData.description || '');
//             submitFormData.append('categoryId', formData.categoryId);
//             if (supplierId) {
//                 submitFormData.append('supplierId', supplierId.toString());
//             }
//             submitFormData.append('unitPrice', formData.unitPrice);
//             submitFormData.append('sellingPrice', formData.sellingPrice);
//             submitFormData.append('minimumStock', formData.minimumStock);
//             submitFormData.append('currentStock', formData.currentStock);
            
//             // Append image if selected
//             if (imageFile) {
//                 submitFormData.append('image', imageFile);
//             }

//             const response = await api.post('/products', submitFormData, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
            
//             onSuccess();
//             onClose();
//         } catch (err: any) {
//             setError(err.response?.data?.message || 'Failed to add product');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
//             <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                 <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
//                     <div className="flex justify-between items-center">
//                         <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
//                         <button
//                             onClick={onClose}
//                             className="p-1 hover:bg-slate-100 rounded-lg transition"
//                         >
//                             <X size={20} className="text-slate-400" />
//                         </button>
//                     </div>
//                 </div>

//                 <div className="p-6">
//                     {error && (
//                         <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
//                             <p className="text-sm text-rose-600">{error}</p>
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit}>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             {/* Image Upload */}
//                             <div className="md:col-span-2">
//                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                     Product Image
//                                 </label>
//                                 <div className="flex items-center gap-4">
//                                     {imagePreview ? (
//                                         <div className="relative">
//                                             <img 
//                                                 src={imagePreview} 
//                                                 alt="Preview" 
//                                                 className="w-24 h-24 rounded-lg object-cover border border-slate-200"
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => {
//                                                     setImageFile(null);
//                                                     setImagePreview(null);
//                                                 }}
//                                                 className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-600"
//                                             >
//                                                 ×
//                                             </button>
//                                         </div>
//                                     ) : (
//                                         <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
//                                             <Upload size={24} className="text-slate-400" />
//                                             <span className="text-xs text-slate-500 mt-1">Upload</span>
//                                             <input
//                                                 type="file"
//                                                 accept="image/*"
//                                                 onChange={handleImageChange}
//                                                 className="hidden"
//                                             />
//                                         </label>
//                                     )}
//                                     <p className="text-xs text-slate-400">JPG, PNG, WEBP up to 5MB</p>
//                                 </div>
//                             </div>

//                             {/* SKU */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                     SKU *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={formData.SKU}
//                                     onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
//                                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     required
//                                 />
//                             </div>

//                             {/* Product Name */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                     Product Name *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={formData.name}
//                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     required
//                                 />
//                             </div>

//                             {/* Category */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                     Category *
//                                 </label>
//                                 <select
//                                     value={formData.categoryId}
//                                     onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
//                                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                 >
//                                     <option value="">Select Category</option>
//                                     {categories.map((cat) => (
//                                         <option key={cat.id} value={cat.id}>{cat.name}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Supplier */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                     Supplier
//                                 </label>
//                                 <select
//                                     value={isNewSupplier ? 'new' : formData.supplierId}
//                                     onChange={(e) => {
//                                         if (e.target.value === 'new') {
//                                             setIsNewSupplier(true);
//                                             setFormData({ ...formData, supplierId: '' });
//                                         } else {
//                                             setIsNewSupplier(false);
//                                             setFormData({ ...formData, supplierId: e.target.value });
//                                         }
//                                     }}
//                                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 >
//                                     <option value="">No Supplier</option>
//                                     {suppliers.map((sup) => (
//                                         <option key={sup.id} value={sup.id}>{sup.name}</option>
//                                     ))}
//                                     <option value="new">+ Create New Supplier</option>
//                                 </select>
                                
//                                 {isNewSupplier && (
//                                     <input
//                                         type="text"
//                                         placeholder="Enter new supplier name"
//                                         value={newSupplierName}
//                                         onChange={(e) => setNewSupplierName(e.target.value)}
//                                         className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         required={isNewSupplier}
//                                     />
//                                 )}
//                             </div>

//                             {/* Unit Price */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                     Unit Price *
//                                 </label>
//                                 <input
//                                     type="number"
//                                     step="0.01"
//                                     value={formData.unitPrice}
//                                     onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
//                                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                     min="0"
//                                 />
//                             </div>

//                             {/* Selling Price */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                     Selling Price *
//                                 </label>
//                                 <input
//                                     type="number"
//                                     step="0.01"
//                                     value={formData.sellingPrice}
//                                     onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
//                                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                     min="0"
//                                 />
//                             </div>

//                             {/* Minimum Stock */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                     Minimum Stock
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={formData.minimumStock}
//                                     onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
//                                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     min="0"
//                                 />
//                             </div>

//                             {/* Current Stock */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                     Current Stock
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={formData.currentStock}
//                                     onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
//                                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     min="0"
//                                 />
//                             </div>

//                             {/* Description */}
//                             <div className="md:col-span-2">
//                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                     Description
//                                 </label>
//                                 <textarea
//                                     value={formData.description}
//                                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                     rows={3}
//                                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                         </div>

//                         <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
//                             <button
//                                 type="button"
//                                 onClick={onClose}
//                                 className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition font-medium text-slate-700"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
//                             >
//                                 {loading ? 'Adding...' : 'Add Product'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }