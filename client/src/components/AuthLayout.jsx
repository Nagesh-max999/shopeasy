import { LogoMark } from './Logo.jsx';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth">
      <div className="auth-side">
        <LogoMark size={56} className="auth-logo" />
        <h2>Shop smarter with ShopEasy</h2>
        <ul>
          <li>✓ Free delivery on every order</li>
          <li>✓ Track all your orders in one place</li>
          <li>✓ Pay cash when it arrives</li>
        </ul>
      </div>
      <div className="auth-main">
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
