// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../../services/api';
// import { authService } from '../../services/auth.service';
// import { 
//     LayoutDashboard, Package, Tags, Truck, RefreshCw, 
//     BarChart3, Users, Search, ChevronLeft, ChevronRight, 
//     TrendingUp, TrendingDown, AlertCircle, CheckCircle, 
//     DollarSign, Box, Layers, ShoppingBag, Star, Eye, ArrowRight
// } from 'lucide-react';

// interface DashboardData {
//     totalProducts: number;
//     activeProducts: number;
//     totalCategories: number;
//     totalSuppliers: number;
//     totalStockValue: number;
//     lowStockProducts: number;
//     outOfStockProducts: number;
//     recentMovements: any[];
// }

// interface Product {
//     id: number;
//     SKU: string;
//     name: string;
//     description: string;
//     imageUrl?: string;
//     currentStock: number;
//     minimumStock: number;
//     unitPrice: number;
//     sellingPrice: number;
//     status: string;
//     category: { id: number; name: string };
//     supplier: { id: number; name: string } | null;
// }

// const getProductImage = (product: Product): string => {
//     if (product.imageUrl) {
//         return `http://localhost:5000${product.imageUrl}`;
//     }
//     const colors = ['2563eb', '059669', 'd97706', 'dc2626', '7c3aed', 'db2777', '0891b2', '65a30d'];
//     const color = colors[product.id % colors.length];
//     return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name?.charAt(0) || 'P')}&background=${color}&color=fff&rounded=true&size=120&bold=true&length=2`;
// };

// export default function Dashboard() {
//     const navigate = useNavigate();
//     const [data, setData] = useState<DashboardData | null>(null);
//     const [products, setProducts] = useState<Product[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [sidebarOpen, setSidebarOpen] = useState(() => {
//         const saved = localStorage.getItem('sidebarOpen');
//         return saved !== null ? saved === 'true' : true;
//     });
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedCategory, setSelectedCategory] = useState('');
//     const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
//     const user = authService.getUser();

//     useEffect(() => {
//         localStorage.setItem('sidebarOpen', String(sidebarOpen));
//     }, [sidebarOpen]);

//     useEffect(() => {
//         fetchDashboard();
//         fetchProducts();
//         fetchCategories();
//     }, []);

//     const fetchDashboard = async () => {
//         try {
//             const response = await api.get('/dashboard');
//             setData(response.data.data);
//         } catch (error) {
//             console.error('Failed to fetch dashboard:', error);
//         }
//     };

//     const fetchProducts = async () => {
//         try {
//             const response = await api.get('/products');
//             setProducts(response.data.data);
//         } catch (error) {
//             console.error('Failed to fetch products:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchCategories = async () => {
//         try {
//             const response = await api.get('/categories');
//             setCategories(response.data.data);
//         } catch (error) {
//             console.error('Failed to fetch categories:', error);
//         }
//     };

//     const handleLogout = () => {
//         authService.logout();
//         navigate('/login');
//     };

//     const menuItems = [
//         { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
//         { name: 'Products', path: '/products', icon: <Package size={20} /> },
//         { name: 'Categories', path: '/categories', icon: <Tags size={20} /> },
//         { name: 'Suppliers', path: '/suppliers', icon: <Truck size={20} /> },
//         { name: 'Stock Movements', path: '/stock-movements', icon: <RefreshCw size={20} /> },
//         { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
//         { name: 'Users', path: '/users', icon: <Users size={20} /> },
//     ];

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-slate-100">
//                 <div className="text-center">
//                     <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//                     <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
//                 </div>
//             </div>
//         );
//     }

//     const summaryCards = [
//         { title: 'Total Products', value: data?.totalProducts || 0, icon: <Box size={24} />, color: 'blue' },
//         { title: 'Active Products', value: data?.activeProducts || 0, icon: <CheckCircle size={24} />, color: 'green' },
//         { title: 'Categories', value: data?.totalCategories || 0, icon: <Layers size={24} />, color: 'purple' },
//         { title: 'Suppliers', value: data?.totalSuppliers || 0, icon: <Truck size={24} />, color: 'orange' },
//         { title: 'Stock Value', value: `${((data?.totalStockValue || 0) * 1300 / 1000).toFixed(1)}K RWF`, icon: <DollarSign size={24} />, color: 'yellow' },
//         { title: 'Low Stock', value: data?.lowStockProducts || 0, icon: <AlertCircle size={24} />, color: 'red' },
//         { title: 'Out of Stock', value: data?.outOfStockProducts || 0, icon: <ShoppingBag size={24} />, color: 'gray' },
//     ];

