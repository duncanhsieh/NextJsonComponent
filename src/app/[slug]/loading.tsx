export default function Loading() {
  return (
    <div className="container" style={{ padding: '60px 20px', animation: 'pulse 1.5s infinite ease-in-out' }}>
      <div 
        style={{
          height: '40px',
          width: '60%',
          background: 'var(--border-subtle)',
          borderRadius: 'var(--r-md)',
          marginBottom: '24px',
          animation: 'pulse 1.5s infinite ease-in-out'
        }} 
      />
      <div 
        style={{
          height: '20px',
          width: '40%',
          background: 'var(--border-subtle)',
          borderRadius: 'var(--r-md)',
          marginBottom: '40px',
          animation: 'pulse 1.5s infinite ease-in-out'
        }} 
      />
      <div 
        style={{
          height: '200px',
          width: '100%',
          background: 'var(--border-subtle)',
          borderRadius: 'var(--r-md)',
          animation: 'pulse 1.5s infinite ease-in-out'
        }} 
      />
    </div>
  );
}
