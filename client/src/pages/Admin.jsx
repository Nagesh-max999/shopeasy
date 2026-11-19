import { useEffect, useMemo, useState } from 'react';
import { api, money } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { BoxIcon, ClockIcon, DollarIcon, AlertIcon, EditIcon, TrashIcon, SearchIcon, PlusIcon, XIcon } from '../components/Icons.jsx';

const empty = { name: '', description: '', price: '', image: '', category: '', stock: '' };
const STATUSES = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

export default function Admin() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadProducts = () => api('/products').then(setProducts).catch((e) => toast(e.message, 'error'));
  const loadOrders = () => api('/orders').then(setOrders).catch((e) => toast(e.message, 'error'));

  useEffect(() => {
    Promise.all([loadProducts(), loadOrders()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revenue = orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.totalPrice, 0);
  const pending = orders.filter((o) => o.status === 'Pending').length;
  const lowStock = products.filter((p) => p.stock <= 5).length;

  const stats = [
    { label: 'Revenue', value: money(revenue), icon: <DollarIcon />, tone: 'green' },
    { label: 'Orders', value: orders.length, icon: <BoxIcon />, tone: 'blue' },
    { label: 'Pending', value: pending, icon: <ClockIcon />, tone: 'amber' },
    { label: 'Low stock', value: lowStock, icon: <AlertIcon />, tone: 'red' },
  ];

  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
      </div>

      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <span className={`stat-icon tone-${s.tone}`}>{s.icon}</span>
            <div>
              <span className="muted small">{s.label}</span>
              <strong>{loading ? '–' : s.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'products'} className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
          Products <span className="count">{products.length}</span>
        </button>
        <button role="tab" aria-selected={tab === 'orders'} className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
          Orders <span className="count">{orders.length}</span>
        </button>
      </div>

      {tab === 'products' ? (
        <Products products={products} reload={loadProducts} />
      ) : (
        <Orders orders={orders} reload={() => Promise.all([loadOrders(), loadProducts()])} />
      )}
    </>
  );
}

function Products({ products, reload }) {
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(q)) : products;
  }, [products, query]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const close = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(empty);
    setError('');
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) await api(`/products/${editingId}`, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
      toast(editingId ? 'Product updated' : 'Product added');
      close();
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({ name: p.name, description: p.description, price: p.price, image: p.image, category: p.category, stock: p.stock });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      toast('Product deleted', 'info');
      setConfirmId(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <>
      {showForm && (
        <form className="panel pad product-form" onSubmit={save}>
          <div className="row between">
            <h2>{editingId ? 'Edit product' : 'New product'}</h2>
            <button type="button" className="icon-btn" onClick={close} aria-label="Close"><XIcon /></button>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="product-form-grid">
            <div className="image-preview">
              {form.image ? <img src={form.image} alt="Preview" onError={(e) => (e.target.style.opacity = 0.2)} onLoad={(e) => (e.target.style.opacity = 1)} /> : <span className="muted small">Image preview</span>}
            </div>
            <div>
              <div className="form-row">
                <label>Name<input required value={form.name} onChange={set('name')} /></label>
                <label>Category
                  <input required list="cat-list" value={form.category} onChange={set('category')} />
                  <datalist id="cat-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </label>
              </div>
              <div className="form-row">
                <label>Price ($)<input type="number" step="0.01" min="0" required value={form.price} onChange={set('price')} /></label>
                <label>Stock<input type="number" min="0" required value={form.stock} onChange={set('stock')} /></label>
              </div>
              <label>Image URL<input value={form.image} onChange={set('image')} placeholder="https://…" /></label>
              <label>Description<textarea rows="3" value={form.description} onChange={set('description')} /></label>
              <div className="row">
                <button className="btn" disabled={busy}>{busy ? <span className="spinner" /> : editingId ? 'Save changes' : 'Add product'}</button>
                <button type="button" className="btn btn-outline" onClick={close}>Cancel</button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="table-toolbar">
        <div className="search">
          <SearchIcon />
          <input placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {!showForm && (
          <button className="btn" onClick={() => setShowForm(true)}><PlusIcon size="1em" /> Add product</button>
        )}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th className="right">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="cell-product">
                    <img className="thumb" src={p.image} alt="" />
                    <span className="strong">{p.name}</span>
                  </div>
                </td>
                <td><span className="pill">{p.category}</span></td>
                <td>{money(p.price)}</td>
                <td>
                  <span className={`stock-pill ${p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'in'}`}>
                    {p.stock === 0 ? 'Out of stock' : p.stock}
                  </span>
                </td>
                <td className="right actions">
                  {confirmId === p._id ? (
                    <span className="confirm">
                      Delete?
                      <button className="btn btn-sm btn-danger" onClick={() => remove(p._id)}>Yes</button>
                      <button className="btn btn-sm btn-outline" onClick={() => setConfirmId(null)}>No</button>
                    </span>
                  ) : (
                    <>
                      <button className="icon-btn" onClick={() => edit(p)} title="Edit" aria-label={`Edit ${p.name}`}><EditIcon /></button>
                      <button className="icon-btn danger-hover" onClick={() => setConfirmId(p._id)} title="Delete" aria-label={`Delete ${p.name}`}><TrashIcon /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" className="muted center">No products match “{query}”.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Orders({ orders, reload }) {
  const toast = useToast();
  const [filter, setFilter] = useState('All');

  const setStatus = async (id, status) => {
    try {
      await api(`/orders/${id}/status`, { method: 'PUT', body: { status } });
      toast(`Order marked as ${status}`);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const shown = filter === 'All' ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <div className="chips">
        {['All', ...STATUSES].map((s) => (
          <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s} <span className="count">{s === 'All' ? orders.length : orders.filter((o) => o.status === s).length}</span>
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o._id}>
                <td className="strong">#{o._id.slice(-6).toUpperCase()}</td>
                <td>
                  {o.user?.name || 'Deleted user'}
                  <div className="muted small">{o.shippingAddress.city} · {o.shippingAddress.phone}</div>
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                <td className="strong">{money(o.totalPrice)}</td>
                <td>
                  <select
                    className={`status-select status-${o.status.toLowerCase()}`}
                    value={o.status}
                    disabled={o.status === 'Cancelled'}
                    onChange={(e) => setStatus(o._id, e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan="6" className="muted center">No {filter === 'All' ? '' : filter.toLowerCase()} orders.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
