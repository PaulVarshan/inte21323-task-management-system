import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTasks, deleteTask, updateTask } from '../services/task.service';
import { getProjects } from '../services/project.service';
import type { Task } from '../services/task.service';
import type { Project } from '../services/project.service';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const TasksListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projData, taskData] = await Promise.all([
        getProjects(),
        getTasks()
      ]);
      setProjects(projData);
      setTasks(taskData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks and projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.task_id !== id));
      if (selectedTask?.task_id === id) {
        setSelectedTask(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'var(--error-color)';
      case 'HIGH': return '#f59e0b';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#10b981';
      default: return 'var(--text-secondary)';
    }
  };

  const getProjectTasks = (projectId: number) => {
    return tasks.filter(t => t.project_id === projectId);
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="glass-panel" style={{ padding: '2rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Project Tasks</h1>
          {currentUser?.role !== 'Collaborator' && (
            <Link to="new">
              <Button>Create Task</Button>
            </Link>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {projects.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)' }}>No projects found.</div>
          ) : (
            projects.map(project => (
              <div 
                key={project.project_id} 
                onClick={() => setSelectedProject(project)}
                style={{ 
                  padding: '1.5rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--surface-border)', 
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <h3 style={{ marginBottom: '0.5rem' }}>{project.project_name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {getProjectTasks(project.project_id).length} Tasks
                </p>
                <div style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 500 }}>
                  View Tasks &rarr;
                </div>
              </div>
            ))
          )}
        </div>
      </div>

        {/* Level 1 Modal: Tasks for Selected Project */}
      {selectedProject && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ 
            width: '100%', 
            maxWidth: '900px', 
            maxHeight: '85vh', 
            display: 'flex', 
            flexDirection: 'column',
            padding: '2rem',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedProject(null)}
              style={{
                position: 'absolute',
                top: '1rem', right: '1.5rem',
                background: 'none', border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >&times;</button>
            
            <h2 style={{ marginBottom: '1.5rem' }}>Tasks: {selectedProject.project_name}</h2>
            
            <div style={{ overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Title</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Project</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Priority</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Due Date</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getProjectTasks(selectedProject.project_id).length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No tasks found for this project.
                      </td>
                    </tr>
                  ) : (
                    getProjectTasks(selectedProject.project_id).map(task => (
                      <tr key={task.task_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', fontWeight: 500 }}>
                          {/* Clicking the task title opens the Members modal */}
                          <button 
                            onClick={() => setSelectedTask(task)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: 'var(--text-primary)', 
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              textAlign: 'left',
                              textDecoration: 'underline'
                            }}
                          >
                            {task.title}
                          </button>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{task.project?.project_name}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ color: getPriorityColor(task.priority), fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {task.priority}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select 
                            value={task.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              const previousStatus = task.status;
                              
                              // Optimistic UI update: change instantly
                              setTasks(prevTasks => prevTasks.map(t => t.task_id === task.task_id ? { ...t, status: newStatus } : t));
                              
                              try {
                                // Background database update
                                await updateTask(task.task_id, { status: newStatus });
                              } catch (err: any) {
                                // Revert back if it fails
                                setTasks(prevTasks => prevTasks.map(t => t.task_id === task.task_id ? { ...t, status: previousStatus } : t));
                                alert(err.response?.data?.message || 'Failed to update status. Reverting change.');
                              }
                            }}
                            style={{ 
                              fontSize: '0.8rem', 
                              padding: '0.25rem 0.5rem', 
                              background: 'rgba(255,255,255,0.1)',
                              color: 'var(--text-primary)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <option style={{color: 'black'}} value="TODO">TODO</option>
                            <option style={{color: 'black'}} value="IN_PROGRESS">IN PROGRESS</option>
                            <option style={{color: 'black'}} value="REVIEW">REVIEW</option>
                            <option style={{color: 'black'}} value="DONE">DONE</option>
                          </select>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {currentUser?.role !== 'Collaborator' && (
                              <Link to={`edit/${task.task_id}`}>
                                <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}>
                                  Edit
                                </button>
                              </Link>
                            )}
                            {currentUser?.role !== 'Collaborator' && (
                              <button 
                                onClick={() => handleDelete(task.task_id)}
                                style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', textDecoration: 'underline' }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {currentUser?.role !== 'Collaborator' && (
                <Link to="new">
                  <Button>Create Task</Button>
                </Link>
              )}
              <Button style={{ background: 'var(--surface-color)' }} onClick={() => setSelectedProject(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Level 2 Modal: Task Assignees */}
      {selectedTask && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div className="glass-panel" style={{ 
            width: '100%', 
            maxWidth: '500px', 
            padding: '2rem',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedTask(null)}
              style={{
                position: 'absolute',
                top: '1rem', right: '1.5rem',
                background: 'none', border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >&times;</button>
            
            <h2 style={{ marginBottom: '1rem' }}>Assignees</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              For Task: <strong>{selectedTask.title}</strong>
            </p>
            
            {(!selectedTask.assignees || selectedTask.assignees.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                No members assigned to this task.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedTask.assignees.map(assignee => (
                  <li key={assignee.task_assigned_id} style={{ 
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{ 
                      width: '40px', height: '40px', 
                      borderRadius: '50%', 
                      background: 'var(--primary-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '1.2rem'
                    }}>
                      {assignee.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{assignee.user.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{assignee.user.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button style={{ background: 'var(--surface-color)' }} onClick={() => setSelectedTask(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