//     const getColorClasses = (color: string) => {
//         const colors: Record<string, { light: string; text: string; border: string }> = {
//             blue: { light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
//             green: { light: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
//             purple: { light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
//             orange: { light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
//             yellow: { light: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
//             red: { light: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
//             gray: { light: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
//         };
//         return colors[color] || colors.blue;
//     };

//     const getStockStatus = (stock: number, minStock: number) => {
//         if (stock === 0) return { label: 'Out of Stock', color: 'red', bg: 'bg-red-100', text: 'text-red-700' };
//         if (stock <= minStock) return { label: 'Low Stock', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700' };
//         return { label: 'In Stock', color: 'green', bg: 'bg-green-100', text: 'text-green-700' };
//     };

//     const filteredProducts = products.filter(product => {
//         const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                              product.SKU.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesCategory = selectedCategory ? product.category.id.toString() === selectedCategory : true;
//         return matchesSearch && matchesCategory && product.status === 'ACTIVE';
//     });

//     const displayedProducts = filteredProducts.slice(0, 6);

//     return (
//         <div className="min-h-screen bg-slate-100 flex">
//             {/* Sidebar */}
//             <aside
//                 className={`
//                     fixed lg:relative z-30
//                     h-screen
//                     bg-white
//                     transition-all duration-300
//                     flex flex-col shadow-lg
//                     border-r border-slate-200
//                     ${sidebarOpen ? 'w-64' : 'w-20'}
//                 `}
//             >
//                 <div 
//                     onClick={() => navigate('/dashboard')}
//                     className="cursor-pointer h-16 flex items-center justify-center border-b border-slate-200 px-4"
//                 >
//                     {sidebarOpen ? (
//                         <div className="flex items-center gap-2.5">
//                             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
//                                 <span className="text-white font-bold text-lg">I</span>
//                             </div>
//                             <div>
//                                 <span className="font-bold text-slate-800">INVENTORY</span>
//                                 <p className="text-[10px] text-slate-400 -mt-0.5">Management System</p>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
//                             <span className="text-white font-bold text-lg">I</span>
//                         </div>
//                     )}
//                 </div>

//                 <nav className="flex-1 py-6 px-3 space-y-1">
//                     {menuItems.map((item) => (
//                         <button
//                             key={item.name}
//                             onClick={() => navigate(item.path)}
//                             className={`
//                                 w-full flex items-center gap-3
//                                 transition-all duration-200 rounded-lg
//                                 ${sidebarOpen ? 'px-3 py-2.5' : 'justify-center py-3'}
//                                 ${location.pathname === item.path
//                                     ? 'bg-blue-50 text-blue-600' 
//                                     : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
//                             `}
//                         >
//                             <span className={location.pathname === item.path ? 'text-blue-600' : 'text-slate-400'}>
//                                 {item.icon}
//                             </span>
//                             {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
//                         </button>
//                     ))}
//                 </nav>

//                 <div className="p-4 border-t border-slate-200">
//                     <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
//                         <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
//                             <span className="text-sm font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
//                         </div>
//                         {sidebarOpen && (
//                             <div className="flex-1">
//                                 <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
//                                 <p className="text-xs text-slate-500 uppercase">{user?.role}</p>
//                             </div>
//                         )}
//                     </div>
//                     {sidebarOpen && (
//                         <button
//                             onClick={handleLogout}
//                             className="mt-3 w-full py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all"
//                         >
//                             Logout
//                         </button>
//                     )}
//                 </div>

//                 <button
//                     onClick={() => setSidebarOpen(!sidebarOpen)}
//                     className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-all"
//                 >
//                     {sidebarOpen ? <ChevronLeft size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
//                 </button>
//             </aside>

//             {/* Main Content */}
//             <main className="flex-1 overflow-y-auto">
//                 {/* Header */}
//                 <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
//                     <div className="px-8 py-5">
//                         <div className="flex justify-between items-center mb-5">
//                             <div>
//                                 <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
//                                 <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.name}</p>
//                             </div>
//                             <button
//                                 onClick={() => setSidebarOpen(true)}
//                                 className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
//                             >
//                                 ☰
//                             </button>
//                         </div>
                        
