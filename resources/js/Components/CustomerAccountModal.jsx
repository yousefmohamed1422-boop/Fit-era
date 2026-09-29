import { useState, useMemo } from 'react';
import Icon from './Icon';
import { useAuth } from '../lib/auth';
import { listOrders } from '../lib/api';
import { navigate, Link } from '../lib/router';

const STEPS = ['Confirmed', 'In transit', 'Out for delivery', 'Delivered'];

export default function CustomerAccountModal() {
  const {
    accountModalOpen,
    setAccountModalOpen,
    currentUser,
    customer,
    isAdmin,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile'

  // Get orders belonging to this customer
  const myOrders = useMemo(() => {
    if (!customer) return [];
    const all = listOrders();
    const cleanPhone = (s) => (s || '').replace(/\D/g, '').slice(-9);
    const userPhone = cleanPhone(customer.phone);
    const userEmail = (customer.email || '').trim().toLowerCase();

    return all.filter((o) => {
      const oEmail = (o.customer?.email || '').trim().toLowerCase();
      const oPhone = cleanPhone(o.customer?.whatsapp);
      if (userEmail && oEmail && oEmail === userEmail) return true;
      if (userPhone && oPhone && oPhone === userPhone) return true;
      return false;
    });
  }, [customer, accountModalOpen]);

  if (!accountModalOpen) return null;

  const close = () => setAccountModalOpen(false);

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
        aria-labelledby="customer-account-title"
        className="w-full max-w-lg glass glass-strong rounded-4xl p-6 sm:p-8 border border-line shadow-2xl relative page-enter max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-fg/10 grid place-items-center text-fg font-display text-lg font-bold">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 id="customer-account-title" className="font-display text-lg sm:text-xl font-bold">
                {currentUser?.name || 'Customer Account'}
              </h2>
              <p className="text-xs text-muted truncate max-w-[15rem] sm:max-w-xs">
                {currentUser?.email}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="icon-btn text-muted hover:text-fg shrink-0"
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 my-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`chip !py-1.5 !px-4 text-xs font-semibold ${
              activeTab === 'orders' ? 'on' : ''
            }`}
          >
            <Icon name="package" size={14} className="mr-1 inline" /> My Orders ({myOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`chip !py-1.5 !px-4 text-xs font-semibold ${
              activeTab === 'profile' ? 'on' : ''
            }`}
          >
            <Icon name="user" size={14} className="mr-1 inline" /> Profile Details
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                close();
                navigate('/admin');
              }}
              className="chip !py-1.5 !px-4 text-xs font-semibold ml-auto border-rose/30 text-rose"
            >
              <Icon name="gear" size={14} className="mr-1 inline" /> Dashboard
            </button>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-4">
          {activeTab === 'orders' ? (
            <div>
              {myOrders.length === 0 ? (
                <div className="text-center py-10 px-4 glass rounded-3xl border border-line">
                  <div className="w-12 h-12 mx-auto rounded-full bg-fg/5 grid place-items-center text-muted mb-3">
                    <Icon name="bag" size={22} />
                  </div>
                  <h3 className="font-display font-semibold text-sm">No orders yet</h3>
                  <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                    When you place an order with your email ({customer?.email}), it will show up here automatically.
                  </p>
                  <button
                    onClick={() => {
                      close();
                      navigate('/shop/all');
                    }}
                    className="btn btn-primary !py-2 !px-4 text-xs mt-4"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.map((order) => {
                    const stepName = STEPS[order.step] || 'Confirmed';
                    return (
                      <div
                        key={order.number}
                        className="glass rounded-3xl p-4 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-fg/30 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm tracking-wide">
                              #{order.number}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-medium">
                              {stepName}
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-1">
                            {order.items?.length || 1} item(s) • Total: <strong>EGP {order.total || 0}</strong>
                          </p>
                          <p className="text-[11px] text-muted">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              close();
                              navigate(`/track/${order.number}`);
                            }}
                            className="btn btn-ghost !py-1.5 !px-3 text-xs border border-line hover:border-fg w-full sm:w-auto"
                          >
                            <Icon name="truck" size={14} /> Track Order
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 glass rounded-3xl p-4 sm:p-5 border border-line text-sm">
              <div>
                <span className="text-xs text-muted block">Full Name</span>
                <span className="font-semibold text-fg">{currentUser?.name || 'Customer'}</span>
              </div>
              <div>
                <span className="text-xs text-muted block">Email Address</span>
                <span className="font-semibold text-fg">{currentUser?.email}</span>
              </div>
              {customer?.phone && (
                <div>
                  <span className="text-xs text-muted block">WhatsApp / Phone</span>
                  <span className="font-semibold text-fg">{customer.phone}</span>
                </div>
              )}
              <div>
                <span className="text-xs text-muted block">Account Type</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-fg/10 text-fg">
                  {isAdmin ? 'Store Administrator' : 'Verified Customer'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Logout */}
        <div className="pt-4 border-t border-line mt-2 flex items-center justify-between">
          <button
            onClick={() => {
              logout();
              close();
            }}
            className="text-xs font-medium text-rose hover:underline flex items-center gap-1.5 px-2 py-1"
          >
            <Icon name="logout" size={14} /> Log out
          </button>
          <button
            onClick={close}
            className="btn btn-ghost !py-1.5 !px-4 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
