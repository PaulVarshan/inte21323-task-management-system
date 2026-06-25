import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getOverview, 
  getProjectProgress, 
  getTaskStatus, 
  getOverdueTasks, 
  getUpcomingDeadlines, 
  getRecentTasks 
} from '../services/dashboard.service';
import type { 
  OverviewStats, 
  ProjectProgressData, 
  TaskStatusCounts, 
  OverdueTaskData, 
  UpcomingDeadlinesData, 
  RecentTaskData 
} from '../services/dashboard.service';
import { OverviewCards } from '../components/dashboard/OverviewCards';
import { ProjectProgress } from '../components/dashboard/ProjectProgress';
import { TaskStatusOverview } from '../components/dashboard/TaskStatusOverview';
import { OverdueTasks } from '../components/dashboard/OverdueTasks';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';
import { RecentTasks } from '../components/dashboard/RecentTasks';
import { TaskDetailsModal } from '../components/TaskDetailsModal';

export const CollaboratorDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [projectProgress, setProjectProgress] = useState<ProjectProgressData[]>([]);
  const [taskStatus, setTaskStatus] = useState<TaskStatusCounts | null>(null);
  const [overdueTasks, setOverdueTasks] = useState<OverdueTaskData[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadlinesData | null>(null);
  const [recentTasks, setRecentTasks] = useState<RecentTaskData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Level 2 Modal: Task details
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [
        statsData,
        progressData,
        statusData,
        overdueData,
        deadlinesData,
        recentData
      ] = await Promise.all([
        getOverview(),
        getProjectProgress(),
        getTaskStatus(),
        getOverdueTasks(),
        getUpcomingDeadlines(),
        getRecentTasks()
      ]);
      setStats(statsData);
      setProjectProgress(progressData);
      setTaskStatus(statusData);
      setOverdueTasks(overdueData);
      setUpcomingDeadlines(deadlinesData);
      setRecentTasks(recentData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="page-container">Loading My Dashboard...</div>;

  return (
    <div className="dashboard-container" style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {error && <div className="error-message">{error}</div>}

      {/* Row 1: Overview stats cards */}
      {stats && <OverviewCards stats={stats} />}

      {/* Row 2: Project progress & Task Status count widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <ProjectProgress projects={projectProgress} />
        {taskStatus && <TaskStatusOverview statusCounts={taskStatus} />}
      </div>

      {/* Row 3: Overdue tasks & Upcoming deadlines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <OverdueTasks tasks={overdueTasks} onTaskClick={setSelectedTaskId} />
        {upcomingDeadlines && <UpcomingDeadlines deadlines={upcomingDeadlines} onTaskClick={setSelectedTaskId} />}
      </div>

      {/* Row 4: Recent Tasks */}
      <RecentTasks tasks={recentTasks} onTaskClick={setSelectedTaskId} />

      {/* Integrated Part 5 task details widget modal */}
      {selectedTaskId && (
        <TaskDetailsModal
          taskId={selectedTaskId}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={fetchDashboardData}
        />
      )}
    </div>
  );
};
