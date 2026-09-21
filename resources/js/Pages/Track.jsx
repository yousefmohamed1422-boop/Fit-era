import { TrackForm } from '../Components/Tracker';

export default function Track({ number = '' }) {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-32 sm:pt-40">
      <h1 className="font-display h-lg">Track your order</h1>
      <p className="mt-3 mb-10 text-muted">Enter the order number we sent you on WhatsApp.</p>
      <TrackForm key={number} initial={number} />
    </section>
  );
}
