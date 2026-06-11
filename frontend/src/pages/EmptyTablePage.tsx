import { Button } from '../components/ui/Button';

export const EmptyTablePage = ({ title, columns, actionLabel }: { title: string, columns: string[], actionLabel?: string }) => {
  return (
    <div className="dashboard-container">
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>{title}</h1>
          {actionLabel && <Button>{actionLabel}</Button>}
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {columns.map((col, index) => (
                  <th key={index} style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Empty table
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
