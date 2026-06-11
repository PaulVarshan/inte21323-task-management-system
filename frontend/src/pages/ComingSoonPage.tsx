export const ComingSoonPage = ({ title }: { title: string }) => {
  return (
    <div className="dashboard-container">
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>{title}</h1>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Coming soon</p>
      </div>
    </div>
  );
};
