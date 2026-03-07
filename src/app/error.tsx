'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h2 style={{ marginBottom: '16px' }}>Something went wrong!</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        We encountered an unexpected error while trying to render this page.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button className="btn-primary" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Go back home
        </Link>
      </div>
    </div>
  );
}
