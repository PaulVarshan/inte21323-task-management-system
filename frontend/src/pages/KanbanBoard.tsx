import React, { useEffect, useMemo, useState } from 'react';
import { getTasks } from '../services/task.service';
import type { Task } from '../services/task.service';
import { getProjects } from '../services/project.service';
import type { Project } from '../services/project.service';
import { TaskDetailsModal } from '../components/TaskDetailsModal';

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

export const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const renderCard = (task: Task) => (
    <button
      key={task.task_id}
      type="button"
      className="glass-panel"
      style={{
        width: '100%',
        textAlign: 'left',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem',
        marginBottom: '1rem',
        background: 'rgba(30, 30, 45, 0.6)',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        borderRadius: '0.75rem',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.background = 'rgba(50, 50, 70, 0.8)';
        target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        target.style.boxShadow = `0 8px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(${task.status === 'TODO' ? '59, 130, 246' : task.status === 'IN_PROGRESS' ? '234, 179, 8' : task.status === 'REVIEW' ? '147, 51, 234' : '34, 197, 94'}, 0.2)`;
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.background = 'rgba(30, 30, 45, 0.6)';
        target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
      onClick={() => setSelectedTask(task)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{task.title}</h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {task.project?.project_name || 'No project'}
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
    </button>
  );

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {statusColumns.map((status) => {
          const { tint, icon, accent } = columnColorMap[status];
          const taskCount = tasksByStatus[status]?.length || 0;
          return (
            <section
              key={status}
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
                  tasksByStatus[status].map(renderCard)
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textAlign: 'center', paddingTop: '2rem' }}>
                    No tasks in this column
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetailsModal
          taskId={selectedTask.task_id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={loadData}
        />
      )}
    </div>
  );
};
