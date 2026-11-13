import { useMemo, useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { Plus, Search, Tag, Trash2, Truck, X } from 'lucide-react';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import { fetcher } from '../../services/fetcher';

type Category = { id: number; name: string; description?: string; _count?: { products: number } };
type Supplier = { id: number; name: string; email?: string | null; phone?: string | null; address?: string | null; contactPerson?: string | null; _count?: { products: number } };
type Kind = 'categories' | 'suppliers';

export default function CatalogPage({ kind }: { kind: Kind }) {
  const suppliersMode = kind === 'suppliers';
  const endpoint = `/${kind}`;
  const title = suppliersMode ? 'Suppliers' : 'Categories';
  const subtitle = suppliersMode ? 'Keep your supply partners and contact details close.' : 'Make products easier to organise, find, and restock.';
  const { data = [], error, isLoading, mutate } = useSWR<(Category | Supplier)[]>(endpoint, fetcher);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const visible = useMemo(() => data.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [data, search]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      await api.post(endpoint, payload);
      await mutate();
      setOpen(false);
      setNotice(`${title.slice(0, -1)} added.`);
      window.setTimeout(() => setNotice(''), 3000);
    } catch (cause) {
      setErrorMessage((cause as { response?: { data?: { message?: string } } }).response?.data?.message || `Could not add this ${title.toLowerCase().slice(0, -1)}.`);
    } finally { setSaving(false); }
  };

  const remove = async (item: Category | Supplier) => {
    if (!window.confirm(`Remove ${item.name}? Products linked to it may prevent deletion.`)) return;
    try { await api.delete(`${endpoint}/${item.id}`); await mutate(); }
    catch { setNotice(`Could not remove ${item.name}. Check whether products still use it.`); window.setTimeout(() => setNotice(''), 3500); }
  };

  return <AppShell title={title} description={subtitle} actions={<button className="ims-button ims-button-primary" onClick={() => { setErrorMessage(''); setOpen(true); }}><Plus size={16} /> Add {suppliersMode ? 'supplier' : 'category'}</button>}>
    {notice && <div className="ims-form-success ims-section-spacer" role="status">{notice}</div>}
    <section className="ims-panel">
      <div className="ims-toolbar"><label className="ims-search"><Search size={16} /><input aria-label={`Search ${title.toLowerCase()}`} placeholder={`Search ${title.toLowerCase()}`} value={search} onChange={(event) => setSearch(event.target.value)} /></label><span className="ims-result-count">{visible.length} {visible.length === 1 ? 'record' : 'records'}</span></div>
      {error && <div className="ims-error-state" role="alert">Could not load {title.toLowerCase()}. Please refresh.</div>}
      {isLoading ? <div className="ims-loading-list"><div className="ims-skeleton" /><div className="ims-skeleton" /></div> : visible.length ? <div className="ims-table-wrap"><table className="ims-table"><thead><tr><th>{title.slice(0, -1)}</th>{suppliersMode ? <><th>Contact</th><th>Email</th><th>Phone</th></> : <th>Description</th>}<th>Products</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td><div className="ims-product-cell"><span className="ims-product-thumb">{suppliersMode ? <Truck size={16} /> : <Tag size={16} />}</span><span><strong>{item.name}</strong><small>Added to your workspace</small></span></div></td>{suppliersMode ? <><td>{(item as Supplier).contactPerson || '—'}</td><td>{(item as Supplier).email || '—'}</td><td>{(item as Supplier).phone || '—'}</td></> : <td>{(item as Category).description || '—'}</td>}<td><span className="ims-stock-badge is-good">{item._count?.products ?? 0} items</span></td><td><button className="ims-icon-button light" aria-label={`Remove ${item.name}`} title={`Remove ${item.name}`} onClick={() => void remove(item)}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div> : <div className="ims-empty"><span className="ims-empty-icon">{suppliersMode ? <Truck size={18} /> : <Tag size={18} />}</span><h3>{search ? 'No matches found' : `No ${title.toLowerCase()} yet`}</h3><p>{search ? 'Try a different search.' : `Add your first ${title.toLowerCase().slice(0, -1)} to keep inventory organised.`}</p>{!search && <button className="ims-button ims-button-dark" onClick={() => setOpen(true)}><Plus size={14} /> Add {title.toLowerCase().slice(0, -1)}</button>}</div>}
    </section>

    {open && <div className="ims-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="ims-modal" role="dialog" aria-modal="true" aria-labelledby="catalog-dialog-title"><div className="ims-modal-head"><div><p className="ims-eyebrow">WORKSPACE DIRECTORY</p><h2 id="catalog-dialog-title">Add {title.toLowerCase().slice(0, -1)}</h2><p>{suppliersMode ? 'Save a partner so your team can keep orders moving.' : 'Create a category to keep products easy to scan.'}</p></div><button className="ims-close-button" aria-label="Close dialog" onClick={() => setOpen(false)}><X size={17} /></button></div>
      <form onSubmit={submit}><div className="ims-form-grid"><label className="ims-field span-two">Name<input name="name" required minLength={2} placeholder={suppliersMode ? 'e.g. Kivu Foods' : 'e.g. Beverages'} /></label>{suppliersMode ? <><label className="ims-field">Contact person<input name="contactPerson" placeholder="Optional" /></label><label className="ims-field">Email<input type="email" name="email" placeholder="orders@supplier.com" /></label><label className="ims-field">Phone<input name="phone" type="tel" placeholder="+250…" /></label><label className="ims-field">Address<input name="address" placeholder="Optional" /></label></> : <label className="ims-field span-two">Description<textarea name="description" placeholder="Optional notes about this category" /></label>}</div>{errorMessage && <p className="ims-form-error" role="alert">{errorMessage}</p>}<div className="ims-modal-footer"><button type="button" className="ims-button ims-button-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="ims-button ims-button-dark" disabled={saving}>{saving ? 'Saving…' : `Add ${title.toLowerCase().slice(0, -1)}`}</button></div></form>
    </section></div>}
  </AppShell>;
}
