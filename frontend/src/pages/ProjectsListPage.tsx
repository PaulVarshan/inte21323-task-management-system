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
      <div className="glass-panel">
        <div className="header-actions">
          <h1 style={{ margin: 0 }}>Projects</h1>
          {currentUser?.role !== 'Collaborator' && (
            <div>
              <Link to="new">
                <Button style={{ whiteSpace: 'nowrap' }}>Create New Project</Button>
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
            style={{ marginBottom: 0, flex: 1 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="input-field" 
            style={{ marginBottom: 0, width: '200px' }}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {filteredProjects.map(project => (
            <div key={project.project_id} style={{ 
              background: 'var(--surface-color)', 
              padding: '1.5rem', 
              borderRadius: '16px',
              border: '1px solid var(--surface-border)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '14ch' }} title={project.project_name}>{project.project_name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Status: <strong style={{ color: 'var(--primary-color)' }}>{project.status}</strong>
              </p>
              <div className="card-dates">
                <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                <span>End: {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="card-actions" style={{ marginTop: 'auto' }}>
                <Link to={`${project.project_id}`} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <Button style={{ padding: '0.4rem', fontSize: '0.85rem', background: '#e5e7eb', color: 'var(--text-primary)', width: '100%' }}>View</Button>
                </Link>
                {currentUser?.role !== 'Collaborator' && (
                  <>
                    <Link to={`edit/${project.project_id}`} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      <Button style={{ padding: '0.4rem', fontSize: '0.85rem', background: '#e5e7eb', color: 'var(--text-primary)', width: '100%' }}>Edit</Button>
                    </Link>
                    <Button 
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem', background: 'var(--error-color)', color: '#fff', width: '100%' }}
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
