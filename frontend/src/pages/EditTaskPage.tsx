import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProjectMembers } from '../services/project.service';
import { getTaskById, updateTask } from '../services/task.service';
import type { ProjectMember } from '../services/project.service';
import { Button } from '../components/ui/Button';

export const EditTaskPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    due_date: ''
  });
  const [assignees, setAssignees] = useState<number[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const task = await getTaskById(Number(id));
        setFormData({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
        });
        setAssignees(task.assignees?.map(a => a.user_id) || []);
        setProjectId(task.project_id);

        const members = await getProjectMembers(task.project_id);
        setProjectMembers(members);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch task');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTask();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      await updateTask(Number(id), {
        ...formData,
        assignees
      });
      navigate('..');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssigneeToggle = (userId: number) => {
    if (assignees.includes(userId)) {
      setAssignees(assignees.filter(userIdToKeep => userIdToKeep !== userId));
    } else {
      setAssignees([...assignees, userId]);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="glass-panel form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Edit Task</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
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

          {projectId && (
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
            <Link to="../.." relative="path" style={{ flex: 1 }}>
              <Button type="button" style={{ width: '100%', background: 'var(--surface-color)' }}>Cancel</Button>
            </Link>
            <Button type="submit" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
