import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <p className="text-[48px] font-semibold text-text-tertiary mb-2">404</p>
      <h1 className="text-[16px] font-medium text-text mb-1">Page not found</h1>
      <p className="text-[13.5px] text-text-secondary mb-5">This page doesn't exist.</p>
      <Link to="/" className="px-4 py-2 rounded-sm2 bg-accent-blue text-white text-[13.5px] font-medium hover:opacity-90 transition-opacity">
        Back to Dashboard
      </Link>
    </div>
  );
}