//                         {/* Search and Filter */}
//                         <div className="flex flex-wrap gap-3">
//                             <div className="relative flex-1 max-w-md">
//                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                                 <input
//                                     type="text"
//                                     placeholder="Search products..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 transition-all"
//                                 />
//                             </div>
//                             <select
//                                 value={selectedCategory}
//                                 onChange={(e) => setSelectedCategory(e.target.value)}
//                                 className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-sm"
//                             >
//                                 <option value="">All Categories</option>
//                                 {categories.map(cat => (
//                                     <option key={cat.id} value={cat.id}>{cat.name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Summary Cards */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 p-6">
//                     {summaryCards.map((card, idx) => {
//                         const colors = getColorClasses(card.color);
//                         return (
//                             <div key={idx} className="group relative bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300">
//                                 <div className={`absolute top-0 right-0 w-16 h-16 ${colors.light} rounded-bl-2xl opacity-50`}></div>
//                                 <div className="relative z-10">
//                                     <div className={`w-10 h-10 ${colors.light} rounded-lg flex items-center justify-center mb-3 ${colors.text}`}>
//                                         {card.icon}
//                                     </div>
//                                     <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{card.title}</p>
//                                     <p className="text-lg font-bold text-slate-800 mt-1">{card.value}</p>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* Products Grid with Images */}
//                 <div className="px-6 mb-8">
//                     <div className="flex justify-between items-center mb-5">
//                         <div>
//                             <h2 className="text-lg font-semibold text-slate-800">Featured Products</h2>
//                             <p className="text-sm text-slate-500 mt-0.5">Quick view of your inventory items</p>
//                         </div>
//                         <button 
//                             onClick={() => navigate('/products')}
//                             className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
//                         >
//                             View All Products
//                             <ArrowRight size={16} />
//                         </button>
//                     </div>
                    
//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-5">
//                         {displayedProducts.map((product) => {
//                             const stockStatus = getStockStatus(product.currentStock, product.minimumStock);
//                             return (
//                                 <div 
//                                     key={product.id} 
//                                     onClick={() => navigate(`/products/${product.id}/edit`)}
//                                     className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
//                                 >
//                                     {/* Product Image */}
//                                     <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
//                                         {product.imageUrl ? (
//                                             <img 
//                                                 src={getProductImage(product)}
//                                                 alt={product.name}
//                                                 className="h-full w-full object-cover"
//                                                 onError={(e) => {
//                                                     (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${product.name.charAt(0)}&background=3b82f6&color=fff&rounded=true&size=120&bold=true`;
//                                                 }}
//                                             />
//                                         ) : (
//                                             <Package size={40} className="text-slate-300" />
//                                         )}
//                                         <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${stockStatus.bg} ${stockStatus.text}`}>
//                                             {stockStatus.label}
//                                         </div>
//                                     </div>
                                    
//                                     <div className="p-3">
//                                         <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{product.name}</h3>
//                                         <p className="text-xs text-slate-400 mt-0.5">{product.SKU}</p>
                                        
//                                         <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
//                                             <div>
//                                                 <p className="text-xs text-slate-400">Price</p>
//                                                 <p className="text-sm font-bold text-blue-600">${product.sellingPrice.toFixed(2)}</p>
//                                             </div>
//                                             <div className="text-right">
//                                                 <p className="text-xs text-slate-400">Stock</p>
//                                                 <p className={`text-xs font-semibold ${
//                                                     product.currentStock === 0 ? 'text-rose-600' :
//                                                     product.currentStock <= product.minimumStock ? 'text-amber-600' : 'text-green-600'
//                                                 }`}>
//                                                     {product.currentStock} units
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
                    
//                     {displayedProducts.length === 0 && (
//                         <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
//                             <Package size={48} className="text-slate-300 mx-auto mb-3" />
//                             <p className="text-slate-400">No products found</p>
//                         </div>
//                     )}
//                 </div>

