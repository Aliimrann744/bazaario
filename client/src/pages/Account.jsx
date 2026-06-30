import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, LogOut, ShieldCheck } from 'lucide-react';
import api, { apiError } from '../lib/api';
import { useAuth } from '../store/auth';
import { Avatar } from '../components/ui/Primitives';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, updateUser, logout } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: user.name, bio: user.bio || '', avatarUrl: user.avatarUrl || '' });
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.patch('/me/profile', form);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error(apiError(err)); } finally { setBusy(false); }
  };

  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Account settings</h1>

      <div className="card mt-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar src={form.avatarUrl} name={form.name} size={72} />
          <div>
            <p className="font-bold text-ink">{user.name}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <div className="mt-1 flex gap-2">
              {user.isPhoneVerified && <span className="badge-verified"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span>}
              <span className="badge bg-slate-100 capitalize text-slate-600">{user.trustTier.toLowerCase()}</span>
            </div>
          </div>
        </div>

        <form onSubmit={save} className="mt-6 space-y-4">
          <div><label className="label">Display name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Bio</label><textarea className="input min-h-[90px]" maxLength={200} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell buyers a bit about you…" /><p className="mt-1 text-right text-xs text-muted">{form.bio.length}/200</p></div>
          <div><label className="label">Avatar URL</label><input className="input" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://…" /></div>
          <button disabled={busy} className="btn-primary"><Save className="h-4 w-4" /> {busy ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>

      <button onClick={() => { logout(); nav('/'); }} className="btn-outline mt-4 w-full text-rose-600"><LogOut className="h-4 w-4" /> Log out</button>
    </div>
  );
}
