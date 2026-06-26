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
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
      setSearchQuery('');
      setIsDropdownOpen(false);
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
  const availableUsers = users.filter(u => u.role === 'Collaborator' && !members.some(m => m.user_id === u.user_id));
  const filteredUsers = availableUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div className="header-actions">
        <div className="mobile-hidden" style={{ flex: 1 }}></div>
        <h1 style={{ margin: 0, textAlign: 'center' }}>Project Details</h1>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="..">
            <Button style={{ background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', whiteSpace: 'nowrap' }}>Back to Projects</Button>
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="error-message" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>{success}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
              <div className="form-row" style={{ alignItems: 'flex-end' }}>
                <div style={{ flex: 3, width: '100%', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>User</label>
                  
                  {/* Custom Dropdown Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="input-field"
                    style={{ 
                      marginBottom: 0, 
                      textAlign: 'left', 
                      background: '#f9fafb', 
                      color: 'var(--text-primary)', 
                      border: '1px solid var(--surface-border)', 
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>
                      {selectedUser 
                        ? (users.find(u => String(u.user_id) === selectedUser)?.username + ' (' + users.find(u => String(u.user_id) === selectedUser)?.email + ')') 
                        : 'Select User...'
                      }
                    </span>
                    <span>{isDropdownOpen ? '▲' : '▼'}</span>
                  </button>

                  {/* Custom Searchable Dropdown Overlay */}
                  {isDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--surface-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      zIndex: 1100,
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: '300px',
                      padding: '0.5rem',
                      marginBottom: '5px'
                    }}>
                      {/* User list */}
                      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.5rem', maxHeight: '200px' }}>
                        {filteredUsers.map(u => (
                          <div
                            key={u.user_id}
                            onClick={() => {
                              setSelectedUser(String(u.user_id));
                              setIsDropdownOpen(false);
                            }}
                            style={{
                              padding: '0.6rem 0.8rem',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              transition: 'background 0.2s',
                              fontSize: '0.9rem',
                              color: 'var(--text-primary)',
                              textAlign: 'left'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {u.username} ({u.email})
                          </div>
                        ))}
                        {filteredUsers.length === 0 && (
                          <div style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'left' }}>
                            No users found
                          </div>
                        )}
                      </div>

                      {/* Search box at the bottom */}
                      <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="input-field"
                          style={{ marginBottom: 0, background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  {/* Hidden required input for form validation */}
                  <input 
                    type="hidden" 
                    value={selectedUser} 
                    required 
                  />
                </div>
                <div style={{ flex: 1.5, width: '100%' }}>
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
                <div style={{ flex: 1, width: '100%' }}>
                  <Button type="submit" disabled={addingMember || availableUsers.length === 0} style={{ width: '100%' }}>
                    {addingMember ? 'Adding...' : 'Add'}
                  </Button>
                </div>
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '0.15rem 0.4rem', 
                      background: member.project_role === 'INCHARGE' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: member.project_role === 'INCHARGE' ? 'var(--primary-color)' : 'var(--text-primary)',
                      borderRadius: '4px',
                      marginBottom: '0.4rem'
                    }}>
                      {member.project_role}
                    </span>
                    <div style={{ fontWeight: 500 }}>{member.user?.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.user?.email}</div>
                  </div>
                  <div>
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
