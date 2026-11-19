import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CashIcon, CheckIcon } from '../components/Icons.jsx';

function Steps({ current }) {
  const steps = ['Cart', 'Shipping', 'Confirmed'];
  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={s} className={i < current ? 'done' : i === current ? 'current' : ''}>
          <span className="step-dot">{i < current ? <CheckIcon size="0.9em" /> : i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  // Prefill with the last used address so repeat customers check out faster
  const [addr, setAddr] = useState(() => {
    const blank = { fullName: user?.name || '', address: '', city: '', postalCode: '', phone: '' };
    try {
      return { ...blank, ...JSON.parse(localStorage.getItem('lastAddress')) };
    } catch {
      return blank;
    }
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (items.length === 0 && !busy) return <Navigate to="/cart" replace />;

  const set = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/orders', {
        method: 'POST',
        body: { items: items.map((i) => ({ productId: i._id, qty: i.qty })), shippingAddress: addr },
      });
      try { localStorage.setItem('lastAddress', JSON.stringify(addr)); } catch { /* ignore */ }
      navigate('/orders?placed=1', { replace: true });
      clearCart();
      toast('Order placed successfully!');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <Steps current={1} />
      <div className="two-col">
        <form className="panel pad" onSubmit={placeOrder}>
          <h2>Shipping details</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <label>Full name<input required autoComplete="name" value={addr.fullName} onChange={set('fullName')} /></label>
          <label>Street address<input required autoComplete="street-address" placeholder="House no., street, area" value={addr.address} onChange={set('address')} /></label>
          <div className="form-row">
            <label>City<input required autoComplete="address-level2" value={addr.city} onChange={set('city')} /></label>
            <label>Postal code<input required autoComplete="postal-code" value={addr.postalCode} onChange={set('postalCode')} /></label>
          </div>
          <label>Phone<input type="tel" required autoComplete="tel" placeholder="For delivery updates" value={addr.phone} onChange={set('phone')} /></label>

          <h2 className="mt">Payment</h2>
          <div className="pay-option selected">
            <span className="pay-icon"><CashIcon /></span>
            <div className="grow">
              <strong>Cash on Delivery</strong>
              <div className="muted small">Pay when your order arrives</div>
            </div>
            <span className="radio-dot" />
          </div>

          <button className="btn btn-lg block mt" disabled={busy}>
            {busy ? <span className="spinner" /> : `Place order · ${money(total)}`}
          </button>
        </form>

        <aside className="panel summary">
          <h3>Your order</h3>
          {items.map((i) => (
            <div key={i._id} className="mini-item">
              <div className="mini-thumb">
                <img src={i.image} alt="" />
                <span className="mini-qty">{i.qty}</span>
              </div>
              <span className="grow small">{i.name}</span>
              <span className="small">{money(i.price * i.qty)}</span>
            </div>
          ))}
          <hr />
          <div className="row between"><span className="muted">Subtotal</span><span>{money(total)}</span></div>
          <div className="row between"><span className="muted">Delivery</span><span className="success">Free</span></div>
          <hr />
          <div className="row between total"><span>Total</span><span>{money(total)}</span></div>
        </aside>
      </div>
    </>
  );
}
