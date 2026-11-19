import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      toast(`Welcome to ShopEasy, ${form.name.split(' ')[0]}!`);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute.">
      <form onSubmit={submit}>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Full name
          <input required autoComplete="name" placeholder="Jane Doe" value={form.name} onChange={set('name')} />
        </label>
        <label>Email
          <input type="email" required autoComplete="email" placeholder="you@example.com"
            value={form.email} onChange={set('email')} />
        </label>
        <label>Password
          <PasswordInput required minLength={6} autoComplete="new-password" placeholder="At least 6 characters"
            value={form.password} onChange={set('password')} />
        </label>
        {strength > 0 && (
          <div className={`strength s${strength}`}>
            <span /><span /><span />
            <em>{['', 'Too short', 'Good', 'Strong'][strength]}</em>
          </div>
        )}
        <button className="btn btn-lg block" disabled={busy}>
          {busy ? <span className="spinner" /> : 'Create account'}
        </button>
      </form>
      <p className="muted small center">
        Already have an account? <Link to="/login" state={location.state}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
