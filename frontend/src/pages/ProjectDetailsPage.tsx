import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getProjectById, 
  getProjectMembers, 
  addMemberToProject, 
  removeMemberFromProject, 
  getAllUsers
} from '../services/project.service';
import type { Project, ProjectMember, User } from '../services/project.service';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [addingMember, setAddingMember] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projData, membersData, usersData] = await Promise.all([
        getProjectById(Number(id)),
        getProjectMembers(Number(id)),
        getAllUsers()
      ]);
      setProject(projData);
      setMembers(membersData);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }
    try {
      setAddingMember(true);
      await addMemberToProject(Number(id), Number(selectedUser), selectedRole);
      setSuccess('Member added successfully');
      setSelectedUser('');
      // Refresh members
      const updatedMembers = await getProjectMembers(Number(id));
      setMembers(updatedMembers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    setError('');
    setSuccess('');
    try {
      await removeMemberFromProject(Number(id), userId);
      setSuccess('Member removed successfully');
      setMembers(members.filter(m => m.user_id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;
  if (!project) return <div className="page-container">Project not found</div>;

  const isAdminOrCreator = currentUser?.role === 'Admin' || project.created_by === Number(currentUser?.user_id);
  const availableUsers = users.filter(u => !members.some(m => m.user_id === u.user_id));

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Project Details</h1>
        <Link to="..">
          <Button style={{ background: 'var(--surface-color)' }}>Back to Projects</Button>
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="error-message" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Project Details Panel */}
        <div className="glass-panel" style={{ padding: '2rem', alignSelf: 'start' }}>
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
            {project.project_name}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
              <strong style={{ marginLeft: '0.5rem' }}>{project.status}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Creator:</span>
              <span style={{ marginLeft: '0.5rem' }}>{project.creator?.username} ({project.creator?.email})</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Start Date:</span>
              <span style={{ marginLeft: '0.5rem' }}>{new Date(project.start_date).toLocaleDateString()}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>End Date:</span>
              <span style={{ marginLeft: '0.5rem' }}>{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Description:</span>
              <p style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                {project.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Team Management Panel */}
        <div className="glass-panel" style={{ padding: '2rem', alignSelf: 'start' }}>
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
            Team Management
          </h2>

          {isAdminOrCreator && (
            <form onSubmit={handleAddMember} style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Add New Member</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>User</label>
                  <select 
                    className="input-field" 
                    style={{ marginBottom: 0 }}
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required
                  >
                    <option value="">Select User...</option>
                    {availableUsers.map(u => (
                      <option key={u.user_id} value={u.user_id}>{u.username} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role</label>
                  <select 
                    className="input-field" 
                    style={{ marginBottom: 0 }}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="INCHARGE">INCHARGE</option>
                  </select>
                </div>
                <Button type="submit" disabled={addingMember || availableUsers.length === 0}>
                  {addingMember ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Current Members ({members.length})</h3>
            {members.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No members found.</p>
            ) : (
              members.map(member => (
                <div key={member.project_team_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{member.user?.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.user?.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.25rem 0.5rem', 
                      background: member.project_role === 'INCHARGE' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: member.project_role === 'INCHARGE' ? 'var(--primary-color)' : 'var(--text-primary)',
                      borderRadius: '4px'
                    }}>
                      {member.project_role}
                    </span>
                    {isAdminOrCreator && (
                      <button 
                        onClick={() => handleRemoveMember(member.user_id)}
                        style={{ 
                          background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
