import { createContext, useContext, useEffect, useState } from 'react';
import { verifyAdmin } from './db';

const Ctx = createContext(null);
export const useAdminAuth = () => useContext(Ctx);

/**
 * Session-only login (clears when the tab closes). The real credential check
 * lives in db.verifyAdmin — swap that for a POST /admin/login call in Laravel
 * and keep this provider as-is.
 */
export function AdminAuthProvider({ children }) {
  const [email, setEmail] = useState(() => {
    try { return sessionStorage.getItem('fe-admin-session') || null; } catch { return null; }
  });
  useEffect(() => {
    try {
      if (email) sessionStorage.setItem('fe-admin-session', email);
      else sessionStorage.removeItem('fe-admin-session');
    } catch { /* storage unavailable */ }
  }, [email]);

  const login = (e, p) => { if (verifyAdmin(e, p)) { setEmail(e.trim()); return true; } return false; };
  const logout = () => setEmail(null);
  const setSessionEmail = (e) => setEmail(e);

  return <Ctx.Provider value={{ authed: !!email, email, login, logout, setSessionEmail }}>{children}</Ctx.Provider>;
}
