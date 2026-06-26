import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import { getTasks, deleteTask, updateTask } from '../services/task.service';
import type { Task } from '../services/task.service';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { TaskDetailsModal } from '../components/TaskDetailsModal';

export const TasksListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const taskData = await getTasks();
      setTasks(taskData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';
    const baseUrl = API_URL.replace(/\/api\/auth\/?$/, '');
    const socket = io(baseUrl, { withCredentials: true });

    socket.on('task-updated', (updatedTask: Task) => {
      setTasks(prevTasks => {
        const exists = prevTasks.some(t => t.task_id === updatedTask.task_id);
        if (exists) {
          return prevTasks.map(t => t.task_id === updatedTask.task_id ? updatedTask : t);
        } else {
          return [...prevTasks, updatedTask];
        }
      });
      setSelectedTask(prev => prev?.task_id === updatedTask.task_id ? updatedTask : prev);
    });

    return () => {
      socket.disconnect();
    };
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

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="glass-panel" style={{ padding: '2rem', position: 'relative' }}>
        <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0 }}>Project Tasks</h1>
          {currentUser?.role !== 'Collaborator' && (
            <div>
              <Link to="new">
                <Button style={{ whiteSpace: 'nowrap' }}>Create Task</Button>
              </Link>
            </div>
          )}
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ overflowX: 'auto', overflowY: 'auto' }}>
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
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.task_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
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
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '14ch', display: 'inline-block', verticalAlign: 'bottom' }} title={task.project?.project_name}>
                        {task.project?.project_name || 'N/A'}
                      </span>
                    </td>
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
                          fontSize: '0.85rem', 
                          padding: '0.4rem 0.75rem', 
                          background: 'rgba(255,255,255,0.08)',
                          color: 'var(--text-primary)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          (e.currentTarget as HTMLSelectElement).style.boxShadow = '0 0 12px rgba(59, 130, 246, 0.25)';
                          (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(59, 130, 246, 0.4)';
                        }}
                        onBlur={(e) => {
                          (e.currentTarget as HTMLSelectElement).style.boxShadow = 'none';
                          (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(255, 255, 255, 0.15)';
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
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {currentUser?.role !== 'Collaborator' && (
                          <Link to={`edit/${task.task_id}`}>
                            <button style={{
                              background: 'rgba(59,130,246,0.15)',
                              border: '1px solid rgba(59,130,246,0.3)',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              borderRadius: '999px',
                              padding: '0.3rem 0.75rem',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(59,130,246,0.25)';
                              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(59,130,246,0.15)';
                              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                            }}>
                              Edit
                            </button>
                          </Link>
                        )}
                        {currentUser?.role !== 'Collaborator' && (
                          <button 
                            onClick={() => handleDelete(task.task_id)}
                            style={{
                              background: 'rgba(239,68,68,0.15)',
                              border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              borderRadius: '999px',
                              padding: '0.3rem 0.75rem',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                            }}
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
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          taskId={selectedTask.task_id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={fetchData}
        />
      )}
    </div>
  );
};
