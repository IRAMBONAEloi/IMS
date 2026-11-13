import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Archive, Package, Plus, Search } from 'lucide-react';
import AppShell from '../../components/AppShell';
import ProductFormModal from '../../components/ProductFormModal';
import api from '../../services/api';
import { authService } from '../../services/auth.service';
import { fetcher } from '../../services/fetcher';

type Category = { id: number; name: string };
type Supplier = { id: number; name: string };
type Product = { id: number; SKU: string; name: string; description?: string; imageUrl?: string | null; currentStock: number; minimumStock: number; unitPrice: number; sellingPrice: number; status: 'ACTIVE' | 'INACTIVE'; category: Category; supplier?: Supplier | null; categoryId: number; supplierId?: number | null };

const money = (amount: number, currency: string) => new Intl.NumberFormat('en-RW', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);

export default function Products() {
  const user = authService.getUser();
  const admin = user?.role === 'ADMIN';
  const { data: products = [], error, isLoading, mutate } = useSWR<Product[]>('/products', fetcher);
  const { data: categories = [] } = useSWR<Category[]>('/categories', fetcher);
  const { data: suppliers = [] } = useSWR<Supplier[]>('/suppliers', fetcher);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [notice, setNotice] = useState('');
  const currency = user?.currency || 'RWF';

  const visible = useMemo(() => products.filter((product) => {
    const text = `${product.name} ${product.SKU} ${product.category?.name || ''}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (filter === 'ALL' || String(product.categoryId) === filter) && (showInactive || product.status === 'ACTIVE');
  }), [products, search, filter, showInactive]);

  const saveProduct = async (formData: FormData) => {
    if (editing) await api.put(`/products/${editing.id}`, formData);
    else await api.post('/products', formData);
    await mutate();
    setModalOpen(false);
    setEditing(null);
    setNotice(editing ? 'Product details updated.' : 'Product added to your inventory.');
    window.setTimeout(() => setNotice(''), 3500);
  };

  const toggleStatus = async (product: Product) => {
    const action = product.status === 'ACTIVE' ? 'deactivate' : 'activate';
    try { await api.patch(`/products/${product.id}/${action}`); await mutate(); }
    catch { setNotice('Could not update product status. Try again.'); }
  };

  return (
    <AppShell title="Products" description="One reliable list of what your shop carries." actions={admin ? <button className="ims-button ims-button-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Add product</button> : undefined}>
      {notice && <div className="ims-form-success ims-section-spacer" role="status">{notice}</div>}
      <section className="ims-panel">
        <div className="ims-toolbar">
          <label className="ims-search"><Search size={16} /><input aria-label="Search products" placeholder="Search by name, SKU or category" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="ims-toolbar-filters"><label className="sr-only" htmlFor="category-filter">Filter by category</label><select id="category-filter" className="ims-filter-select" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
            <label className="ims-check-label"><input type="checkbox" checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)} /> Include inactive</label>
          </div>
        </div>
        {error && <div className="ims-error-state" role="alert">Could not load products. Check the backend connection and refresh.</div>}
        {isLoading ? <div className="ims-loading-list"><div className="ims-skeleton" /><div className="ims-skeleton" /><div className="ims-skeleton" /></div> : visible.length ? <div className="ims-table-wrap"><table className="ims-table"><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Unit cost</th><th>Status</th>{admin && <th>Actions</th>}</tr></thead><tbody>{visible.map((product) => <tr key={product.id}><td><div className="ims-product-cell"><span className="ims-product-thumb">{product.imageUrl ? <img src={product.imageUrl} alt="" loading="lazy" /> : <Package size={16} />}</span><span><strong>{product.name}</strong><small>{product.supplier?.name || 'No supplier'}</small></span></div></td><td className="ims-mono">{product.SKU}</td><td>{product.category?.name || '—'}</td><td><span className={`ims-stock-badge ${product.currentStock === 0 ? 'is-empty' : product.currentStock <= product.minimumStock ? 'is-low' : 'is-good'}`}>{product.currentStock} {product.currentStock === 1 ? 'unit' : 'units'}</span><small className="ims-minimum-note">Min. {product.minimumStock}</small></td><td><strong>{money(product.unitPrice, currency)}</strong></td><td><span className={`ims-status-dot ${product.status === 'ACTIVE' ? 'is-active' : ''}`}>{product.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span></td>{admin && <td><div className="ims-row-actions"><button className="ims-text-button" onClick={() => { setEditing(product); setModalOpen(true); }}>Edit</button><button className="ims-text-button muted" onClick={() => void toggleStatus(product)}>{product.status === 'ACTIVE' ? 'Archive' : 'Restore'}</button></div></td>}</tr>)}</tbody></table></div> : <div className="ims-empty"><span className="ims-empty-icon">{search ? <Search size={18} /> : <Package size={18} />}</span><h3>{search ? 'No matches found' : 'Your product list is ready'}</h3><p>{search ? 'Try another name, SKU, or category.' : 'Add your first item to start keeping stock with confidence.'}</p>{admin && !search && <button className="ims-button ims-button-dark" onClick={() => setModalOpen(true)}><Plus size={14} /> Add first product</button>}{search && <button className="ims-text-button" onClick={() => { setSearch(''); setFilter('ALL'); }}>Clear filters</button>}</div>}
        <div className="ims-table-footer"><span>{visible.length} of {products.length} products</span><span><Archive size={13} /> Stock level changes are recorded in Stock activity</span></div>
      </section>
      {modalOpen && <ProductFormModal product={editing} categories={categories} suppliers={suppliers} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={saveProduct} />}
    </AppShell>
  );
}
