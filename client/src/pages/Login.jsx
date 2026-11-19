import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import usePageMeta from '../usePageMeta.js';

// Public demo shopper account (created by the seed). There is deliberately no admin
// demo: the admin login is private and set through environment variables.
const DEMO = [{ label: 'Try the demo account', email: 'user@shop.com', password: 'user123' }];

export default function Login() {
  usePageMeta({ title: 'Login', description: 'Log in to your ShopEasy account to check out faster and track your orders.' });
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const doLogin = async (em, pw) => {
    setBusy(true);
    setError('');
    try {
      await login(em, pw);
      toast('Welcome back!');
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your account.">
      <form onSubmit={(e) => { e.preventDefault(); doLogin(email, password); }}>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Email
          <input type="email" required autoComplete="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>Password
          <PasswordInput required autoComplete="current-password" placeholder="••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="btn btn-lg block" disabled={busy}>
          {busy ? <span className="spinner" /> : 'Sign in'}
        </button>
      </form>

      <div className="divider"><span>or just look around</span></div>
      <div className="demo-btns">
        {DEMO.map((d) => (
          <button key={d.email} className="btn btn-outline grow" disabled={busy}
            onClick={() => doLogin(d.email, d.password)}>
            {d.label}
          </button>
        ))}
      </div>

      <p className="muted small center">
        New to ShopEasy? <Link to="/register" state={location.state}>Create an account</Link>
      </p>
    </AuthLayout>
  );
}
