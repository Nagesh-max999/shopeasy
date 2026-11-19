import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { money } from '../api.js';
import QtyStepper from '../components/QtyStepper.jsx';
import { TrashIcon, ArrowLeftIcon, ShieldIcon, ArrowRightIcon } from '../components/Icons.jsx';
import usePageMeta from '../usePageMeta.js';

export default function Cart() {
  usePageMeta({ title: 'Your Cart', noindex: true });
  const { items, updateQty, removeFromCart, total, count } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  if (items.length === 0)
    return (
      <div className="empty-state">
        <div className="empty-emoji">🛒</div>
        <h2>Your cart is empty</h2>
        <p className="muted">Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn">Start shopping</Link>
      </div>
    );

  const remove = (i) => {
    removeFromCart(i._id);
    toast(`${i.name} removed`, 'info');
  };

  return (
    <>
      <div className="page-head">
        <h1>Shopping cart</h1>
        <span className="muted">{count} {count === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="two-col">
        <div className="panel">
          {items.map((i) => (
            <div key={i._id} className="cart-item">
              <Link to={`/product/${i._id}`}><img src={i.image} alt={i.name} /></Link>
              <div className="cart-item-info">
                <Link to={`/product/${i._id}`} className="cart-item-name">{i.name}</Link>
                <span className="muted small">{money(i.price)} each</span>
              </div>
              <QtyStepper small value={i.qty} max={i.stock} onChange={(q) => updateQty(i._id, q)} />
              <strong className="line-total">{money(i.price * i.qty)}</strong>
              <button className="icon-btn danger-hover" onClick={() => remove(i)} aria-label={`Remove ${i.name}`}>
                <TrashIcon />
              </button>
            </div>
          ))}
          <div className="panel-foot">
            <Link to="/" className="link-arrow"><ArrowLeftIcon size="1em" /> Continue shopping</Link>
          </div>
        </div>

        <aside className="panel summary">
          <h3>Order summary</h3>
          <div className="row between"><span className="muted">Subtotal</span><span>{money(total)}</span></div>
          <div className="row between"><span className="muted">Delivery</span><span className="success">Free</span></div>
          <hr />
          <div className="row between total"><span>Total</span><span>{money(total)}</span></div>
          <button className="btn btn-lg block" onClick={() => navigate('/checkout')}>
            Proceed to checkout <ArrowRightIcon size="1em" />
          </button>
          <p className="muted small center secure"><ShieldIcon size="1em" /> Pay cash on delivery</p>
        </aside>
      </div>
    </>
  );
}
