import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { getTasks, updateTask } from '../services/task.service';
import type { Task } from '../services/task.service';
import { getProjects } from '../services/project.service';
import type { Project } from '../services/project.service';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useAuth } from '../context/AuthContext';
import { createComment } from '../services/comment.service';

const statusColumns = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;

type StatusColumn = (typeof statusColumns)[number];

const columnColorMap: Record<StatusColumn, { tint: string; icon: string; accent: string }> = {
  TODO: { tint: 'rgba(59, 130, 246, 0.06)', icon: '📋', accent: '#3B82F6' },
  IN_PROGRESS: { tint: 'rgba(234, 179, 8, 0.06)', icon: '⚙️', accent: '#EAB308' },
  REVIEW: { tint: 'rgba(147, 51, 234, 0.06)', icon: '🔍', accent: '#9333EA' },
  DONE: { tint: 'rgba(34, 197, 94, 0.06)', icon: '✓', accent: '#22C55E' },
};

const priorityColorMap: Record<string, string> = {
  Low: '#4CAF50',
  Medium: '#FFC107',
  High: '#F44336',
  Critical: '#9C27B0',
};

const priorityWeight: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

const getPriorityColor = (priority?: string) => {
  if (!priority) return '#999';
  return priorityColorMap[priority] || '#999';
};

const formatDueDate = (dueDate: string | null) => {
  if (!dueDate) return 'No due date';
  const date = new Date(dueDate);
  return isNaN(date.getTime()) ? dueDate : date.toLocaleDateString();
};

