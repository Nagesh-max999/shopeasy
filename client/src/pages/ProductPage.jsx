import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
import { CartIcon, TruckIcon, CashIcon, ReturnIcon } from '../components/Icons.jsx';
import usePageMeta from '../usePageMeta.js';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    setProduct(null);
    setQty(1);
    setError('');
    api(`/products/${id}`)
      .then((p) => {
        setProduct(p);
        return api(`/products?category=${encodeURIComponent(p.category)}`);
      })
      .then((list) => setRelated(list.filter((x) => x._id !== id).slice(0, 4)))
      .catch((e) => setError(e.message));
  }, [id]);

  usePageMeta(
    error
      ? { title: 'Product not found', noindex: true }
      : product
        ? {
            title: `${product.name} (${product.category})`,
            description: `Buy ${product.name} for ${money(product.price)} at ShopEasy. ${product.description || ''}`,
          }
        : { title: 'Loading…' }
  );

  // Product structured data (schema.org) so search engines can show price and availability
  useEffect(() => {
    if (!product) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.dataset.page = 'product';
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      category: product.category,
      sku: product._id,
      brand: { '@type': 'Brand', name: 'ShopEasy' },
      offers: {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: 'INR',
        price: product.price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    });
    document.head.appendChild(el);
    return () => el.remove();
  }, [product]);

  if (error)
    return (
      <div className="empty-state">
        <div className="empty-emoji">😕</div>
        <h2>Product not found</h2>
        <Link to="/" className="btn">Back to shop</Link>
      </div>
    );

  if (!product)
    return (
      <div className="product-detail">
        <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 16 }} />
        <div>
          <div className="skeleton line" style={{ width: '30%' }} />
          <div className="skeleton line" style={{ width: '70%', height: 32 }} />
          <div className="skeleton line" style={{ width: '25%', height: 28 }} />
          <div className="skeleton line" style={{ width: '90%' }} />
          <div className="skeleton line" style={{ width: '80%' }} />
        </div>
      </div>
    );

  const soldOut = product.stock === 0;
  const inCart = items.find((i) => i._id === product._id)?.qty || 0;
  const available = product.stock - inCart;

  const add = (goToCart) => {
    addToCart(product, qty);
    if (goToCart) navigate('/cart');
    else toast(`${qty} × ${product.name} added to cart`);
    setQty(1);
  };

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">Shop</Link> <span>/</span> <span>{product.category}</span> <span>/</span>
        <span className="current">{product.name}</span>
      </nav>

      <div className="product-detail">
        <div className="detail-media">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="detail-info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="price">{money(product.price)}</p>

          <div className={`stock ${soldOut ? 'out' : product.stock <= 5 ? 'low' : 'in'}`}>
            <span className="dot" />
            {soldOut ? 'Out of stock' : product.stock <= 5 ? `Hurry, only ${product.stock} left` : 'In stock'}
          </div>

          <p className="description">{product.description}</p>

          {!soldOut && (
            available > 0 ? (
              <div className="buy-box">
                <QtyStepper value={qty} max={available} onChange={setQty} />
                <button className="btn grow" onClick={() => add(false)}>
                  <CartIcon size="1em" /> Add to cart
                </button>
                <button className="btn btn-outline grow" onClick={() => add(true)}>Buy now</button>
              </div>
            ) : (
              <div className="alert alert-info">
                All available stock is already in your cart. <Link to="/cart">View cart</Link>
              </div>
            )
          )}
          {inCart > 0 && available > 0 && (
            <p className="muted small">You have {inCart} in your cart.</p>
          )}

          <ul className="detail-perks">
            <li><TruckIcon /> Free delivery in 3–5 days</li>
            <li><CashIcon /> Cash on delivery available</li>
            <li><ReturnIcon /> 7-day easy returns</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related">
          <h2>You may also like</h2>
          <div className="grid">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
