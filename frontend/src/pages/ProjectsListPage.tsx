import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, deleteProject } from '../services/project.service';
import type { Project } from '../services/project.service';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const ProjectsListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p.project_id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.project_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid var(--surface-border)', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Projects</h1>
          {currentUser?.role !== 'Collaborator' && (
            <div style={{ width: '200px' }}>
              <Link to="new">
                <Button style={{ width: '100%', background: 'var(--primary-color)' }}>Create New Project</Button>
              </Link>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="input-field" 
            style={{ marginBottom: 0, flex: 1, background: '#f9fafb', border: '1px solid var(--surface-border)' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="input-field" 
            style={{ marginBottom: 0, width: '200px', background: '#f9fafb', border: '1px solid var(--surface-border)' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PLANNING">PLANNING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DELAYED">DELAYED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredProjects.map(project => (
            <div key={project.project_id} style={{ 
              background: '#f9fafb', 
              padding: '1.5rem', 
              borderRadius: '16px',
              border: '1px solid var(--surface-border)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{project.project_name}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                Status: <strong style={{ color: 'var(--text-primary)' }}>{project.status}</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
                <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                <span>End: {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`${project.project_id}`} style={{ flex: 1 }}>
                  <Button style={{ width: '100%', background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}>View</Button>
                </Link>
                {currentUser?.role !== 'Collaborator' && (
                  <>
                    <Link to={`edit/${project.project_id}`} style={{ flex: 1 }}>
                      <Button style={{ width: '100%', background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}>Edit</Button>
                    </Link>
                    <Button 
                      style={{ flex: 1, background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5' }}
                      onClick={() => handleDelete(project.project_id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {filteredProjects.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No projects found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
