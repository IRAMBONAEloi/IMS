// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../../services/api';
// import { authService } from '../../services/auth.service';
// import { LayoutDashboard, Package, Tags, Truck, RefreshCw, BarChart3, Users } from 'lucide-react';

// interface Supplier {
//     id: number;
//     name: string;
//     contactPerson: string | null;
//     phone: string | null;
//     email: string | null;
//     address: string | null;
//     _count?: { products: number };
// }

// export default function Suppliers() {
//     const navigate = useNavigate();
//     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [sidebarOpen, setSidebarOpen] = useState(() => {
//         const saved = localStorage.getItem('sidebarOpen');
//         return saved !== null ? saved === 'true' : true;
//     });
//     const [showModal, setShowModal] = useState(false);
//     const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
//     const [formData, setFormData] = useState({
//         name: '',
//         contactPerson: '',
//         phone: '',
//         email: '',
//         address: ''
//     });
//     const [error, setError] = useState('');
//     const user = authService.getUser();
//     const isAdmin = user?.role === 'ADMIN';

//     // Toast state
//     const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

//     // Confirmation Modal state
//     const [confirmModal, setConfirmModal] = useState({
//         isOpen: false,
//         title: '',
//         message: '',
//         action: null as (() => void) | null
//     });

//     useEffect(() => {
//         localStorage.setItem('sidebarOpen', String(sidebarOpen));
//     }, [sidebarOpen]);

//     useEffect(() => {
//         fetchSuppliers();
//     }, []);

//     const fetchSuppliers = async () => {
//         try {
//             const response = await api.get('/suppliers');
//             setSuppliers(response.data.data);
//         } catch (error) {
//             console.error('Failed to fetch suppliers:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleLogout = () => {
//         authService.logout();
//         navigate('/login');
//     };

//     // Show toast notification
//     const showToast = (message: string, type: 'success' | 'error') => {
//         setToast({ message, type });
//         setTimeout(() => {
//             setToast(null);
//         }, 3000);
//     };

//     // Show confirmation modal
//     const showConfirm = (title: string, message: string, action: () => void) => {
//         setConfirmModal({
//             isOpen: true,
//             title,
//             message,
//             action: () => {
//                 action();
//                 setConfirmModal({ isOpen: false, title: '', message: '', action: null });
//             }
//         });
//     };

//     // Close confirmation modal
//     const closeConfirm = () => {
//         setConfirmModal({ isOpen: false, title: '', message: '', action: null });
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError('');

//         try {
//             if (editingSupplier) {
//                 await api.put(`/suppliers/${editingSupplier.id}`, formData);
//                 showToast('Supplier updated successfully', 'success');
//             } else {
//                 await api.post('/suppliers', formData);
//                 showToast('Supplier created successfully', 'success');
//             }
//             setShowModal(false);
//             setEditingSupplier(null);
//             setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });
//             fetchSuppliers();
//         } catch (err: any) {
//             setError(err.response?.data?.message || 'Failed to save supplier');
//         }
//     };

//     const handleEdit = (supplier: Supplier) => {
//         setEditingSupplier(supplier);
//         setFormData({
//             name: supplier.name,
//             contactPerson: supplier.contactPerson || '',
//             phone: supplier.phone || '',
//             email: supplier.email || '',
//             address: supplier.address || ''
//         });
//         setShowModal(true);
//     };

//     const handleDelete = (id: number, productCount: number = 0) => {
//         if (productCount > 0) {
//             showToast(`Cannot delete supplier with ${productCount} linked products`, 'error');
//             return;
//         }
        
//         showConfirm(
//             'Delete Supplier',
//             'Are you sure you want to delete this supplier?',
//             async () => {
//                 try {
//                     await api.delete(`/suppliers/${id}`);
//                     fetchSuppliers();
//                     showToast('Supplier deleted successfully', 'success');
//                 } catch (err: any) {
//                     showToast(err.response?.data?.message || 'Failed to delete supplier', 'error');
//                 }
//             }
//         );
//     };

