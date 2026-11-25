import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { authService } from '../../services/auth.service';
import { 
    LayoutDashboard, Package, Tags, Truck, RefreshCw, 
    BarChart3, Users as UsersIcon, Search, ChevronLeft, ChevronRight,
    UserPlus, Trash2,Mail, Calendar,
    X, Check,
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
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading users...</p>
                </div>
            </div>
        );
    }

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
                    onClick={() => navigate('/dashboard')}
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
                                <p className="text-xs text-slate-500 uppercase">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    {sidebarOpen && (
                        <button
                            onClick={() => {
                                authService.logout();
                                navigate('/login');
                            }}
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
                                <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                                <p className="text-sm text-slate-500 mt-1">Manage system users and permissions</p>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
                            >
                                ☰
                            </button>
                        </div>
                        
                        {/* Search and Add User */}
                        <div className="flex flex-wrap gap-3 justify-between items-center">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setFormData({ name: '', email: '', password: '', role: 'STAFF' });
                                    setError('');
                                    setShowModal(true);
                                }}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
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
                                className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* User Card Header */}
                                <div className="relative h-24 bg-gradient-to-r from-blue-500 to-blue-600">
                                    <div className="absolute -bottom-8 left-5">
                                        <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center border-4 border-white">
                                            <span className="text-xl font-bold text-blue-600">
                                                {userItem.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* User Card Body */}
                                <div className="pt-10 pb-4 px-5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-800 text-lg truncate">{userItem.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail size={14} className="text-slate-400 flex-shrink-0" />
                                                <p className="text-sm text-slate-500 truncate">{userItem.email}</p>
                                            </div>
                                        </div>
                                        {getRoleBadge(userItem.role)}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                        <Calendar size={14} className="text-slate-400" />
                                        <p className="text-xs text-slate-400">
                                            Joined {new Date(userItem.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleDelete(userItem.id, userItem.name, userItem.email)}
                                            className="w-full py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Delete User
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                            <UsersIcon size={48} className="text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-400">No users found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg animate-slide-in ${
                    toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                    {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-4 text-white/80 hover:text-white">×</button>
                </div>
            )}

            {/* Confirmation Modal for Delete */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
                        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={24} className="text-rose-600" />
                        </div>
                        <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Confirm Delete</h2>
                        <p className="text-slate-500 text-center mb-6">
                            Are you sure you want to delete user <span className="font-semibold text-slate-800">"{confirmModal.userName}"</span>?<br />
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, userId: null, userName: '', userEmail: '' })}
                                className="flex-1 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition font-medium text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition font-medium"
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
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-slate-800">Add New User</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                                <p className="text-sm text-rose-600">{error}</p>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 transition-all"
                                    required
                                    placeholder="Enter full name"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 transition-all"
                                    required
                                    placeholder="user@example.com"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 transition-all"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 transition-all"
                                >
                                    <option value="STAFF">Staff</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition font-medium text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
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