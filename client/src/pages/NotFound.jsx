import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600"><Compass className="h-10 w-10" /></div>
      <h1 className="mt-6 font-display text-5xl font-extrabold text-ink">404</h1>
      <p className="mt-2 text-muted">We couldn't find the page you're looking for.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