//     // Menu items with Lucide icons
//     const menuItems = [
//         { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
//         { name: 'Products', path: '/products', icon: <Package className="w-5 h-5" /> },
//         { name: 'Categories', path: '/categories', icon: <Tags className="w-5 h-5" /> },
//         { name: 'Suppliers', path: '/suppliers', icon: <Truck className="w-5 h-5" /> },
//         { name: 'Stock Movements', path: '/stock-movements', icon: <RefreshCw className="w-5 h-5" /> },
//         { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
//         { name: 'Users', path: '/users', icon: <Users className="w-5 h-5" /> },
//     ];

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-blue-100">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto"></div>
//                     <p className="mt-3 text-sm text-gray-500">Loading suppliers...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="h-screen overflow-hidden bg-blue-100 flex relative">
//             {sidebarOpen && (
//                 <div
//                     className="fixed inset-0 bg-black/40 z-20 lg:hidden"
//                     onClick={() => setSidebarOpen(false)}
//                 />
//             )}

//             {/* Sidebar */}
//             <aside
//                 className={`
//                     fixed lg:relative z-30
//                     h-screen
//                     bg-cyan-900 text-white
//                     transition-all duration-300
//                     flex flex-col shadow-lg
//                     ${sidebarOpen ? 'w-64' : 'w-20'}
//                 `}
//             >
//                 {/* Logo with click redirect */}
//                 <div 
//                     onClick={() => navigate('/dashboard')}
//                     className="cursor-pointer h-20 flex items-center justify-center border-b border-cyan-700"
//                 >
//                     {sidebarOpen ? (
//                         <div className="flex flex-col items-center justify-center">
//                             <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center mb-1">
//                                 <span className="text-xl font-bold text-cyan-900">I</span>
//                             </div>
//                             <span className="text-sm font-bold tracking-wide">INVENTORY</span>
//                             <span className="text-[10px] text-blue-200">Management System</span>
//                         </div>
//                     ) : (
//                         <div className="bg-cyan-50 hover:bg-white rounded-lg px-2 py-1.5">
//                             <span className="text-sm font-bold text-cyan-900">IMS</span>
//                         </div>
//                     )}
//                 </div>

//                 <nav className="flex-1 py-4 overflow-y-auto">
//                     {menuItems.map((item) => (
//                         <button
//                             key={item.name}
//                             onClick={() => {
//                                 navigate(item.path);
//                                 if (window.innerWidth < 1024) {
//                                     setSidebarOpen(false);
//                                 }
//                             }}
//                             className={`
//                                 w-full flex items-center
//                                 transition-all duration-200
//                                 ${sidebarOpen ? 'px-5 py-3' : 'px-2 py-2 justify-center'}
//                                 ${location.pathname === item.path
//                                     ? 'bg-cyan-800 border-l-4 border-white'
//                                     : 'hover:bg-cyan-800'}
//                             `}
//                         >
//                             {sidebarOpen ? (
//                                 <span className="text-sm">{item.name}</span>
//                             ) : (
//                                 <span className="text-white">{item.icon}</span>
//                             )}
//                         </button>
//                     ))}

//                     <div className="px-4 mt-4">
//                         <button
//                             onClick={() => setSidebarOpen(!sidebarOpen)}
//                             className="w-full py-2 bg-cyan-50 hover:bg-white text-cyan-900 rounded-lg text-sm font-bold transition"
//                         >
//                             {sidebarOpen ? '<' : '>'}
//                         </button>
//                     </div>
//                 </nav>

//                 <div className="p-4 border-t border-cyan-700">
//                     <div className="flex items-center gap-3">
//                         <div className="w-9 h-9 bg-cyan-50 rounded-full flex items-center justify-center font-bold text-cyan-900">
//                             {user?.name?.charAt(0) || 'U'}
//                         </div>
//                         {sidebarOpen && (
//                             <div className="min-w-0">
//                                 <p className="text-sm font-medium truncate">{user?.name}</p>
//                                 <p className="text-xs text-gray-50 uppercase">{user?.role}</p>
//                             </div>
//                         )}
//                     </div>
//                     {sidebarOpen && (
//                         <button
//                             onClick={handleLogout}
//                             className="mt-4 w-full py-2 bg-cyan-700 hover:bg-red-600 rounded-lg text-sm font-medium transition"
//                         >
//                             Logout
//                         </button>
//                     )}
//                 </div>
//             </aside>

