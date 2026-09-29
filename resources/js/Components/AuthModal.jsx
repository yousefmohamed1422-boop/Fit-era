import { useState } from 'react';
import Icon from './Icon';
import { Logo } from './ui';
import { useAuth } from '../lib/auth';
import { navigate } from '../lib/router';
import { getAdminCreds } from '../lib/db';

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    authenticateCustomer,
    signup,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [isAdminNotice, setIsAdminNotice] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);

  if (!authModalOpen) return null;

  const close = () => {
    setErr('');
    setIsAdminNotice(false);
    setSuccessMsg('');
    setAuthModalOpen(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setIsAdminNotice(false);
    setSuccessMsg('');
    if (!email.trim()) {
      setErr('Please enter your email.');
      return;
    }
    if (!password) {
      setErr('Please enter your password.');
      return;
    }

    setBusy(true);
    setTimeout(() => {
      const res = authenticateCustomer(email, password);
      setBusy(false);
      if (res.success) {
        setSuccessMsg(`Welcome back, ${res.user?.name || 'Customer'}!`);
        setTimeout(() => {
          close();
        }, 400);
      } else {
        if (res.isAdminBlocked) {
          setIsAdminNotice(true);
        }
        setErr(res.error || 'Invalid email or password.');
      }
    }, 350);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setIsAdminNotice(false);
    setSuccessMsg('');

    setBusy(true);
    setTimeout(() => {
      const res = signup({ name, email, password, phone });
      setBusy(false);
      if (res.success) {
        setSuccessMsg(`Account created! Welcome, ${res.user?.name}!`);
        setTimeout(() => {
          close();
        }, 500);
      } else {
        setErr(res.error || 'Failed to create account.');
      }
    }, 400);
  };

  const fillCustomer = () => {
    setEmail('karim@fitera.com');
    setPassword('guest123');
    setErr('');
    setIsAdminNotice(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md glass glass-strong rounded-4xl p-6 sm:p-8 border border-line shadow-2xl relative page-enter overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={close}
          className="icon-btn absolute top-4 right-4 text-muted hover:text-fg"
          aria-label="Close"
        >
          <Icon name="close" size={18} />
        </button>

        {/* Brand Logo */}
        <div className="flex justify-center mb-4">
          <Logo className="h-9" />
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex bg-[color-mix(in_srgb,var(--fg)_6%,transparent)] p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('login');
              setErr('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 ${
              authModalTab === 'login'
                ? 'bg-fg text-bg shadow-sm'
                : 'text-muted hover:text-fg'
            }`}
          >
            Sign In / دخول
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('signup');
              setErr('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 ${
              authModalTab === 'signup'
                ? 'bg-fg text-bg shadow-sm'
                : 'text-muted hover:text-fg'
            }`}
          >
            Sign Up / حساب جديد
          </button>
        </div>

        {/* Subtitle / notice */}
        <div className="mb-5 text-center">
          <h2 id="auth-modal-title" className="font-display text-lg sm:text-xl font-bold">
            {authModalTab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            {authModalTab === 'login' ? (
              <span>Sign in with your customer account to view past orders and track deliveries.</span>
            ) : (
              <span>Join FitEra to save your details and track orders smoothly.</span>
            )}
          </p>
        </div>

        {/* Success Message Banner */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium flex items-center gap-2">
            <Icon name="check" size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Admin Login Attempt Notice Banner */}
        {isAdminNotice ? (
          <div
            role="alert"
            className="mb-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-medium space-y-1.5"
          >
            <div className="flex items-center gap-2 font-bold">
              <Icon name="lock" size={16} />
              <span>دخول الإدارة غير متاح هنا / Admin Login Restricted</span>
            </div>
            <p className="text-xs leading-relaxed text-fg/80">
              تسجيل دخول المشرفين لا يعمل من نافذة الزوار العادية. للوصول إلى لوحة التحكم، يرجى فتح الرابط الخاص بالـ Admin بإضافة <strong>/admin</strong> إلى الرابط.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  close();
                  navigate('/admin');
                }}
                className="text-xs font-semibold underline text-amber-500 hover:text-amber-400 flex items-center gap-1"
              >
                <span>الانتقال لصفحة دخول الأدمن (/admin)</span>
                <Icon name="right" size={12} />
              </button>
            </div>
          </div>
        ) : err ? (
          <div
            role="alert"
            className="mb-4 p-3 rounded-2xl bg-rose/10 border border-rose/30 text-rose text-xs sm:text-sm font-medium flex items-center gap-2"
          >
            <Icon name="close" size={15} />
            <span>{err}</span>
          </div>
        ) : null}

        {/* Forms */}
        {authModalTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} noValidate className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErr('');
                  setIsAdminNotice(false);
                }}
                className={`field w-full ${err || isAdminNotice ? 'err' : ''}`}
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErr('');
                    setIsAdminNotice(false);
                  }}
                  className={`field w-full pr-10 ${err || isAdminNotice ? 'err' : ''}`}
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

            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full mt-2 !py-3 font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              {busy ? (
                <span className="w-4 h-4 rounded-full border-2 border-bg/40 border-t-bg animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="lock" size={16} /> Sign In
                </span>
              )}
            </button>

            {/* Quick Demo Credentials for Customer testing */}
            <div className="pt-3 border-t border-line text-center">
              <span className="text-[11px] text-muted block mb-2">Customer testing account:</span>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={fillCustomer}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] hover:bg-[color-mix(in_srgb,var(--fg)_15%,transparent)] transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Icon name="user" size={12} /> Fill Demo Customer (Karim)
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} noValidate className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="Ahmed Mohamed"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErr('');
                }}
                className="field w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                Email address *
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErr('');
                }}
                className="field w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                WhatsApp / Phone (optional)
              </label>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="010 1234 5678"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErr('');
                }}
                className="field w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-muted">Password *</label>
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="At least 4 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErr('');
                  }}
                  className="field w-full pr-10"
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

            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full mt-2 !py-3 font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              {busy ? (
                <span className="w-4 h-4 rounded-full border-2 border-bg/40 border-t-bg animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="check" size={16} /> Create Account
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
