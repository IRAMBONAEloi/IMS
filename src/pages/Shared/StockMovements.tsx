import { useMemo, useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { ArrowDownToLine, ArrowUpFromLine, ClipboardList, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import { fetcher } from '../../services/fetcher';

type Product = { id: number; name: string; SKU: string; currentStock: number };
type Movement = { id: number; movementType: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'RETURN'; quantity: number; previousStock: number; newStock: number; reason?: string | null; reference?: string | null; createdAt: string; product: { name: string; SKU: string }; user: { name: string } };

const dateTime = (value: string) => new Intl.DateTimeFormat('en-RW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const label = (value: string) => value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function StockMovements() {
  const { data: movements = [], error, isLoading, mutate } = useSWR<Movement[]>('/stock-movements', fetcher);
  const { data: products = [] } = useSWR<Product[]>('/products?status=ACTIVE', fetcher);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const visible = useMemo(() => movements.filter((movement) => {
    const matchesSearch = `${movement.product?.name || ''} ${movement.product?.SKU || ''} ${movement.reason || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === 'ALL' || movement.movementType === filter);
  }), [movements, search, filter]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    const data = new FormData(event.currentTarget);
    const payload = { productId: Number(data.get('productId')), movementType: data.get('movementType'), quantity: Number(data.get('quantity')), reason: String(data.get('reason') || ''), reference: String(data.get('reference') || '') };
    try {
      await api.post('/stock-movements', payload);
      await Promise.all([mutate(), api.get('/dashboard')]);
      setOpen(false);
      setNotice('Stock activity recorded. Your inventory is up to date.');
      window.setTimeout(() => setNotice(''), 3500);
    } catch (cause) {
      setErrorMessage((cause as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not record this stock change. Try again.');
    } finally { setSaving(false); }
  };

  return <AppShell title="Stock activity" description="Every change, clearly recorded and easy to trace." actions={<button className="ims-button ims-button-primary" onClick={() => { setErrorMessage(''); setOpen(true); }}><Plus size={16} /> Record movement</button>}>
    {notice && <div className="ims-form-success ims-section-spacer" role="status">{notice}</div>}
    <section className="ims-stock-summary"><div><span>RECENT ACTIVITY</span><strong>{movements.length}</strong><small>Latest records shown below</small></div><div><span>STOCK IN</span><strong>{movements.filter((item) => ['STOCK_IN', 'RETURN'].includes(item.movementType)).length}</strong><small>Restocks and returns</small></div><div><span>STOCK OUT</span><strong>{movements.filter((item) => item.movementType === 'STOCK_OUT').length}</strong><small>Sales and usage</small></div></section>
    <section className="ims-panel ims-section-spacer"><div className="ims-toolbar"><label className="ims-search"><Search size={16} /><input aria-label="Search stock activity" placeholder="Search product, SKU, or note" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="ims-filter-wrap"><SlidersHorizontal size={14} /><select className="ims-filter-select" aria-label="Filter movement type" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">All activity</option><option value="STOCK_IN">Stock in</option><option value="STOCK_OUT">Stock out</option><option value="ADJUSTMENT">Adjustments</option><option value="RETURN">Returns</option></select></label></div>
      {error && <div className="ims-error-state" role="alert">Could not load stock activity. Please refresh.</div>}
      {isLoading ? <div className="ims-loading-list"><div className="ims-skeleton" /><div className="ims-skeleton" /></div> : visible.length ? <div className="ims-table-wrap"><table className="ims-table"><thead><tr><th>Product</th><th>Movement</th><th>Stock change</th><th>Reason / reference</th><th>Recorded by</th><th>Date</th></tr></thead><tbody>{visible.map((movement) => { const inbound = ['STOCK_IN', 'RETURN'].includes(movement.movementType); return <tr key={movement.id}><td><strong>{movement.product?.name || 'Product'}</strong><div className="ims-mono">{movement.product?.SKU}</div></td><td><span className={`ims-movement-tag ${inbound ? 'is-in' : movement.movementType === 'STOCK_OUT' ? 'is-out' : 'is-adjustment'}`}>{inbound ? <ArrowDownToLine size={13} /> : <ArrowUpFromLine size={13} />}{label(movement.movementType)}</span></td><td><strong>{movement.previousStock} <span className="ims-arrow">→</span> {movement.newStock}</strong><small className="ims-minimum-note">{movement.movementType === 'ADJUSTMENT' ? 'Count set' : `${inbound ? '+' : '−'}${movement.quantity} units`}</small></td><td>{movement.reason || '—'}{movement.reference && <div className="ims-mono">{movement.reference}</div>}</td><td>{movement.user?.name || 'Team member'}</td><td>{dateTime(movement.createdAt)}</td></tr>; })}</tbody></table></div> : <div className="ims-empty"><span className="ims-empty-icon"><ClipboardList size={18} /></span><h3>{search ? 'No activity matches that search' : 'No stock changes recorded'}</h3><p>{search ? 'Try another product name or note.' : 'Record an opening count, restock, return, or stock-out to begin your audit trail.'}</p>{!search && <button className="ims-button ims-button-dark" onClick={() => setOpen(true)}><Plus size={14} /> Record first movement</button>}</div>}
      <div className="ims-table-footer"><span>{visible.length} recent records</span><span>Only your workspace activity is shown</span></div>
    </section>

    {open && <div className="ims-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="ims-modal" role="dialog" aria-modal="true" aria-labelledby="movement-title"><div className="ims-modal-head"><div><p className="ims-eyebrow">INVENTORY ADJUSTMENT</p><h2 id="movement-title">Record stock activity</h2><p>Stock counts update immediately and are added to your activity history.</p></div><button className="ims-close-button" aria-label="Close dialog" onClick={() => setOpen(false)}><X size={17} /></button></div>
      <form onSubmit={submit}><div className="ims-form-grid"><label className="ims-field span-two">Product<select name="productId" required defaultValue=""><option value="" disabled>Select a product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.SKU} · {product.currentStock} in stock</option>)}</select></label><label className="ims-field">Movement type<select name="movementType" required defaultValue="STOCK_IN"><option value="STOCK_IN">Stock in</option><option value="STOCK_OUT">Stock out</option><option value="RETURN">Customer return</option><option value="ADJUSTMENT">Set counted quantity</option></select></label><label className="ims-field">Quantity<input name="quantity" type="number" min="0" step="1" inputMode="numeric" required defaultValue="1" /><small className="ims-field-hint">For an adjustment, enter the new on-hand count.</small></label><label className="ims-field">Reason<input name="reason" maxLength={140} placeholder="e.g. Weekly delivery" /></label><label className="ims-field">Reference<input name="reference" maxLength={80} placeholder="Optional order or receipt number" /></label></div>{errorMessage && <p className="ims-form-error" role="alert">{errorMessage}</p>}<div className="ims-modal-footer"><button type="button" className="ims-button ims-button-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="ims-button ims-button-dark" disabled={saving || products.length === 0}>{saving ? 'Recording…' : 'Record stock change'}</button></div></form>
    </section></div>}
  </AppShell>;
}