//             {/* Main Content */}
//             <main className="flex-1 overflow-y-auto lg:ml-0">
//                 <div className="sticky top-0 z-10 bg-white shadow-sm px-4 sm:px-6 py-4">
//                     <div className="bg-cyan-900 rounded-lg px-4 sm:px-6 py-5 flex items-center justify-between">
//                         <div>
//                             <h1 className="text-2xl sm:text-3xl font-bold text-white">Suppliers</h1>
//                             <p className="text-sm text-blue-200 mt-1">Manage product suppliers</p>
//                         </div>
//                         <button
//                             onClick={() => setSidebarOpen(true)}
//                             className="lg:hidden bg-yellow-500 px-3 py-2 rounded-md text-cyan-900 font-bold"
//                         >
//                             ☰
//                         </button>
//                     </div>
//                 </div>

//                 <div className="p-4 sm:p-6">
//                     {/* Add Supplier Button */}
//                     <div className="mb-6 flex justify-end">
//                         {isAdmin && (
//                             <button onClick={() => { setEditingSupplier(null); setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' }); setShowModal(true); }} className="bg-yellow-500 hover:bg-yellow-400 text-cyan-900 font-bold py-2 px-4 rounded-lg transition">
//                                 + Add Supplier
//                             </button>
//                         )}
//                     </div>

//                     {/* Suppliers Table */}
//                     <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-sm">
//                                 <thead>
//                                     <tr className="bg-cyan-700 border-b">
//                                         <th className="text-center py-3 px-4 text-xs font-semibold text-white">Name</th>
//                                         <th className="text-center py-3 px-4 text-xs font-semibold text-white">Contact Person</th>
//                                         <th className="text-center py-3 px-4 text-xs font-semibold text-white">Phone</th>
//                                         <th className="text-center py-3 px-4 text-xs font-semibold text-white">Email</th>
//                                         <th className="text-center py-3 px-4 text-xs font-semibold text-white">Products</th>
//                                         <th className="text-center py-3 px-4 text-xs font-semibold text-white">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {suppliers.map((supplier) => (
//                                         <tr key={supplier.id} className="border-b hover:bg-gray-50">
//                                             <td className="py-3 px-4 font-medium text-gray-800">{supplier.name}</td>
//                                             <td className="py-3 px-4 text-gray-600">{supplier.contactPerson || '-'}</td>
//                                             <td className="py-3 px-4 text-gray-600">{supplier.phone || '-'}</td>
//                                             <td className="py-3 px-4 text-gray-600">{supplier.email || '-'}</td>
//                                             <td className="py-3 px-4 text-center">
//                                                 <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
//                                                     {supplier._count?.products || 0}
//                                                 </span>
//                                             </td>
//                                             <td className="py-3 px-4 text-center">
//                                                 {isAdmin && (
//                                                     <>
//                                                         <button onClick={() => handleEdit(supplier)} className="text-blue-600 hover:text-blue-800 mr-3">
//                                                             Edit
//                                                         </button>
//                                                         <button onClick={() => handleDelete(supplier.id, supplier._count?.products)} className="text-red-600 hover:text-red-800">
//                                                             Delete
//                                                         </button>
//                                                     </>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </main>

//             {/* Toast Notification */}
//             {toast && (
//                 <div className={`fixed top-20 right-4 z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}>
//                     <span>{toast.type === 'success' ? '✓' : '✗'}</span>
//                     <span>{toast.message}</span>
//                     <button onClick={() => setToast(null)} className="ml-4 text-white hover:text-gray-200">×</button>
//                 </div>
//             )}

//             {/* Confirmation Modal */}
//             {confirmModal.isOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
//                         <h2 className="text-xl font-bold text-cyan-900 mb-4">{confirmModal.title}</h2>
//                         <p className="text-gray-600 mb-6">{confirmModal.message}</p>
//                         <div className="flex justify-end gap-3">
//                             <button
//                                 onClick={closeConfirm}
//                                 className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={() => confirmModal.action && confirmModal.action()}
//                                 className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-cyan-900 font-bold rounded-lg transition"
//                             >
//                                 Confirm
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Modal */}
//             {showModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//                     <div className="bg-blue-50 rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
//                         <h2 className="text-xl font-bold text-cyan-900 mb-4">
//                             {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
//                         </h2>
                        
//                         {error && (
//                             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                                 <p className="text-sm text-red-600">{error}</p>
//                             </div>
//                         )}
                        
//                         <form onSubmit={handleSubmit}>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-semibold text-cyan-900 mb-1">Name *</label>
//                                 <input
//                                     type="text"
//                                     value={formData.name}
//                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                                     required
//                                 />
//                             </div>
                            
