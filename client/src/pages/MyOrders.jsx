import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { CheckIcon } from '../components/Icons.jsx';

const FLOW = ['Pending', 'Shipped', 'Delivered'];

function Timeline({ status }) {
  if (status === 'Cancelled') return <div className="timeline-cancelled">This order was cancelled.</div>;
  const idx = FLOW.indexOf(status);
  return (
    <div className="timeline">
      {FLOW.map((s, i) => (
        <div key={s} className={`tl-step ${i <= idx ? 'done' : ''}`}>
          <span className="tl-dot">{i <= idx && <CheckIcon size="0.8em" />}</span>
          <span className="tl-label">{s === 'Pending' ? 'Placed' : s}</span>
        </div>
      ))}
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [params] = useSearchParams();

  useEffect(() => {
    api('/orders/mine').then(setOrders).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!orders)
    return (
      <>
        <h1>My orders</h1>
        {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16, marginBottom: 16 }} />)}
      </>
    );

  return (
    <>
      {params.get('placed') && (
        <div className="success-banner">
          <span className="success-check"><CheckIcon size="1.4em" /></span>
          <div>
            <strong>Thank you! Your order has been placed.</strong>
            <div className="small">We'll deliver it in 3–5 days. Pay cash on delivery.</div>
          </div>
        </div>
      )}

      <div className="page-head">
        <h1>My orders</h1>
        {orders.length > 0 && <span className="muted">{orders.length} total</span>}
      </div>

      {orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">📦</div>
          <h2>No orders yet</h2>
          <p className="muted">When you place an order, it will show up here.</p>
          <Link to="/" className="btn">Start shopping</Link>
        </div>
      )}

      {orders.map((o) => (
        <article key={o._id} className="panel order">
          <header className="order-head">
            <div>
              <span className="muted small">Order</span>
              <strong>#{o._id.slice(-6).toUpperCase()}</strong>
            </div>
            <div>
              <span className="muted small">Placed on</span>
              <strong>{new Date(o.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
            <div>
              <span className="muted small">Total</span>
              <strong>{money(o.totalPrice)}</strong>
            </div>
            <span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span>
          </header>

          <Timeline status={o.status} />

          <div className="order-items">
            {o.items.map((i) => (
              <Link key={i._id} to={`/product/${i.product}`} className="order-item">
                <img src={i.image} alt="" />
                <div>
                  <div className="small strong">{i.name}</div>
                  <div className="muted small">{i.qty} × {money(i.price)}</div>
                </div>
              </Link>
            ))}
          </div>

          <footer className="muted small">
            Shipping to {o.shippingAddress.fullName}, {o.shippingAddress.address}, {o.shippingAddress.city} {o.shippingAddress.postalCode}
          </footer>
        </article>
      ))}
    </>
  );
}
