import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProjects, getProjectMembers } from '../services/project.service';
import { createTask } from '../services/task.service';
import type { Project, ProjectMember } from '../services/project.service';
import { Button } from '../components/ui/Button';

export const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    due_date: ''
  });
  const [assignees, setAssignees] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProj = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProj();
  }, []);

  useEffect(() => {
    if (formData.project_id) {
      const fetchMembers = async () => {
        try {
          const members = await getProjectMembers(Number(formData.project_id));
          setProjectMembers(members);
          setAssignees([]); // reset assignees when project changes
        } catch (err) {
          console.error("Failed to fetch project members", err);
        }
      };
      fetchMembers();
    } else {
      setProjectMembers([]);
      setAssignees([]);
    }
  }, [formData.project_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.project_id) {
      setError('Please select a project');
      return;
    }

    try {
      setSubmitting(true);
      await createTask({
        ...formData,
        project_id: Number(formData.project_id),
        assignees
      });
      navigate('..');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssigneeToggle = (userId: number) => {
    if (assignees.includes(userId)) {
      setAssignees(assignees.filter(id => id !== userId));
    } else {
      setAssignees([...assignees, userId]);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="glass-panel form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Create New Task</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <label>Project *</label>
            <select 
              className="input-field" 
              value={formData.project_id} 
              onChange={e => setFormData({...formData, project_id: e.target.value})}
              required
            >
              <option value="">Select Project...</option>
              {projects.map(p => (
                <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Task Title *</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="input-field" 
              rows={4}
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Priority</label>
              <select 
                className="input-field" 
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Status</label>
              <select 
                className="input-field" 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="REVIEW">REVIEW</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input 
              type="date" 
              className="input-field" 
              value={formData.due_date} 
              onChange={e => setFormData({...formData, due_date: e.target.value})}
            />
          </div>

          {formData.project_id && (
            <div className="form-group">
              <label>Assignees (Optional)</label>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {projectMembers.length === 0 ? (
                  <span style={{ color: 'var(--text-secondary)' }}>No members in this project.</span>
                ) : (
                  projectMembers.map(m => (
                    <label key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={assignees.includes(m.user_id)}
                        onChange={() => handleAssigneeToggle(m.user_id)}
                      />
                      {m.user?.username} ({m.user?.email}) - <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{m.project_role}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link to=".." style={{ flex: 1 }}>
              <Button type="button" style={{ width: '100%', background: 'var(--surface-color)' }}>Cancel</Button>
            </Link>
            <Button type="submit" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
