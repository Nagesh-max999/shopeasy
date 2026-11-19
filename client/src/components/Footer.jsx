import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import { TruckIcon, CashIcon, ReturnIcon, ShieldIcon } from './Icons.jsx';

// Each of these returns results in the sample catalog
const POPULAR = [
  'iPhone', 'Samsung', 'Apple', 'Laptop', 'Watch', 'Rolex', 'Shirt', 'Dress', 'Shoes', 'Nike',
  'Bag', 'Sunglasses', 'Lipstick', 'Mascara', 'Blender', 'Lamp', 'Sofa', 'Football', 'Chicken', 'Juice',
];

const perks = [
  { icon: <TruckIcon size="1em" />, text: 'Free delivery on every order' },
  { icon: <CashIcon size="1em" />, text: 'Cash on Delivery' },
  { icon: <ReturnIcon size="1em" />, text: '7-day easy returns' },
  { icon: <ShieldIcon size="1em" />, text: 'Secure, encrypted accounts' },
];

export default function Footer() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        {categories.length > 0 && (
          <section className="footer-block">
            <h3>Categories</h3>
            <ul className="footer-cats">
              {categories.map((c) => (
                <li key={c}><Link to={`/?cat=${encodeURIComponent(c)}`}>{c}</Link></li>
              ))}
            </ul>
          </section>
        )}

        <section className="footer-block">
          <h3>Popular Searches</h3>
          <p className="footer-tags">
            {POPULAR.map((t) => (
              <Link key={t} to={`/?q=${encodeURIComponent(t)}`}>{t}</Link>
            ))}
          </p>
        </section>

        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="brand footer-logo" aria-label="ShopEasy home"><Logo size={44} /></Link>
            <p className="muted">Everyday essentials, delivered free to your door.</p>
            <p className="muted small">© {new Date().getFullYear()} ShopEasy</p>
          </div>

          <nav className="footer-col" aria-label="Shop">
            <Link to="/">Home</Link>
            <a href="/#categories">All Categories</a>
            <Link to="/cart">Cart</Link>
            {user?.isAdmin && <Link to="/admin">Admin Dashboard</Link>}
          </nav>

          <nav className="footer-col" aria-label="Your account">
            {user ? (
              <Link to="/orders">My Orders</Link>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Create Account</Link>
                <Link to="/orders">My Orders</Link>
              </>
            )}
            <Link to="/checkout">Checkout</Link>
          </nav>

          <div className="footer-col">
            <strong className="footer-col-title">Why ShopEasy</strong>
            <ul className="footer-perks">
              {perks.map((p) => (
                <li key={p.text}>{p.icon}{p.text}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
