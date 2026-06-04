import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { authService } from '../../services/auth.service';
import { 
    LayoutDashboard, Package, Tags, Truck, RefreshCw, 
    BarChart3, Users as UsersIcon, Search, ChevronLeft, ChevronRight,
    UserPlus, Trash2, User, Mail, Calendar, X, Check
} from 'lucide-react';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}

export default function Users() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? saved === 'true' : true;
    });
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STAFF'
    });
    const [error, setError] = useState('');
    const user = authService.getUser();
 

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Confirmation Modal state for delete
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        userId: null as number | null,
        userName: '',
        userEmail: '',
    });

    useEffect(() => {
        localStorage.setItem('sidebarOpen', String(sidebarOpen));
    }, [sidebarOpen]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/users', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'STAFF' });
            fetchUsers();
            showToast('User created successfully', 'success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDelete = (id: number, name: string, email: string) => {
        // Prevent deleting default admin account
        if (email === 'admin@inventory.com') {
            showToast('Cannot delete the default Admin account', 'error');
            return;
        }
        
        // Prevent deleting default staff account
        if (email === 'staff@inventory.com') {
            showToast('Cannot delete the default Staff account', 'error');
            return;
        }
        
        // Don't allow deleting yourself
        if (user?.id === id) {
            showToast('You cannot delete your own account', 'error');
            return;
        }
        
        setConfirmModal({
            isOpen: true,
            userId: id,
            userName: name,
            userEmail: email,
        });
    };

    const confirmDelete = async () => {
        if (!confirmModal.userId) return;
        
        try {
            await api.delete(`/users/${confirmModal.userId}`);
            fetchUsers();
            showToast(`User "${confirmModal.userName}" deleted successfully`, 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to delete user', 'error');
        } finally {
            setConfirmModal({ isOpen: false, userId: null, userName: '', userEmail: '' });
        }
    };

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Products', path: '/products', icon: <Package size={20} /> },
        { name: 'Categories', path: '/categories', icon: <Tags size={20} /> },
        { name: 'Suppliers', path: '/suppliers', icon: <Truck size={20} /> },
        { name: 'Stock Movements', path: '/stock-movements', icon: <RefreshCw size={20} /> },
        { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
        { name: 'Users', path: '/users', icon: <UsersIcon size={20} /> },
    ];

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        if (role === 'ADMIN') {
            return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200">ADMIN</span>;
        }
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">STAFF</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:relative z-30
                    h-screen
                    bg-white
                    transition-all duration-300
                    flex flex-col shadow-xl
                    ${sidebarOpen ? 'w-64' : 'w-20'}
                `}
            >
                <div 
                    onClick={() => navigate('/dashboard')}
                    className="cursor-pointer h-16 flex items-center justify-center border-b border-gray-100 px-4"
                >
                    {sidebarOpen ? (
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">I</span>
                            </div>
                            <div>
                                <span className="font-bold text-gray-800">INVENTORY</span>
                                <p className="text-[10px] text-gray-400 -mt-0.5">Management System</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
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
                                transition-all duration-200 rounded-xl
                                ${sidebarOpen ? 'px-3 py-2.5' : 'justify-center py-3'}
                                ${location.pathname === item.path
                                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                            `}
                        >
                            <span className={location.pathname === item.path ? 'text-blue-600' : 'text-gray-400'}>
                                {item.icon}
                            </span>
                            {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-sm font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 uppercase">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    {sidebarOpen && (
                        <button
                            onClick={() => {
                                authService.logout();
                                navigate('/login');
                            }}
                            className="mt-3 w-full py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                        >
                            Logout
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-all"
                >
                    {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                    <div className="px-8 py-5">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">User Management</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage system users and permissions</p>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition"
                            >
                                ☰
                            </button>
                        </div>
                        
                        {/* Search and Add User */}
                        <div className="flex flex-wrap gap-3 justify-between items-center">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setFormData({ name: '', email: '', password: '', role: 'STAFF' });
                                    setError('');
                                    setShowModal(true);
                                }}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <UserPlus size={18} />
                                Add User
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredUsers.map((userItem) => (
                            <div 
                                key={userItem.id}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* User Card Header */}
                                <div className="relative h-24 bg-gradient-to-r from-blue-500 to-blue-600">
                                    <div className="absolute -bottom-8 left-5">
                                        <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
                                            <span className="text-xl font-bold text-blue-600">
                                                {userItem.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* User Card Body */}
                                <div className="pt-10 pb-4 px-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-lg">{userItem.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail size={14} className="text-gray-400" />
                                                <p className="text-sm text-gray-500">{userItem.email}</p>
                                            </div>
                                        </div>
                                        {getRoleBadge(userItem.role)}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                        <Calendar size={14} className="text-gray-400" />
                                        <p className="text-xs text-gray-400">
                                            Joined {new Date(userItem.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4 pt-2">
                                        <button
                                            onClick={() => handleDelete(userItem.id, userItem.name, userItem.email)}
                                            className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <UsersIcon size={48} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400">No users found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-20 right-4 z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in`}>
                    <span>{toast.type === 'success' ? <Check size={18} /> : <X size={18} />}</span>
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-4 text-white hover:text-gray-200">×</button>
                </div>
            )}

            {/* Confirmation Modal for Delete */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={24} className="text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Confirm Delete</h2>
                        <p className="text-gray-500 text-center mb-6">
                            Are you sure you want to delete user <span className="font-semibold text-gray-800">"{confirmModal.userName}"</span>?<br />
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, userId: null, userName: '', userEmail: '' })}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    required
                                    placeholder="Enter full name"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    required
                                    placeholder="user@example.com"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="STAFF">Staff</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition font-medium"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}