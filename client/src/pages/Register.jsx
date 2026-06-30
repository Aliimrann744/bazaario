import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../store/auth';
import { apiError, apiFields } from '../lib/api';
import AuthShell from '../components/layout/AuthShell';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      await register(form);
      toast.success('Account created. Welcome to Bazaario!');
      nav('/', { replace: true });
    } catch (err) {
      const f = apiFields(err); if (f) setErrors(f);
      toast.error(apiError(err, 'Could not create account'));
    } finally { setBusy(false); }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AuthShell title="Create your account" subtitle="Free to join. Start buying and selling in minutes.">
      <form onSubmit={submit} className="space-y-4">
        <Field icon={User} label="Full name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Ali Imran" />
        <Field icon={Mail} label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" />
        <Field icon={Phone} label="Phone" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+92 300 1234567" />
        <Field icon={Lock} label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} placeholder="At least 8 characters" />
        <button disabled={busy} className="btn-primary w-full">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Log in</Link></p>
    </AuthShell>
  );
}

function Field({ icon: Icon, label, value, onChange, error, type = 'text', placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative"><Icon className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" /><input type={type} className="input pl-10" value={value} onChange={onChange} placeholder={placeholder} /></div>
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}
