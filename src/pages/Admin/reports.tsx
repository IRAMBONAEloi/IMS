import useSWR from 'swr';
import { useState } from 'react';
import { AlertTriangle, Download, Package, TrendingUp } from 'lucide-react';
import AppShell from '../../components/AppShell';
import { authService } from '../../services/auth.service';
import { fetcher } from '../../services/fetcher';

type Product = { id: number; SKU: string; name: string; currentStock: number; minimumStock: number; unitPrice: number; category?: { name: string } };
type ValueReport = { items: Array<Product & { totalValue: number }>; summary: { totalProducts: number; totalValue: number; averageValuePerProduct: number } };
const formatMoney = (amount: number, currency: string) => new Intl.NumberFormat('en-RW', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);
const csvCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export default function Reports() {
  const { data: lowStock = [], isLoading, error } = useSWR<Product[]>('/reports/low-stock', fetcher);
  const { data: outOfStock = [] } = useSWR<Product[]>('/reports/out-of-stock', fetcher);
  const { data: valueReport } = useSWR<ValueReport>('/reports/inventory-value', fetcher);
  const [tab, setTab] = useState<'low' | 'empty'>('low');
  const currency = authService.getUser()?.currency || 'RWF';
  const rows = tab === 'low' ? lowStock : outOfStock;

  const downloadCsv = () => {
    const heading = ['SKU', 'Product', 'Category', 'On hand', 'Minimum stock', 'Unit cost', 'Inventory value'];
    const lines = [heading, ...(valueReport?.items ?? []).map((product) => [product.SKU, product.name, product.category?.name, product.currentStock, product.minimumStock, product.unitPrice, product.totalValue])];
    const blob = new Blob([lines.map((row) => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ims-inventory-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return <AppShell title="Reports" description="Spot restock priorities and understand the value on your shelves." actions={<button className="ims-button ims-button-secondary" onClick={downloadCsv} disabled={!valueReport?.items.length}><Download size={15} /> Export CSV</button>}>
    {error && <div className="ims-error-state" role="alert">Reports could not be loaded. Please refresh.</div>}
    <section className="ims-report-highlight"><div className="ims-report-value"><span>ACTIVE INVENTORY VALUE</span><strong>{formatMoney(valueReport?.summary.totalValue ?? 0, currency)}</strong><small>Based on unit cost and on-hand quantity</small></div><div className="ims-report-stat"><span className="ims-report-icon"><Package size={18} /></span><div><small>PRODUCTS IN STOCK</small><strong>{valueReport?.summary.totalProducts ?? 0}</strong></div></div><div className="ims-report-stat"><span className="ims-report-icon amber"><AlertTriangle size={18} /></span><div><small>RESTOCK PRIORITIES</small><strong>{lowStock.length + outOfStock.length}</strong></div></div><div className="ims-report-mark"><TrendingUp size={24} /><span>MAKE THE<br />NEXT MOVE</span></div></section>
    <section className="ims-panel ims-section-spacer"><div className="ims-panel-head"><div><h2 className="ims-panel-title">Stock health</h2><p className="ims-panel-subtitle">Products that need a closer look</p></div><div className="ims-segmented" role="tablist" aria-label="Stock report type"><button role="tab" aria-selected={tab === 'low'} className={tab === 'low' ? 'is-selected' : ''} onClick={() => setTab('low')}>Low stock <span>{lowStock.length}</span></button><button role="tab" aria-selected={tab === 'empty'} className={tab === 'empty' ? 'is-selected' : ''} onClick={() => setTab('empty')}>Out of stock <span>{outOfStock.length}</span></button></div></div>
      {isLoading ? <div className="ims-loading-list"><div className="ims-skeleton" /></div> : rows.length ? <div className="ims-table-wrap"><table className="ims-table"><thead><tr><th>Product</th><th>Category</th><th>On hand</th><th>Minimum</th><th>Stock value</th><th>Signal</th></tr></thead><tbody>{rows.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><div className="ims-mono">{product.SKU}</div></td><td>{product.category?.name || '—'}</td><td><strong>{product.currentStock}</strong></td><td>{product.minimumStock}</td><td>{formatMoney(product.currentStock * product.unitPrice, currency)}</td><td><span className={`ims-stock-badge ${product.currentStock === 0 ? 'is-empty' : 'is-low'}`}>{product.currentStock === 0 ? 'Restock now' : 'Below minimum'}</span></td></tr>)}</tbody></table></div> : <div className="ims-empty"><span className="ims-empty-icon"><Package size={18} /></span><h3>{tab === 'low' ? 'Stock levels look healthy' : 'No empty shelves'}</h3><p>{tab === 'low' ? 'Nothing is currently at or below its minimum level.' : 'Every active product has stock on hand.'}</p></div>}
    </section>
    <p className="ims-report-footnote">Inventory valuation uses the unit-cost values recorded for each product. Amounts are shown in {currency}.</p>
  </AppShell>;
}
