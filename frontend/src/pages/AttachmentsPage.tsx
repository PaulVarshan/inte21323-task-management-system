import React, { useEffect, useState } from 'react';
import { getAllAttachments } from '../services/attachment.service';
import type { GlobalAttachment } from '../services/attachment.service';

export const AttachmentsPage: React.FC = () => {
  const [attachments, setAttachments] = useState<GlobalAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setLoading(true);
        const data = await getAllAttachments();
        setAttachments(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch attachments');
      } finally {
        setLoading(false);
      }
    };
    fetchAttachments();
  }, []);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'docx') return '📘';
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) return '🖼️';
    return '📄';
  };

  if (loading) {
    return <div className="page-container">Loading attachments...</div>;
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Attachments</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View and manage all your accessible documents and files.</p>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {attachments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No attachments found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--surface-border)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>File Name</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Task</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Uploaded By</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {attachments.map((a) => (
                  <tr key={a.attachment_id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.2s' }} 
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem' }}>
                      <a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
                        <span style={{ fontSize: '1.2rem' }}>{getFileIcon(a.file_name)}</span>
                        {a.file_name}
                      </a>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{a.task_name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{a.project_name}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: 'var(--bg-gradient)', color: 'var(--primary-color)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 'bold'
                        }}>
                          {a.uploaded_by.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ color: 'var(--text-primary)' }}>{a.uploaded_by}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(a.uploaded_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
