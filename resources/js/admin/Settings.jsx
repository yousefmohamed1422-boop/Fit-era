import { useState } from 'react';
import Icon from '../Components/Icon';
import { useBrand, saveBrand, updateAdmin, verifyAdmin } from '../lib/db';
import { useAdminAuth } from '../lib/auth';

const SOCIAL_KEYS = ['facebook', 'instagram', 'tiktok', 'snapchat'];

export default function Settings() {
  const brand = useBrand();
  const [f, setF] = useState(brand);
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setSocial = (k) => (e) => setF({ ...f, socials: { ...f.socials, [k]: e.target.value } });
  const setPromo = (k) => (e) => setF({ ...f, promo: { ...f.promo, [k]: e.target.value } });

  const submit = (e) => {
    e.preventDefault();
    saveBrand({ ...f, freeShippingOver: Number(f.freeShippingOver) || 0, shippingFee: Number(f.shippingFee) || 0 });
    setSaved(true); setTimeout(() => setSaved(false), 1800);
  };

  const { email, setSessionEmail } = useAdminAuth();
  const [acc, setAcc] = useState({ email, current: '', next: '' });
  const [accMsg, setAccMsg] = useState(null);
  const submitAcc = (e) => {
    e.preventDefault();
    if (!verifyAdmin(email, acc.current)) { setAccMsg({ ok: false, msg: 'Current password is wrong.' }); return; }
    updateAdmin({ email: acc.email.trim(), password: acc.next.trim() || undefined });
    setSessionEmail(acc.email.trim());
    setAcc({ ...acc, current: '', next: '' });
    setAccMsg({ ok: true, msg: 'Account updated.' });
  };

  return (
    <div className="max-w-2xl space-y-5">
      <form onSubmit={submit} className="glass rounded-3xl p-6 space-y-5">
        <p className="font-semibold">Brand</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="text-sm font-medium">Store name</span><input className="field mt-1.5" value={f.name} onChange={set('name')} /></label>
          <label className="block"><span className="text-sm font-medium">Currency code</span><input className="field mt-1.5" value={f.currency} onChange={set('currency')} /></label>
          <label className="block"><span className="text-sm font-medium">WhatsApp number</span><input className="field mt-1.5" value={f.whatsapp} onChange={set('whatsapp')} placeholder="20100..." /></label>
          <label className="block"><span className="text-sm font-medium">Support email</span><input className="field mt-1.5" value={f.email} onChange={set('email')} /></label>
          <label className="block"><span className="text-sm font-medium">Free shipping over</span><input type="number" className="field mt-1.5" value={f.freeShippingOver} onChange={set('freeShippingOver')} /></label>
          <label className="block"><span className="text-sm font-medium">Standard shipping fee</span><input type="number" className="field mt-1.5" value={f.shippingFee} onChange={set('shippingFee')} /></label>
        </div>

        <p className="font-semibold pt-2">Social links</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {SOCIAL_KEYS.map((k) => (
            <label className="block" key={k}><span className="text-sm font-medium capitalize">{k}</span><input className="field mt-1.5" value={f.socials?.[k] || ''} onChange={setSocial(k)} /></label>
          ))}
        </div>

        <p className="font-semibold pt-2">Homepage discount banner</p>
        <div className="grid gap-4">
          <label className="block"><span className="text-sm font-medium">Title</span><input className="field mt-1.5" value={f.promo?.title || ''} onChange={setPromo('title')} /></label>
          <label className="block"><span className="text-sm font-medium">Text</span><textarea rows="2" className="field mt-1.5" value={f.promo?.text || ''} onChange={setPromo('text')} /></label>
          <label className="block max-w-[10rem]"><span className="text-sm font-medium">Code shown</span><input className="field mt-1.5 uppercase" value={f.promo?.code || ''} onChange={setPromo('code')} /></label>
          <p className="text-[12.5px] text-muted -mt-2">Make sure this code also exists under Discount codes so it actually applies at checkout.</p>
        </div>

        <button className="btn btn-primary"><Icon name={saved ? 'check' : undefined} size={16} /> {saved ? 'Saved' : 'Save changes'}</button>
      </form>

      <form onSubmit={submitAcc} className="glass rounded-3xl p-6 space-y-4">
        <p className="font-semibold">Dashboard account</p>
        <label className="block"><span className="text-sm font-medium">Email</span><input className="field mt-1.5" value={acc.email} onChange={(e) => setAcc({ ...acc, email: e.target.value })} /></label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="text-sm font-medium">Current password</span><input type="password" className="field mt-1.5" value={acc.current} onChange={(e) => setAcc({ ...acc, current: e.target.value })} /></label>
          <label className="block"><span className="text-sm font-medium">New password <span className="text-muted font-normal">(optional)</span></span><input type="password" className="field mt-1.5" value={acc.next} onChange={(e) => setAcc({ ...acc, next: e.target.value })} /></label>
        </div>
        {accMsg && <p role="alert" className={`text-[13px] ${accMsg.ok ? 'text-rose' : 'text-[#c4534f]'}`}>{accMsg.msg}</p>}
        <button className="btn btn-glass">Update account</button>
      </form>
    </div>
  );
}