//                             <div className="mb-4">
//                                 <label className="block text-sm font-semibold text-cyan-900 mb-1">Contact Person</label>
//                                 <input
//                                     type="text"
//                                     value={formData.contactPerson}
//                                     onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
//                                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                                 />
//                             </div>
                            
//                             <div className="mb-4">
//                                 <label className="block text-sm font-semibold text-cyan-900 mb-1">Phone</label>
//                                 <input
//                                     type="tel"
//                                     value={formData.phone}
//                                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                                     placeholder="07xxxxxxxx"
//                                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                                 />
//                             </div>
                            
//                             <div className="mb-4">
//                                 <label className="block text-sm font-semibold text-cyan-900 mb-1">Email</label>
//                                 <input
//                                     type="email"
//                                     value={formData.email}
//                                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                                 />
//                             </div>
                            
//                             <div className="mb-6">
//                                 <label className="block text-sm font-semibold text-cyan-900 mb-1">Address</label>
//                                 <textarea
//                                     value={formData.address}
//                                     onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                                     rows={2}
//                                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                                 />
//                             </div>
                            
//                             <div className="flex justify-end gap-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setShowModal(false);
//                                         setEditingSupplier(null);
//                                         setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });
//                                         setError('');
//                                     }}
//                                     className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-cyan-900 font-bold rounded-lg transition"
//                                 >
//                                     {editingSupplier ? 'Update' : 'Create'}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }





import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {  
  Truck,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Grid3x3,
  List,
  Phone,
  Mail,
  MapPin,
  User,
  Building2
} from 'lucide-react';
import api from '../../services/api';
import { authService } from '../../services/auth.service';

interface Supplier {
    id: number;
    name: string;
    contactPerson: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    _count?: { products: number };
}

