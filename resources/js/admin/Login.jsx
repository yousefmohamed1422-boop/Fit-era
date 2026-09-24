import { useState } from 'react';
import Icon from '../Components/Icon';
import { Logo } from '../Components/ui';
import { useAdminAuth } from '../lib/auth';

export default function Login() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      if (!login(email, password)) setErr('Wrong email or password.');
      setBusy(false);
    }, 350);
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-bg text-fg page-enter">
      <form onSubmit={submit} noValidate className="glass rounded-4xl p-8 sm:p-10 w-full max-w-sm">
        <Logo className="h-10 mx-auto" />
        <h1 className="font-display h-md text-center mt-5">Dashboard login</h1>
        <p className="text-center text-[13px] text-muted mt-2">Sign in to edit products, orders and settings.</p>

        <div className="mt-7 space-y-4">
          <input
            className={`field ${err ? 'err' : ''}`} placeholder="Email" value={email} type="email" autoComplete="username"
            onChange={(e) => { setEmail(e.target.value); setErr(''); }}
          />
          <input
            className={`field ${err ? 'err' : ''}`} placeholder="Password" value={password} type="password" autoComplete="current-password"
            onChange={(e) => { setPassword(e.target.value); setErr(''); }}
          />
        </div>
        {err && <p role="alert" className="mt-3 text-[13px] text-[#c4534f]">{err}</p>}

        <button className="btn btn-primary w-full mt-6" disabled={busy}>
          {busy ? <span className="w-4 h-4 rounded-full border-2 border-bg/40 border-t-bg animate-spin" /> : <Icon name="lock" size={16} />}
          Log in
        </button>
        <p className="mt-6 text-center text-[12px] text-muted">Default: <b className="text-fg">admin@fitera.com</b> / <b className="text-fg">fitera2026</b> — change it from Settings.</p>
      </form>
    </div>
  );
}
