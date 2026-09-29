import { useState } from 'react';
import Icon from '../Components/Icon';
import { Logo } from '../Components/ui';
import { useAuth } from '../lib/auth';
import { Link } from '../lib/router';
import { getAdminCreds } from '../lib/db';

export default function Login() {
  const { authenticateAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const fillAdmin = () => {
    const creds = getAdminCreds();
    setEmail(creds.email);
    setPassword(creds.password);
    setErr('');
  };

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    setInfo('');

    if (!email.trim()) {
      setErr('Please enter the administrator email.');
      return;
    }
    if (!password) {
      setErr('Please enter the administrator password.');
      return;
    }

    setBusy(true);
    setTimeout(() => {
      const res = authenticateAdmin(email, password);
      setBusy(false);
      if (res.success) {
        setInfo('Admin authenticated successfully. Loading dashboard...');
        // Admin session state updated in AuthCtx; AdminArea automatically renders dashboard
      } else {
        setErr(res.error || 'Invalid administrator email or password.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8 bg-bg text-fg page-enter relative overflow-hidden">
      {/* Background glow for admin portal */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-rose/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-fg/5 blur-3xl pointer-events-none" />

      <form onSubmit={submit} noValidate className="glass glass-strong rounded-4xl p-8 sm:p-10 w-full max-w-md border border-line shadow-2xl relative z-10">
        {/* Security badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose/10 border border-rose/30 text-rose text-[11px] font-semibold tracking-wider uppercase">
            <Icon name="lock" size={13} />
            <span>Restricted Staff Portal • بوابة الإدارة</span>
          </div>
        </div>

        <Logo className="h-10 mx-auto" />
        <h1 className="font-display text-2xl font-bold text-center mt-4">Dashboard Login</h1>
        <p className="text-center text-xs text-muted mt-1.5 max-w-xs mx-auto leading-relaxed">
          Authorized personnel access only. Sign in to manage store catalog, orders, and settings.
        </p>

        <div className="mt-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Admin Email
            </label>
            <input
              className={`field w-full ${err ? 'err' : ''}`}
              placeholder="admin@fitera.com"
              value={email}
              type="email"
              autoComplete="username"
              onChange={(e) => { setEmail(e.target.value); setErr(''); }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[11px] text-muted hover:text-fg"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                className={`field w-full pr-10 ${err ? 'err' : ''}`}
                placeholder="Admin password"
                value={password}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                onChange={(e) => { setPassword(e.target.value); setErr(''); }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                <Icon name={showPassword ? 'eye' : 'lock'} size={15} />
              </button>
            </div>
          </div>
        </div>

        {err && (
          <div role="alert" className="mt-4 p-3 rounded-2xl bg-rose/10 border border-rose/30 text-rose text-xs font-medium flex items-center gap-2">
            <Icon name="close" size={15} />
            <span>{err}</span>
          </div>
        )}
        {info && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <Icon name="check" size={15} />
            <span>{info}</span>
          </div>
        )}

        <button className="btn btn-primary w-full mt-6 !py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all" disabled={busy}>
          {busy ? (
            <span className="w-4 h-4 rounded-full border-2 border-bg/40 border-t-bg animate-spin" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Icon name="lock" size={16} /> Enter Dashboard
            </span>
          )}
        </button>

        {/* Quick autofill for admin testing */}
        <div className="mt-5 pt-4 border-t border-line text-center">
          <button
            type="button"
            onClick={fillAdmin}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] hover:bg-[color-mix(in_srgb,var(--fg)_15%,transparent)] transition-colors inline-flex items-center gap-1.5 font-medium text-muted hover:text-fg"
          >
            <Icon name="gear" size={13} />
            <span>Autofill Default Admin (<b className="text-fg">admin@fitera.com</b>)</span>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-line text-center">
          <Link to="/" className="text-xs text-muted hover:text-fg inline-flex items-center gap-1.5 transition-colors">
            <Icon name="left" size={14} /> Back to Storefront
          </Link>
        </div>
      </form>
    </div>
  );
}