export default function Suppliers() {
    const navigate = useNavigate();
    const location = useLocation();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: ''
    });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    const user = authService.getUser();
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/suppliers');
            setSuppliers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
            showToast('Failed to load suppliers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('Supplier name is required', 'error');
            return;
        }

        try {
            await api.post('/suppliers', formData);
            showToast('Supplier added successfully', 'success');
            setShowAddModal(false);
            resetForm();
            fetchSuppliers();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to add supplier', 'error');
        }
    };

    const handleUpdateSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('Supplier name is required', 'error');
            return;
        }

        try {
            await api.put(`/suppliers/${selectedSupplier?.id}`, formData);
            showToast('Supplier updated successfully', 'success');
            setShowEditModal(false);
            setSelectedSupplier(null);
            resetForm();
            fetchSuppliers();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update supplier', 'error');
        }
    };

    const openDeleteModal = (supplier: Supplier) => {
        if (supplier._count?.products && supplier._count.products > 0) {
            showToast(`Cannot delete "${supplier.name}" because it has ${supplier._count.products} product(s) associated with it.`, 'error');
            return;
        }
        setSelectedSupplier(supplier);
        setShowDeleteModal(true);
    };

    const handleDeleteSupplier = async () => {
        if (!selectedSupplier) return;

        try {
            await api.delete(`/suppliers/${selectedSupplier.id}`);
            showToast('Supplier deleted successfully', 'success');
            setShowDeleteModal(false);
            setSelectedSupplier(null);
            fetchSuppliers();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to delete supplier', 'error');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setFormData({
            name: supplier.name,
            contactPerson: supplier.contactPerson || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || ''
        });
        setShowEditModal(true);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (supplier.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (supplier.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (supplier.phone || '').includes(searchTerm);
        return matchesSearch;
    });

    const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    const totalSuppliers = suppliers.length;
    const totalProducts = suppliers.reduce((sum, s) => sum + (s._count?.products || 0), 0);
    const suppliersWithProducts = suppliers.filter(s => (s._count?.products || 0) > 0).length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading suppliers...</p>
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
                                    className={`text-sm ${location.pathname === '/suppliers' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
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
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">🚚 Suppliers Management</h1>
                            <p className="text-gray-500">Manage your product suppliers and their contact information</p>
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
                                Add Supplier
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search suppliers by name, contact person, email or phone..."
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
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Suppliers</p>
                        <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Active Suppliers</p>
                        <p className="text-2xl font-bold text-green-600">{suppliersWithProducts > 0 ? suppliersWithProducts : totalSuppliers}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Products</p>
                        <p className="text-2xl font-bold text-purple-600">{totalProducts}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Avg Products/Supplier</p>
                        <p className="text-2xl font-bold text-orange-600">
                            {totalSuppliers ? Math.round(totalProducts / totalSuppliers) : 0}
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Showing {sortedSuppliers.length} suppliers
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

                {/* Suppliers Display */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {sortedSuppliers.map(supplier => {
                            const productCount = supplier._count?.products || 0;
                            
                            return (
                                <div key={supplier.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-blue-600" />
                                                <span className="font-semibold text-gray-900">{supplier.name}</span>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                {productCount} products
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        {supplier.contactPerson && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span>{supplier.contactPerson}</span>
                                            </div>
                                        )}
                                        {supplier.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{supplier.phone}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="truncate">{supplier.email}</span>
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="line-clamp-2">{supplier.address}</span>
                                            </div>
                                        )}
                                        {!supplier.contactPerson && !supplier.phone && !supplier.email && !supplier.address && (
                                            <p className="text-sm text-gray-400 italic mb-3">No contact information</p>
                                        )}
                                        
                                        <div className="pt-3 border-t border-gray-200">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(supplier)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(supplier)}
                                                    disabled={productCount > 0}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                                        productCount > 0
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                    }`}
                                                    title={productCount > 0 ? `Cannot delete: ${productCount} product(s) use this supplier` : 'Delete this supplier'}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        {productCount > 0 && (
                                            <p className="text-xs text-gray-600 mt-2 text-center">
                                                ⚠️ Has {productCount} product(s) - Cannot delete
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedSuppliers.map(supplier => {
                            const productCount = supplier._count?.products || 0;
                            
                            return (
                                <div key={supplier.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Building2 className="w-5 h-5 text-blue-600" />
                                                    <h3 className="font-semibold text-gray-900 text-lg">{supplier.name}</h3>
                                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                        {productCount} products
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    {supplier.contactPerson && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <User className="w-4 h-4 text-gray-400" />
                                                            <span>Contact: {supplier.contactPerson}</span>
                                                        </div>
                                                    )}
                                                    {supplier.phone && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Phone className="w-4 h-4 text-gray-400" />
                                                            <span>{supplier.phone}</span>
                                                        </div>
                                                    )}
                                                    {supplier.email && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Mail className="w-4 h-4 text-gray-400" />
                                                            <span>{supplier.email}</span>
                                                        </div>
                                                    )}
                                                    {supplier.address && (
                                                        <div className="flex items-center gap-2 text-gray-600 col-span-2">
                                                            <MapPin className="w-4 h-4 text-gray-400" />
                                                            <span>{supplier.address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {!supplier.contactPerson && !supplier.phone && !supplier.email && !supplier.address && (
                                                    <p className="text-sm text-gray-400 italic">No contact information</p>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(supplier)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(supplier)}
                                                        disabled={productCount > 0}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                            productCount > 0
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                        }`}
                                                        title={productCount > 0 ? `Cannot delete: ${productCount} product(s) use this supplier` : 'Delete this supplier'}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {productCount > 0 && (
                                            <p className="text-xs text-red-600 mt-3 pt-2 border-t border-gray-100">
                                                ⚠️ Cannot delete: This supplier has {productCount} product(s) associated with it
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {sortedSuppliers.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">No suppliers found</p>
                        <p className="text-sm text-gray-400 mt-1">Click "Add Supplier" to get started</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedSupplier && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-full bg-red-100">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Delete Supplier</h2>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-600 mb-2">
                                Are you sure you want to delete supplier <span className="font-semibold text-gray-900">"{selectedSupplier.name}"</span>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                This action cannot be undone. The supplier will be permanently removed.
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedSupplier(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSupplier}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Supplier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Supplier Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Add New Supplier</h2>
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
                        
                        <form onSubmit={handleAddSupplier}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Tech Distributors Ltd"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                    <input
                                        type="text"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        placeholder="e.g., John Doe"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="e.g., 078XXXXXXX"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="e.g., contact@supplier.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Full address"
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
                                    Save Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Supplier Modal */}
            {showEditModal && selectedSupplier && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Edit Supplier</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedSupplier(null);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateSupplier}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                    <input
                                        type="text"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                                        setSelectedSupplier(null);
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
                                    Update Supplier
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