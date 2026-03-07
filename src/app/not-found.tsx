import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '2rem' }}>404 - Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        The page you are looking for could not be found.
      </p>
      <Link href="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  );
}
