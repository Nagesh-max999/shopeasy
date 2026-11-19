import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { money } from '../api.js';
import { MinusIcon, PlusIcon } from './Icons.jsx';

export default function ProductCard({ product }) {
  const { addToCart, updateQty, removeFromCart, items } = useCart();
  const toast = useToast();
  const soldOut = product.stock === 0;
  const lowStock = !soldOut && product.stock <= 5;
  const inCart = items.find((i) => i._id === product._id)?.qty || 0;

  const add = () => {
    addToCart(product);
    if (!inCart) toast(`${product.name} added to cart`);
  };
  const remove = () => (inCart <= 1 ? removeFromCart(product._id) : updateQty(product._id, inCart - 1));

  return (
    <article className={`card ${soldOut ? 'is-soldout' : ''}`}>
      <div className="card-media">
        <Link to={`/product/${product._id}`} tabIndex={-1} aria-hidden="true">
          <img src={product.image} alt="" loading="lazy" />
        </Link>
        {soldOut && <span className="tag tag-dark">Sold out</span>}
        {lowStock && <span className="tag tag-warn">Only {product.stock} left</span>}

        <div className="card-cta">
          {soldOut ? null : inCart > 0 ? (
            <div className="add-stepper">
              <button onClick={remove} aria-label={`Remove one ${product.name}`}><MinusIcon size="0.9em" /></button>
              <span aria-live="polite">{inCart}</span>
              <button
                onClick={add}
                disabled={inCart >= product.stock}
                aria-label={`Add one more ${product.name}`}
                title={inCart >= product.stock ? 'All available stock is in your cart' : ''}
              >
                <PlusIcon size="0.9em" />
              </button>
            </div>
          ) : (
            <button className="add-btn" onClick={add} aria-label={`Add ${product.name} to cart`}>ADD</button>
          )}
        </div>
      </div>
      <div className="card-body">
        <span className="card-price">{money(product.price)}</span>
        <Link to={`/product/${product._id}`} className="card-title">{product.name}</Link>
        <span className="card-meta">{product.category}</span>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 12 }} />
      <div className="card-body">
        <div className="skeleton line" style={{ width: '35%' }} />
        <div className="skeleton line" style={{ width: '85%' }} />
        <div className="skeleton line" style={{ width: '50%' }} />
      </div>
    </div>
  );
}
