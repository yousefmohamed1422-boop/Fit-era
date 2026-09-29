import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { verifyAdmin, getAdminCreds } from './db';

const AuthCtx = createContext(null);

const ADMIN_AUTH_KEY = 'fe-admin-auth';
const CUSTOMER_SESSION_KEY = 'fe-customer-session';
const CUSTOMERS_DB_KEY = 'fe-customer-accounts';

const INITIAL_CUSTOMERS = [
  {
    id: 'usr_demo_1',
    name: 'Karim Ahmed',
    email: 'karim@fitera.com',
    password: 'guest123',
    phone: '01012345678',
    createdAt: Date.now() - 86400000 * 3,
  },
];

function getStoredCustomers() {
  if (typeof window === 'undefined') return INITIAL_CUSTOMERS;
  try {
    const raw = window.localStorage.getItem(CUSTOMERS_DB_KEY);
    if (!raw) {
      window.localStorage.setItem(CUSTOMERS_DB_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

function saveStoredCustomers(list) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CUSTOMERS_DB_KEY, JSON.stringify(list));
  } catch {}
}

export function AuthProvider({ children }) {
  // Admin session
  const [adminSession, setAdminSession] = useState(() => {
    try {
      const saved = window.sessionStorage.getItem(ADMIN_AUTH_KEY) || window.localStorage.getItem(ADMIN_AUTH_KEY);
      return saved ? JSON.parse(saved) : { authed: false, email: 'admin@fitera.com' };
    } catch {
      return { authed: false, email: 'admin@fitera.com' };
    }
  });

  // Customer session (guest logged in)
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = window.localStorage.getItem(CUSTOMER_SESSION_KEY) || window.sessionStorage.getItem(CUSTOMER_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // UI state for modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  // Dedicated admin authentication (used ONLY by /admin Login portal)
  const authenticateAdmin = useCallback((emailInput, passwordInput) => {
    const email = (emailInput || '').trim();
    const password = passwordInput || '';

    if (verifyAdmin(email, password)) {
      const adminData = { authed: true, email };
      setAdminSession(adminData);
      try {
        window.sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(adminData));
        window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(adminData));
      } catch {}
      return { success: true, role: 'admin', email };
    }

    // Check if customer credentials were submitted on the admin page
    const customers = getStoredCustomers();
    const isCustomerAccount = customers.some(
      (c) => c.email && c.email.toLowerCase() === email.toLowerCase()
    );
    if (isCustomerAccount) {
      return {
        success: false,
        error: 'This portal is restricted to store administrators only. Customers please sign in via the storefront.',
      };
    }

    return {
      success: false,
      error: 'Invalid administrator email or password.',
    };
  }, []);

  // Dedicated customer authentication (used by guest storefront modal)
  const authenticateCustomer = useCallback((emailInput, passwordInput) => {
    const email = (emailInput || '').trim().toLowerCase();
    const password = passwordInput || '';

    // Block admin email in guest login as requested
    const adminCreds = getAdminCreds();
    if (adminCreds && email === adminCreds.email.toLowerCase()) {
      return {
        success: false,
        isAdminBlocked: true,
        error: 'حساب الإدارة غير متاح من هنا. لتسجيل دخول الأدمن، يرجى التوجه إلى رابط الإدارة الخاص /admin',
        errorEn: 'Admin accounts cannot sign in through guest login. Please use the /admin portal directly.',
      };
    }

    // Check customer accounts
    const customers = getStoredCustomers();
    const matchedCustomer = customers.find(
      (c) => c.email && c.email.toLowerCase() === email
    );

    if (matchedCustomer) {
      if (matchedCustomer.password === password) {
        const customerData = {
          id: matchedCustomer.id,
          name: matchedCustomer.name,
          email: matchedCustomer.email,
          phone: matchedCustomer.phone || '',
        };
        setCustomer(customerData);
        try {
          window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerData));
        } catch {}
        return { success: true, role: 'customer', user: customerData };
      }
      return { success: false, error: 'Incorrect password.' };
    }

    return {
      success: false,
      error: 'No account found with this email. Please check your credentials or create a new account.',
    };
  }, []);

  // General authenticate method routed by portal
  const authenticate = useCallback(
    (emailInput, passwordInput, options = {}) => {
      if (options.portal === 'admin') {
        return authenticateAdmin(emailInput, passwordInput);
      }
      return authenticateCustomer(emailInput, passwordInput);
    },
    [authenticateAdmin, authenticateCustomer]
  );

  // Standard login method compatible with admin Login.jsx (truthy on success, false on failure)
  const login = useCallback(
    (email, password) => {
      const res = authenticateAdmin(email, password);
      if (res.success) {
        return res;
      }
      return false;
    },
    [authenticateAdmin]
  );

  // Customer registration
  const signup = useCallback((data) => {
    const name = (data.name || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const password = data.password || '';
    const phone = (data.phone || '').trim();

    if (!name || name.length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // Prevent signing up with admin email
    const adminCreds = getAdminCreds();
    if (adminCreds && email === adminCreds.email.toLowerCase()) {
      return { success: false, error: 'This email is reserved for store administration. Please log in instead.' };
    }

    const customers = getStoredCustomers();
    const exists = customers.some((c) => c.email && c.email.toLowerCase() === email);
    if (exists) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newCustomer = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      email,
      password,
      phone,
      createdAt: Date.now(),
    };

    const nextList = [newCustomer, ...customers];
    saveStoredCustomers(nextList);

    const sessionData = {
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
    };
    setCustomer(sessionData);
    try {
      window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(sessionData));
    } catch {}

    return { success: true, role: 'customer', user: sessionData };
  }, []);

  const logout = useCallback(() => {
    const adminData = { authed: false, email: adminSession.email || 'admin@fitera.com' };
    setAdminSession(adminData);
    setCustomer(null);
    try {
      window.sessionStorage.removeItem(ADMIN_AUTH_KEY);
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
      window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
      window.sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
    } catch {}
  }, [adminSession.email]);

  const setSessionEmail = useCallback((email) => {
    setAdminSession((prev) => {
      const next = { ...prev, email: (email || '').trim() };
      try {
        window.sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
        window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const openLogin = useCallback(() => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  }, []);

  const openSignup = useCallback(() => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  }, []);

  const value = {
    // Admin compatibility
    authed: Boolean(adminSession.authed),
    isAdmin: Boolean(adminSession.authed),
    email: adminSession.email || 'admin@fitera.com',
    setSessionEmail,

    // Customer info
    customer,
    isCustomer: Boolean(customer),
    currentUser: adminSession.authed
      ? { role: 'admin', email: adminSession.email, name: 'Admin' }
      : customer
      ? { role: 'customer', ...customer }
      : null,

    // Auth actions
    login,
    authenticate,
    authenticateAdmin,
    authenticateCustomer,
    signup,
    logout,

    // Modal controls
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    accountModalOpen,
    setAccountModalOpen,
    openLogin,
    openSignup,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const AdminAuthProvider = AuthProvider;

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    return {
      authed: false,
      isAdmin: false,
      isCustomer: false,
      email: 'admin@fitera.com',
      customer: null,
      currentUser: null,
      login: () => false,
      authenticate: () => ({ success: false }),
      signup: () => ({ success: false }),
      logout: () => {},
      setSessionEmail: () => {},
      authModalOpen: false,
      setAuthModalOpen: () => {},
      authModalTab: 'login',
      setAuthModalTab: () => {},
      accountModalOpen: false,
      setAccountModalOpen: () => {},
      openLogin: () => {},
      openSignup: () => {},
    };
  }
  return ctx;
}

export const useAdminAuth = useAuth;