//                 {/* Recent Stock Movements */}
//                 <div className="mx-6 mb-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//                     <div className="px-6 py-4 border-b border-slate-200">
//                         <div>
//                             <h2 className="text-lg font-semibold text-slate-800">Recent Stock Movements</h2>
//                             <p className="text-sm text-slate-500 mt-0.5">Latest inventory transactions</p>
//                         </div>
//                     </div>
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead>
//                                 <tr className="border-b border-slate-200 bg-slate-50">
//                                     <th className="text-left py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Product</th>
//                                     <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Type</th>
//                                     <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Quantity</th>
//                                     <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Date</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {data?.recentMovements?.slice(0, 5).map((movement, idx) => (
//                                     <tr key={movement.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
//                                         <td className="py-3.5 px-6">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
//                                                     <Package size={14} className="text-blue-600" />
//                                                 </div>
//                                                 <div>
//                                                     <p className="font-medium text-slate-800">{movement.product?.name}</p>
//                                                     <p className="text-xs text-slate-400">{movement.product?.SKU}</p>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="py-3.5 px-6">
//                                             {movement.movementType === 'STOCK_IN' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">IN</span>}
//                                             {movement.movementType === 'STOCK_OUT' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">OUT</span>}
//                                             {movement.movementType === 'ADJUSTMENT' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">ADJ</span>}
//                                             {movement.movementType === 'RETURN' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">RET</span>}
//                                         </td>
//                                         <td className="py-3.5 px-6">
//                                             <span className={`font-semibold ${
//                                                 movement.movementType === 'STOCK_IN' ? 'text-green-600' :
//                                                 movement.movementType === 'STOCK_OUT' ? 'text-rose-600' : 'text-blue-600'
//                                             }`}>
//                                                 {movement.movementType === 'STOCK_IN' ? '+' : '-'}{movement.quantity}
//                                             </span>
//                                         </td>
//                                         <td className="py-3.5 px-6 text-sm text-slate-500">
//                                             {new Date(movement.createdAt).toLocaleDateString()}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }







import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { authService } from '../../services/auth.service';
import { 
    LayoutDashboard, Package, Tags, Truck, RefreshCw, 
    BarChart3, Users, Search, ChevronLeft, ChevronRight, 
    TrendingUp, AlertCircle, CheckCircle, 
    DollarSign, Box, Layers, ShoppingBag,ArrowRight
} from 'lucide-react';

interface DashboardData {
    totalProducts: number;
    activeProducts: number;
    totalCategories: number;
    totalSuppliers: number;
    totalStockValue: number;
    lowStockProducts: number;
    outofStockProducts: number;  // ✅ Note: field name is outofStockProducts (from your backend)
    recentMovements: any[];
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
    category: { id: number; name: string };
    supplier: { id: number; name: string } | null;
}

