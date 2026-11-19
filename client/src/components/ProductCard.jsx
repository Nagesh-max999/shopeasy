import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { money } from '../api.js';
import { CartIcon } from './Icons.jsx';

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart();
  const toast = useToast();
  const soldOut = product.stock === 0;
  const lowStock = !soldOut && product.stock <= 5;
  const inCart = items.find((i) => i._id === product._id)?.qty || 0;
  const maxed = inCart >= product.stock;

  const add = () => {
    addToCart(product);
    toast(`${product.name} added to cart`);
  };

  return (
    <article className="card">
      <Link to={`/product/${product._id}`} className="card-media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {soldOut && <span className="tag tag-dark">Sold out</span>}
        {lowStock && <span className="tag tag-warn">Only {product.stock} left</span>}
      </Link>
      <div className="card-body">
        <span className="eyebrow">{product.category}</span>
        <Link to={`/product/${product._id}`} className="card-title">{product.name}</Link>
        <div className="card-footer">
          <span className="card-price">{money(product.price)}</span>
          <button
            className="btn btn-sm"
            disabled={soldOut || maxed}
            onClick={add}
            title={maxed && !soldOut ? 'All available stock is in your cart' : ''}
          >
            <CartIcon size="1em" /> {soldOut ? 'Sold out' : maxed ? 'Max' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton" style={{ aspectRatio: '1' }} />
      <div className="card-body">
        <div className="skeleton line" style={{ width: '40%' }} />
        <div className="skeleton line" style={{ width: '80%' }} />
        <div className="skeleton line" style={{ width: '55%', height: 28, marginTop: 8 }} />
      </div>
    </div>
  );
}
