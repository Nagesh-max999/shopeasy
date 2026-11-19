import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { getCategories } from '../api.js';
import CategoryIcon from './CategoryIcon.jsx';
import Logo from './Logo.jsx';
import {
  CartIcon, UserIcon, BoxIcon, GridIcon, LogoutIcon, SearchIcon, XIcon, ZapIcon, ChevronDownIcon,
} from './Icons.jsx';

const PLACEHOLDERS = ['iPhone', 'apple', 'laptop', 'lipstick', 'blender', 'sunglasses'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const onHome = location.pathname === '/';
  const urlQ = onHome ? params.get('q') || '' : '';
  const activeCat = onHome ? params.get('cat') || '' : null;

  const [query, setQuery] = useState(urlQ);
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const [hint, setHint] = useState(0);
  const prevCount = useRef(count);
  const menuRef = useRef(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Keep the box in sync when the URL changes (back button, category click, leaving home)
  // (keep what's typed if it only differs by spaces, e.g. "running " while typing "running shoes")
  useEffect(() => setQuery((q) => (q.trim() === urlQ ? q : urlQ)), [urlQ]);

  // Search as you type (debounced); results show on the home page
  useEffect(() => {
    if (query.trim() === urlQ.trim()) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(onHome ? params : undefined);
      if (query.trim()) next.set('q', query.trim());
      else next.delete('q');
      const qs = next.toString();
      navigate(qs ? `/?${qs}` : '/', { replace: onHome });
    }, 300);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rotate the placeholder text
  useEffect(() => {
    const t = setInterval(() => setHint((h) => (h + 1) % PLACEHOLDERS.length), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Close the account menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => !menuRef.current?.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Animate the cart badge when items are added
  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  const doLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="ShopEasy home">
          <Logo size={38} />
        </Link>

        <div className="nav-delivery">
          <strong><ZapIcon size="1em" /> Fast, free delivery</strong>
          <span>Cash on Delivery available</span>
        </div>

        <form className="nav-search" onSubmit={submit} role="search">
          <SearchIcon size="1.25em" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search for "${PLACEHOLDERS[hint]}"`}
            aria-label="Search products"
          />
          {query && (
            <button type="button" className="icon-btn" onClick={() => setQuery('')} aria-label="Clear search">
              <XIcon size="1em" />
            </button>
          )}
        </form>

        <div className="nav-actions">
          {user ? (
            <div className="account" ref={menuRef}>
              <button
                className="nav-action"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="avatar">{user.name[0].toUpperCase()}</span>
                <span className="nav-action-label">
                  {user.name.split(' ')[0]} <ChevronDownIcon size="0.9em" />
                </span>
              </button>
              {menuOpen && (
                <div className="account-menu" role="menu">
                  <div className="account-head">
                    <strong>{user.name}</strong>
                    <span className="muted small">{user.email}</span>
                  </div>
                  <Link to="/orders" role="menuitem"><BoxIcon /> My Orders</Link>
                  {user.isAdmin && <Link to="/admin" role="menuitem"><GridIcon /> Admin dashboard</Link>}
                  <button onClick={doLogout} role="menuitem"><LogoutIcon /> Log out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-action">
              <UserIcon size="1.5em" />
              <span className="nav-action-label">Login</span>
            </Link>
          )}

          <Link to="/cart" className="nav-action" aria-label={`Cart, ${count} items`}>
            <span className="cart-icon">
              <CartIcon size="1.5em" />
              {count > 0 && <span className={`badge ${bump ? 'bump' : ''}`}>{count}</span>}
            </span>
            <span className="nav-action-label">Cart</span>
          </Link>
        </div>
      </div>

      {onHome && categories.length > 0 && (
        <nav className="cat-bar" aria-label="Categories">
          <div className="container cat-bar-inner">
            {['', ...categories].map((c) => (
              <Link
                key={c || 'all'}
                to={c ? `/?cat=${encodeURIComponent(c)}` : '/'}
                className={`cat-tab ${activeCat === c ? 'active' : ''}`}
                aria-current={activeCat === c ? 'page' : undefined}
              >
                <CategoryIcon name={c} size="1.3em" />
                {c || 'All'}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
