import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProjectById, updateProject } from '../services/project.service';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const project = await getProjectById(Number(id));
        
        if (user?.role !== 'Admin' && project.creator?.user_id !== user?.user_id) {
          setError('You do not have permission to edit this project.');
          setHasPermission(false);
          setLoading(false);
          return;
        }

        setFormData({
          project_name: project.project_name,
          description: project.description || '',
          start_date: project.start_date.split('T')[0],
          end_date: project.end_date ? project.end_date.split('T')[0] : '',
          status: project.status
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.project_name) {
      setError('Project name is required');
      return;
    }
    if (!formData.start_date) {
      setError('Start date is required');
      return;
    }
    if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date cannot be before start date');
      return;
    }

    try {
      setSaving(true);
      await updateProject(Number(id), {
        project_name: formData.project_name,
        description: formData.description || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: formData.status
      });
      navigate('..', { relative: 'path' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  if (!hasPermission) {
    return (
      <div className="page-container">
        <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--error-color, #ff4d4f)' }}>Access Denied</h2>
          <p style={{ marginBottom: '2rem' }}>{error}</p>
          <Link to="../.." relative="path">
            <Button type="button">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Edit Project</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Project Name *</label>
            <input 
              type="text" 
              name="project_name" 
              className="input-field" 
              value={formData.project_name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea 
              name="description" 
              className="input-field" 
              value={formData.description} 
              onChange={handleChange} 
              rows={4}
            />
          </div>
          
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Start Date *</label>
              <input 
                type="date" 
                name="start_date" 
                className="input-field" 
                value={formData.start_date} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>End Date</label>
              <input 
                type="date" 
                name="end_date" 
                className="input-field" 
                value={formData.end_date} 
                onChange={handleChange} 
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Status *</label>
            <select 
              name="status" 
              className="input-field" 
              value={formData.status} 
              onChange={handleChange} 
              required
            >
              <option value="PLANNING">PLANNING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DELAYED">DELAYED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <Button type="submit" style={{ flex: 2 }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link to="../.." relative="path" style={{ flex: 1, display: 'flex' }}>
              <Button type="button" style={{ width: '100%', background: '#e5e7eb', color: 'var(--text-primary)', height: '100%' }}>Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
