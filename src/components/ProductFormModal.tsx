import { useState, type FormEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';

type Category = { id: number; name: string };
type Supplier = { id: number; name: string };
type Product = { id: number; SKU: string; name: string; description?: string; imageUrl?: string | null; currentStock: number; minimumStock: number; unitPrice: number; sellingPrice: number; categoryId: number; supplierId?: number | null };

interface Props { product: Product | null; categories: Category[]; suppliers: Supplier[]; onClose: () => void; onSave: (data: FormData) => Promise<void> }

export default function ProductFormModal({ product, categories, suppliers, onClose, onSave }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageName, setImageName] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    if (!form.get('supplierId')) form.delete('supplierId');
    if (!form.get('image') || (form.get('image') as File).size === 0) form.delete('image');
    try { await onSave(form); }
    catch (cause) { setError((cause as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not save this product. Please try again.'); }
    finally { setSaving(false); }
  };

  return <div className="ims-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="ims-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
    <div className="ims-modal-head"><div><p className="ims-eyebrow">INVENTORY ITEM</p><h2 id="product-form-title">{product ? 'Edit product' : 'Add a product'}</h2><p>Keep the details your team needs to make the next stock decision.</p></div><button className="ims-close-button" aria-label="Close dialog" onClick={onClose}><X size={17} /></button></div>
    <form onSubmit={submit}>
      <div className="ims-form-grid">
        <label className="ims-field">Product name<input name="name" required minLength={2} defaultValue={product?.name || ''} placeholder="e.g. Arabica coffee beans" /></label>
        <label className="ims-field">SKU<input name="SKU" required minLength={2} defaultValue={product?.SKU || ''} placeholder="e.g. COF-001" /></label>
        <label className="ims-field">Category<select name="categoryId" required defaultValue={product?.categoryId || ''}><option value="" disabled>Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="ims-field">Supplier<select name="supplierId" defaultValue={product?.supplierId || ''}><option value="">No supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
        <label className="ims-field">Unit cost<input name="unitPrice" type="number" inputMode="decimal" min="0" step="0.01" required defaultValue={product?.unitPrice ?? ''} placeholder="0" /></label>
        <label className="ims-field">Selling price<input name="sellingPrice" type="number" inputMode="decimal" min="0" step="0.01" required defaultValue={product?.sellingPrice ?? ''} placeholder="0" /></label>
        <label className="ims-field">Minimum stock<input name="minimumStock" type="number" inputMode="numeric" min="0" step="1" required defaultValue={product?.minimumStock ?? 0} /></label>
        <label className="ims-field span-two">Description<textarea name="description" defaultValue={product?.description || ''} placeholder="Optional details about this product" /></label>
        <label className="ims-field span-two ims-file-field"><span>Product image <small>Optional · PNG, JPG or WebP</small></span><span className="ims-file-control"><ImagePlus size={17} /><span>{imageName || (product?.imageUrl ? 'Replace the current image' : 'Choose an image')}</span><input name="image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageName(event.target.files?.[0]?.name || '')} /></span></label>
      </div>
      {error && <p className="ims-form-error" role="alert">{error}</p>}
      <div className="ims-modal-footer"><button type="button" className="ims-button ims-button-secondary" onClick={onClose}>Cancel</button><button className="ims-button ims-button-dark" type="submit" disabled={saving}>{saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}</button></div>
    </form>
  </section></div>;
}