const KanbanCard = ({ task, onClick, buildAssigneesLabel }: { task: Task, onClick: () => void, buildAssigneesLabel: (t: Task) => string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.task_id.toString(),
    data: { task }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 999 : 1,
    width: '100%',
    textAlign: 'left' as const,
    border: '1px solid var(--surface-border)',
    padding: '1rem',
    marginBottom: '1rem',
    background: 'var(--surface-color)',
    cursor: isDragging ? 'grabbing' : 'grab',
    borderRadius: '0.75rem',
    transition: transform ? 'none' : 'all 0.3s ease',
    boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass-panel"
      onMouseEnter={(e) => {
        if (isDragging) return;
        const target = e.currentTarget;
        target.style.background = 'var(--bg-gradient)';
        target.style.border = '1px solid var(--primary-color)';
        target.style.boxShadow = `0 8px 16px rgba(0, 0, 0, 0.1), 0 0 20px rgba(${task.status === 'TODO' ? '59, 130, 246' : task.status === 'IN_PROGRESS' ? '234, 179, 8' : task.status === 'REVIEW' ? '147, 51, 234' : '34, 197, 94'}, 0.2)`;
      }}
      onMouseLeave={(e) => {
        if (isDragging) return;
        const target = e.currentTarget;
        target.style.background = 'var(--surface-color)';
        target.style.border = '1px solid var(--surface-border)';
        target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
      }}
      onClick={(e) => {
        // Prevent click when dragging
        if (transform) {
          e.stopPropagation();
          return;
        }
        onClick();
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{task.title}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            Project: <span style={{ marginLeft: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '14ch', display: 'inline-block' }} title={task.project?.project_name}>{task.project?.project_name || 'No project'}</span>
          </p>
        </div>
        <span
          style={{
            padding: '0.4rem 0.7rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#fff',
            backgroundColor: getPriorityColor(task.priority),
            whiteSpace: 'nowrap',
            alignSelf: 'flex-start',
            flexShrink: 0,
            boxShadow: `0 4px 12px ${getPriorityColor(task.priority)}40`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {task.priority || 'Medium'}
        </span>
      </div>

      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        📅 {formatDueDate(task.due_date)}
      </p>
      <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        👥 {buildAssigneesLabel(task)}
      </p>
    </div>
  );
};

const KanbanDroppableColumn = ({ status, children, ...props }: { status: StatusColumn, children: React.ReactNode, [key: string]: any }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <section
      ref={setNodeRef}
      {...props}
      style={{
        ...props.style,
        border: isOver ? `1px dashed ${columnColorMap[status].accent}` : props.style.border,
        background: isOver ? `rgba(${columnColorMap[status].accent === '#3B82F6' ? '59,130,246' : columnColorMap[status].accent === '#EAB308' ? '234,179,8' : columnColorMap[status].accent === '#9333EA' ? '147,51,234' : '34,197,94'}, 0.15)` : props.style.background
      }}
    >
      {children}
    </section>
  );
};


export const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Rejection modal state
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [pendingRejection, setPendingRejection] = useState<{ taskId: number; newStatus: StatusColumn; originalStatus: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const taskId = parseInt(active.id as string);
    const newStatus = over.id as StatusColumn;
    const taskData = active.data.current?.task as Task;

    if (taskData.status === newStatus) return;

    if (user?.role === 'Collaborator' && newStatus === 'DONE') {
      setError("Collaborators cannot mark tasks as DONE");
      return;
    }

    if (taskData.status === 'REVIEW' && newStatus === 'IN_PROGRESS' && user?.role !== 'Collaborator') {
      setPendingRejection({
        taskId,
        newStatus,
        originalStatus: taskData.status
      });
      setRejectionReason('');
      setRejectionError('');
      setRejectionModalOpen(true);
      return;
    }

    await executeStatusChange(taskId, newStatus, taskData.status);
  };

  const executeStatusChange = async (taskId: number, newStatus: string, originalStatus: string, reason?: string) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status: newStatus } : t));

    try {
      if (reason) {
        await createComment(taskId, reason);
      }
      await updateTask(taskId, { status: newStatus });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to update task status');
      // Revert on error
      setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status: originalStatus } : t));
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError('Please enter a reason for rejection.');
      return;
    }
    if (!pendingRejection) return;

    const { taskId, newStatus, originalStatus } = pendingRejection;
    const reasonToSet = rejectionReason.trim();

    setRejectionModalOpen(false);
    setPendingRejection(null);
    setRejectionReason('');

    await executeStatusChange(taskId, newStatus, originalStatus, reasonToSet);
  };

  const handleCancelRejection = () => {
    setRejectionModalOpen(false);
    setPendingRejection(null);
    setRejectionReason('');
    setRejectionError('');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, projectsData] = await Promise.all([getTasks(), getProjects()]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err: any) {
      setError(err?.message || 'Unable to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const tasksByStatus = useMemo(() => {
    const sortedFilteredTasks = tasks
      .filter(task => selectedProjectId === 'all' || task.project_id === Number(selectedProjectId))
      .sort((a, b) => (priorityWeight[b.priority || 'Medium'] || 0) - (priorityWeight[a.priority || 'Medium'] || 0));

    return statusColumns.reduce((acc, status) => {
      acc[status] = sortedFilteredTasks.filter((task) => task.status === status);
      return acc;
    }, {} as Record<StatusColumn, Task[]>);
  }, [tasks, selectedProjectId]);



  const buildAssigneesLabel = (task: Task) => {
    return task.assignees?.map((assigned) => assigned.user?.username).filter(Boolean).join(', ') || 'Unassigned';
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0 }}>Kanban Board</h1>
          <p style={{ margin: '0.5rem 0 1rem', color: 'var(--text-secondary)' }}>
            Track tasks across TODO, In Progress, Review, and Done.
          </p>
          <select
            className="input-field"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ width: '250px', padding: '0.5rem', background: 'var(--surface-color)', border: '1px solid var(--surface-border)' }}
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid var(--surface-border)', color: '#d32f2f' }}>
          {error}
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {statusColumns.map((status) => {
            const { tint, icon, accent } = columnColorMap[status];
            const taskCount = tasksByStatus[status]?.length || 0;
            return (
              <KanbanDroppableColumn
                key={status}
                status={status}
                className="glass-panel"
                style={{
                  height: 'calc(100vh - 280px)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  background: tint,
                  backdropFilter: 'blur(10px)',
                  borderRadius: '1rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'background 0.2s, border 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1 }}>
                    {status.replace('_', ' ')}
                  </h2>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#fff',
                      backgroundColor: accent,
                      boxShadow: `0 4px 12px ${accent}40`,
                    }}
                  >
                    {taskCount}
                  </span>
                </div>

                <div style={{ borderTop: `2px solid ${accent}40`, paddingTop: '1rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {loading ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Loading tasks…</p>
                  ) : taskCount > 0 ? (
                    tasksByStatus[status].map(task => (
                      <KanbanCard key={task.task_id} task={task} onClick={() => setSelectedTask(task)} buildAssigneesLabel={buildAssigneesLabel} />
                    ))
                  ) : (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textAlign: 'center', paddingTop: '2rem' }}>
                      No tasks in this column
                    </div>
                  )}
                </div>
              </KanbanDroppableColumn>
            );
          })}
        </div>
      </DndContext>

      {selectedTask && (
        <TaskDetailsModal
          taskId={selectedTask.task_id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={loadData}
        />
      )}
      {rejectionModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
          padding: '1rem'
        }} onClick={handleCancelRejection}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            background: 'linear-gradient(135deg, #1b3222 0%, #0c1810 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            color: '#fff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>Reason for Rejection</h3>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (e.target.value.trim()) setRejectionError('');
              }}
              placeholder="Type the reason for rejection here..."
              style={{
                width: '100%',
                height: '120px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: rejectionError ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                color: '#fff',
                padding: '0.75rem',
                fontSize: '0.95rem',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
            />
            {rejectionError && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                {rejectionError}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                onClick={handleCancelRejection}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#9ca3af',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '0.6rem 1.2rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmRejection}
                style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.6rem 1.2rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.2)';
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
