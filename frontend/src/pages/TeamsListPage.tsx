import React, { useEffect, useState } from 'react';
import { 
  getProjects, 
  getAllTeamMembers, 
  removeMemberFromProject,
  getAllUsers,
  updateMemberRole,
  addMemberToProject
} from '../services/project.service';
import type { Project, ProjectMember, User } from '../services/project.service';
import { Button } from '../components/ui/Button';

export const TeamsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projData, membersData, usersData] = await Promise.all([
        getProjects(),
        getAllTeamMembers(),
        getAllUsers()
      ]);
      setProjects(projData);
      setMembers(membersData);
      setAllUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemove = async (projectId: number, userId: number) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeMemberFromProject(projectId, userId);
      setMembers(members.filter(m => !(m.project_id === projectId && m.user_id === userId)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleMakeIncharge = async (projectId: number, userId: number) => {
    if (!window.confirm('Are you sure you want to make this member the INCHARGE?')) return;
    try {
      const currentIncharge = members.find(m => m.project_id === projectId && m.project_role === 'INCHARGE');
      
      await updateMemberRole(projectId, userId, 'INCHARGE');
      
      if (currentIncharge && currentIncharge.user_id !== userId) {
        await updateMemberRole(projectId, currentIncharge.user_id, 'MEMBER');
      }

      setMembers(prev => prev.map(m => {
        if (m.project_id === projectId) {
          if (m.user_id === userId) return { ...m, project_role: 'INCHARGE' };
          if (currentIncharge && m.user_id === currentIncharge.user_id) return { ...m, project_role: 'MEMBER' };
        }
        return m;
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleAddMember = async (projectId: number, userId: number) => {
    try {
      setAddingMember(true);
      const newMember = await addMemberToProject(projectId, userId, 'MEMBER');
      const userToAdd = allUsers.find(u => u.user_id === userId);
      if (userToAdd) {
        setMembers(prev => [...prev, {
          ...newMember,
          user: { user_id: userToAdd.user_id, username: userToAdd.username, email: userToAdd.email }
        }]);
      }
      setSelectedUserToAdd('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const getProjectMembers = (projectId: number) => {
    return members.filter(m => m.project_id === projectId);
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="glass-panel" style={{ padding: '2rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Project Teams</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
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
                <h3 style={{ marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '14ch' }} title={project.project_name}>{project.project_name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {getProjectMembers(project.project_id).length} Team Members
                </p>
                <div style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 500 }}>
                  View Team &rarr;
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Popup */}
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
            maxWidth: '700px', 
            maxHeight: '80vh', 
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
            
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              Team: <span style={{ marginLeft: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '14ch', display: 'inline-block' }} title={selectedProject.project_name}>{selectedProject.project_name}</span>
            </h2>
            
            <div style={{ overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Member</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Role</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getProjectMembers(selectedProject.project_id).length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No members assigned yet.
                      </td>
                    </tr>
                  ) : (
                    getProjectMembers(selectedProject.project_id).map((member) => (
                      <tr key={member.project_team_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem' }}>{member.user?.username} ({member.user?.email})</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            padding: '0.25rem 0.5rem', 
                            background: member.project_role === 'INCHARGE' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.1)',
                            color: member.project_role === 'INCHARGE' ? 'var(--primary-color)' : 'var(--text-primary)',
                            borderRadius: '4px'
                          }}>
                            {member.project_role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select
                            className="input-field"
                            value=""
                            onChange={(e) => {
                              if (e.target.value === 'make_incharge') {
                                handleMakeIncharge(member.project_id, member.user_id);
                              } else if (e.target.value === 'remove') {
                                handleRemove(member.project_id, member.user_id);
                              }
                            }}
                            style={{ width: '180px', padding: '0.25rem 0.5rem', height: 'auto', background: 'var(--surface-color)', border: '1px solid var(--surface-border)' }}
                          >
                            <option value="" disabled>Actions</option>
                            {member.project_role !== 'INCHARGE' && (
                              <option value="make_incharge">Change role to INCHARGE</option>
                            )}
                            <option value="remove">Remove member</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <select
                className="input-field"
                value={selectedUserToAdd}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedUserToAdd(val);
                  if (val) {
                    handleAddMember(selectedProject.project_id, Number(val));
                  }
                }}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--primary-color)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', fontWeight: 500, marginBottom: 0 }}
                disabled={addingMember}
              >
                <option value="" disabled>{addingMember ? 'Adding...' : 'Add member...'}</option>
                {allUsers
                  .filter(u => u.role === 'Collaborator' && !getProjectMembers(selectedProject.project_id).some(m => m.user_id === u.user_id))
                  .map(u => (
                    <option key={u.user_id} value={u.user_id} style={{ background: 'var(--surface-color)', color: 'var(--text-primary)' }}>
                      {u.username} ({u.email})
                    </option>
                  ))
                }
              </select>
              <Button style={{ width: '100%', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} onClick={() => setSelectedProject(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
