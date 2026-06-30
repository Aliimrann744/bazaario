import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../store/auth';
import { apiError } from '../lib/api';
import AuthShell from '../components/layout/AuthShell';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.emailOrPhone, form.password);
      toast.success('Welcome back!');
      nav(loc.state?.from || '/', { replace: true });
    } catch (err) { toast.error(apiError(err, 'Invalid credentials')); } finally { setBusy(false); }
  };

  const demo = () => setForm({ emailOrPhone: 'ali@bazaario.pk', password: 'Password123!' });

  return (
    <AuthShell title="Welcome back" subtitle="Log in to chat with sellers, save favourites and post ads.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email or phone</label>
          <div className="relative"><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" /><input className="input pl-10" value={form.emailOrPhone} onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })} placeholder="you@example.com" /></div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative"><Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" /><input type="password" className="input pl-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
        </div>
        <button disabled={busy} className="btn-primary w-full">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Log in <ArrowRight className="h-4 w-4" /></>}</button>
      </form>
      <button onClick={demo} className="mt-3 w-full text-center text-xs font-medium text-brand-600 hover:underline">Use demo account</button>
      <p className="mt-6 text-center text-sm text-muted">Don't have an account? <Link to="/register" className="font-semibold text-brand-600 hover:underline">Sign up</Link></p>
    </AuthShell>
  );
}
