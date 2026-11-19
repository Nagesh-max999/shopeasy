import { Link } from 'react-router-dom';
import { TruckIcon, CashIcon, ReturnIcon, ShieldIcon } from './Icons.jsx';

const perks = [
  { icon: <TruckIcon />, title: 'Free delivery', text: 'On every order' },
  { icon: <CashIcon />, title: 'Cash on delivery', text: 'Pay when it arrives' },
  { icon: <ReturnIcon />, title: 'Easy returns', text: '7-day return window' },
  { icon: <ShieldIcon />, title: 'Secure account', text: 'Encrypted passwords' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="perks">
          {perks.map((p) => (
            <div key={p.title} className="perk">
              <span className="perk-icon">{p.icon}</span>
              <div>
                <strong>{p.title}</strong>
                <div className="muted small">{p.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <Link to="/" className="brand small-brand"><span className="brand-mark">S</span>ShopEasy</Link>
          <span className="muted small">© {new Date().getFullYear()} ShopEasy.</span>
        </div>
      </div>
    </footer>
  );
}