const getProductImage = (product: Product): string => {
    if (product.imageUrl) {
        return `http://localhost:5000${product.imageUrl}`;
    }
    const colors = ['2563eb', '059669', 'd97706', 'dc2626', '7c3aed', 'db2777', '0891b2', '65a30d'];
    const color = colors[product.id % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name?.charAt(0) || 'P')}&background=${color}&color=fff&rounded=true&size=120&bold=true&length=2`;
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? saved === 'true' : true;
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const user = authService.getUser();

    useEffect(() => {
        localStorage.setItem('sidebarOpen', String(sidebarOpen));
    }, [sidebarOpen]);

    useEffect(() => {
        fetchDashboard();
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/dashboard');
            console.log('Dashboard data:', response.data.data); // Debug log
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Products', path: '/products', icon: <Package size={20} /> },
        { name: 'Categories', path: '/categories', icon: <Tags size={20} /> },
        { name: 'Suppliers', path: '/suppliers', icon: <Truck size={20} /> },
        { name: 'Stock Movements', path: '/stock-movements', icon: <RefreshCw size={20} /> },
        { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
        { name: 'Users', path: '/users', icon: <Users size={20} /> },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const summaryCards = [
        { title: 'Total Products', value: data?.totalProducts || 0, icon: <Box size={24} />, color: 'blue' },
        { title: 'Active Products', value: data?.activeProducts || 0, icon: <CheckCircle size={24} />, color: 'green' },
        { title: 'Categories', value: data?.totalCategories || 0, icon: <Layers size={24} />, color: 'purple' },
        { title: 'Suppliers', value: data?.totalSuppliers || 0, icon: <Truck size={24} />, color: 'orange' },
        { title: 'Stock Value', value: `${((data?.totalStockValue || 0) * 1300 / 1000).toFixed(1)}K RWF`, icon: <DollarSign size={24} />, color: 'yellow' },
        { title: 'Low Stock', value: data?.lowStockProducts || 0, icon: <AlertCircle size={24} />, color: 'red' },
        { title: 'Out of Stock', value: data?.outofStockProducts || 0, icon: <ShoppingBag size={24} />, color: 'gray' }, // ✅ Fixed: using outofStockProducts
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { light: string; text: string; border: string }> = {
            blue: { light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
            green: { light: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
            purple: { light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
            orange: { light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
            yellow: { light: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
            red: { light: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
            gray: { light: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
        };
        return colors[color] || colors.blue;
    };

    const getStockStatus = (stock: number, minStock: number) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'red', bg: 'bg-red-100', text: 'text-red-700' };
        if (stock <= minStock) return { label: 'Low Stock', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700' };
        return { label: 'In Stock', color: 'green', bg: 'bg-green-100', text: 'text-green-700' };
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.SKU.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? product.category.id.toString() === selectedCategory : true;
        return matchesSearch && matchesCategory && product.status === 'ACTIVE';
    });

    const displayedProducts = filteredProducts.slice(0, 6);

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
                            onClick={handleLogout}
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
                                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                                <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.name}</p>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
                            >
                                ☰
                            </button>
                        </div>
                        
                        {/* Search and Filter */}
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 transition-all"
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-sm"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 p-6">
                    {summaryCards.map((card, idx) => {
                        const colors = getColorClasses(card.color);
                        return (
                            <div key={idx} className="group relative bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className={`absolute top-0 right-0 w-16 h-16 ${colors.light} rounded-bl-2xl opacity-50`}></div>
                                <div className="relative z-10">
                                    <div className={`w-10 h-10 ${colors.light} rounded-lg flex items-center justify-center mb-3 ${colors.text}`}>
                                        {card.icon}
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{card.title}</p>
                                    <p className="text-lg font-bold text-slate-800 mt-1">{card.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Products Grid with Images */}
                <div className="px-6 mb-8">
                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">Featured Products</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Quick view of your inventory items</p>
                        </div>
                        <button 
                            onClick={() => navigate('/products')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            View All Products
                            <ArrowRight size={16} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                        {displayedProducts.map((product) => {
                            const stockStatus = getStockStatus(product.currentStock, product.minimumStock);
                            return (
                                <div 
                                    key={product.id} 
                                    onClick={() => navigate(`/products/${product.id}/edit`)}
                                    className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                >
                                    {/* Product Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                                        {product.imageUrl ? (
                                            <img 
                                                src={getProductImage(product)}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${product.name.charAt(0)}&background=3b82f6&color=fff&rounded=true&size=120&bold=true`;
                                                }}
                                            />
                                        ) : (
                                            <Package size={40} className="text-slate-300" />
                                        )}
                                        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${stockStatus.bg} ${stockStatus.text}`}>
                                            {stockStatus.label}
                                        </div>
                                    </div>
                                    
                                    <div className="p-3">
                                        <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{product.name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">{product.SKU}</p>
                                        
                                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                                            <div>
                                                <p className="text-xs text-slate-400">Price</p>
                                                <p className="text-sm font-bold text-blue-600">${product.sellingPrice.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400">Stock</p>
                                                <p className={`text-xs font-semibold ${
                                                    product.currentStock === 0 ? 'text-rose-600' :
                                                    product.currentStock <= product.minimumStock ? 'text-amber-600' : 'text-green-600'
                                                }`}>
                                                    {product.currentStock} units
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {displayedProducts.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                            <Package size={48} className="text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-400">No products found</p>
                        </div>
                    )}
                </div>

                {/* Recent Stock Movements */}
                <div className="mx-6 mb-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">Recent Stock Movements</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Latest inventory transactions</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Product</th>
                                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Type</th>
                                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Quantity</th>
                                    <th className="text-center py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.recentMovements?.slice(0, 5).map((movement, idx) => (
                                    <tr key={movement.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <Package size={14} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{movement.product?.name}</p>
                                                    <p className="text-xs text-slate-400">{movement.product?.SKU}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6 text-center">
                                            {movement.movementType === 'STOCK_IN' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">IN</span>}
                                            {movement.movementType === 'STOCK_OUT' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">OUT</span>}
                                            {movement.movementType === 'ADJUSTMENT' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">ADJ</span>}
                                            {movement.movementType === 'RETURN' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">RET</span>}
                                        </td>
                                        <td className="py-3.5 px-6 text-center">
                                            <span className={`font-semibold ${
                                                movement.movementType === 'STOCK_IN' ? 'text-green-600' :
                                                movement.movementType === 'STOCK_OUT' ? 'text-rose-600' : 'text-blue-600'
                                            }`}>
                                                {movement.movementType === 'STOCK_IN' ? '+' : '-'}{movement.quantity}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6 text-center text-sm text-slate-500">
                                            {new Date(movement.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}


