import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { CartIcon, UserIcon, BoxIcon, GridIcon, LogoutIcon, MenuIcon, XIcon } from './Icons.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(count);

  // Close mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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

  const doLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>
          ShopEasy
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end>Shop</NavLink>
          {user && <NavLink to="/orders"><BoxIcon /> My Orders</NavLink>}
          {user?.isAdmin && <NavLink to="/admin"><GridIcon /> Admin</NavLink>}
          {user ? (
            <div className="nav-user">
              <span className="avatar">{user.name[0].toUpperCase()}</span>
              <span className="nav-user-name">{user.name.split(' ')[0]}</span>
              <button className="icon-btn" onClick={doLogout} title="Log out" aria-label="Log out">
                <LogoutIcon />
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="nav-login"><UserIcon /> Sign in</NavLink>
          )}
        </nav>

        <div className="nav-right">
          <Link to="/cart" className="cart-btn" aria-label={`Cart, ${count} items`}>
            <CartIcon size="1.35em" />
            {count > 0 && <span className={`badge ${bump ? 'bump' : ''}`}>{count}</span>}
          </Link>
          <button className="icon-btn menu-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <XIcon size="1.4em" /> : <MenuIcon size="1.4em" />}
          </button>
        </div>
      </div>
    </header>
  );
}
