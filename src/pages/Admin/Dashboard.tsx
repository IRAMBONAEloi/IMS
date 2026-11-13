import useSWR from 'swr';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Boxes, CircleAlert, Package, Tags, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import { authService } from '../../services/auth.service';
import { fetcher } from '../../services/fetcher';

type Movement = { id: number; movementType: string; quantity: number; createdAt: string; product: { name: string; SKU: string }; user: { name: string } };
type Product = { id: number; name: string; SKU: string; currentStock: number; minimumStock: number; category: { name: string } };
type Summary = { totalProducts: number; activeProducts: number; totalCategories: number; totalSuppliers: number; totalStockValue: number; lowStockProducts: number; outofStockProducts: number; recentMovements: Movement[] };

const currency = (amount: number, code = 'RWF') => new Intl.NumberFormat('en-RW', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(amount || 0);
const shortDate = (value: string) => new Intl.DateTimeFormat('en-RW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default function Dashboard() {
  const user = authService.getUser();
  const { data, error, isLoading } = useSWR<Summary>('/dashboard', fetcher);
  const { data: lowStock } = useSWR<Product[]>('/reports/low-stock', fetcher);
  const currencyCode = user?.currency || 'RWF';
  const metrics = [
    { label: 'Products in catalog', value: data?.totalProducts ?? 0, icon: Package, note: `${data?.activeProducts ?? 0} currently active` },
    { label: 'Stock value', value: currency(data?.totalStockValue ?? 0, currencyCode), icon: Boxes, note: 'At recorded unit cost' },
    { label: 'Need a restock', value: data?.lowStockProducts ?? 0, icon: CircleAlert, note: 'At or below minimum level', tone: 'warning' },
    { label: 'Supply partners', value: data?.totalSuppliers ?? 0, icon: Truck, note: `${data?.totalCategories ?? 0} product categories` },
  ];

  return (
    <AppShell title="Your stock, in focus." description={`A clear view of what is moving at ${user?.shopName || 'your shop'}.`} actions={<Link className="ims-button ims-button-dark" to="/stock-movements"><Activity size={16} /> Record stock</Link>}>
      {error && <div className="ims-error-state" role="alert">We could not load live inventory data. Check that the backend is available, then refresh.</div>}
      <section className="ims-metrics" aria-label="Inventory summary">
        {metrics.map(({ label, value, icon: Icon, note, tone }) => (
          <article className="ims-metric" key={label}>
            <div className="ims-metric-top"><span>{label}</span><span className={`ims-metric-icon ${tone === 'warning' ? 'metric-warning' : ''}`}><Icon size={16} /></span></div>
            <p className="ims-metric-value">{isLoading ? '—' : value}</p><p className="ims-metric-note">{note}</p>
          </article>
        ))}
      </section>

      <section className="ims-dashboard-grid">
        <article className="ims-hero-panel">
          <div className="ims-hero-copy">
            <p className="ims-hero-kicker">THE DAILY STOCK CHECK</p>
            <h2>{data?.outofStockProducts ? `${data.outofStockProducts} items need your attention.` : 'Good stock is good business.'}</h2>
            <p>Keep your shelves ready and your next order clear. Your inventory activity is organised in one place.</p>
            <Link to="/products" className="ims-button ims-button-primary">Explore inventory <ArrowRight size={15} /></Link>
          </div>
          <div className="ims-hero-art" aria-hidden="true"><span /><span /><span /><span /></div>
        </article>

        <article className="ims-panel">
          <div className="ims-panel-head"><div><h2 className="ims-panel-title">Restock watch</h2><p className="ims-panel-subtitle">Items at or below their minimum</p></div><span className="ims-stock-badge is-low">{lowStock?.length ?? 0} items</span></div>
          {isLoading ? <div className="ims-skeleton" /> : lowStock?.length ? (
            <ul className="ims-alert-list">{lowStock.slice(0, 4).map((product) => <li className="ims-list-row" key={product.id}><span className="ims-product-thumb"><Package size={16} /></span><span className="ims-row-copy"><strong>{product.name}</strong><small>{product.category?.name || 'Uncategorised'}</small></span><span className="ims-stock-badge is-low">{product.currentStock} left</span></li>)}</ul>
          ) : <div className="ims-empty compact"><span className="ims-empty-icon"><Tags size={18} /></span><h3>All clear</h3><p>No products are below their minimum stock level.</p></div>}
          <div className="ims-panel-link"><Link to="/reports">Open stock report <ArrowRight size={14} /></Link></div>
        </article>
      </section>

      <section className="ims-panel ims-section-spacer">
        <div className="ims-panel-head"><div><h2 className="ims-panel-title">Latest stock activity</h2><p className="ims-panel-subtitle">The most recent changes recorded by your team</p></div><Link className="ims-inline-link" to="/stock-movements">View activity <ArrowRight size={14} /></Link></div>
        {data?.recentMovements?.length ? <div className="ims-table-wrap"><table className="ims-table"><thead><tr><th>Product</th><th>Movement</th><th>Change</th><th>Recorded by</th><th>When</th></tr></thead><tbody>{data.recentMovements.slice(0, 6).map((movement) => { const inbound = ['STOCK_IN', 'RETURN'].includes(movement.movementType); return <tr key={movement.id}><td><strong>{movement.product?.name || 'Product'}</strong><div className="ims-mono">{movement.product?.SKU}</div></td><td><span className={`ims-movement-tag ${inbound ? 'is-in' : 'is-out'}`}>{inbound ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{movement.movementType.replaceAll('_', ' ')}</span></td><td><strong>{movement.movementType === 'ADJUSTMENT' ? `→ ${movement.quantity}` : `${inbound ? '+' : '−'}${movement.quantity}`}</strong></td><td>{movement.user?.name || 'Team member'}</td><td>{shortDate(movement.createdAt)}</td></tr>; })}</tbody></table></div> : <div className="ims-empty"><span className="ims-empty-icon"><Activity size={18} /></span><h3>No stock activity yet</h3><p>Once your team records a stock-in, stock-out, or adjustment, it will appear here.</p><Link className="ims-button ims-button-dark" to="/stock-movements">Record the first change <ArrowRight size={14} /></Link></div>}
      </section>
    </AppShell>
  );
}
