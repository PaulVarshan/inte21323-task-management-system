import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProjects, getAllUsers, addMemberToProject, getProjectMembers } from '../services/project.service';
import type { Project, User, ProjectMember } from '../services/project.service';
import { Button } from '../components/ui/Button';

interface MemberSelection {
  userId: string;
  role: string;
}

export const AddTeamMemberPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProject, setSelectedProject] = useState('');
  const [members, setMembers] = useState<MemberSelection[]>([{ userId: '', role: 'MEMBER' }]);
  
  const [existingMembers, setExistingMembers] = useState<ProjectMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projData, usersData] = await Promise.all([
          getProjects(),
          getAllUsers()
        ]);
        setProjects(projData);
        // Only show collaborators in the dropdown
        setUsers(usersData.filter(u => u.role === 'Collaborator'));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      getProjectMembers(Number(selectedProject))
        .then(data => setExistingMembers(data))
        .catch(err => console.error(err));
    } else {
      setExistingMembers([]);
    }
  }, [selectedProject]);

  const addMemberField = () => {
    setMembers([...members, { userId: '', role: 'MEMBER' }]);
  };

  const removeMemberField = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMemberField = (index: number, field: keyof MemberSelection, value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedProject) {
      setError('Please select a project.');
      return;
    }

    if (members.some(m => !m.userId)) {
      setError('Please select a user for all member fields.');
      return;
    }

    // Check for duplicate users in the form
    const userIds = members.map(m => m.userId);
    if (new Set(userIds).size !== userIds.length) {
      setError('You cannot add the same user multiple times in one go.');
      return;
    }

    // Check "Only one member can be in charge" rule
    const inChargeCountInForm = members.filter(m => m.role === 'INCHARGE').length;
    const existingInCharge = existingMembers.some(m => m.project_role === 'INCHARGE');

    if (inChargeCountInForm > 1) {
      setError('Only one member can be in charge. Please change the roles.');
      return;
    }

    if (inChargeCountInForm === 1 && existingInCharge) {
      setError('This project already has a member INCHARGE. You cannot add another.');
      return;
    }

    try {
      setSubmitting(true);
      // Process sequentially or in parallel
      for (const m of members) {
        await addMemberToProject(Number(selectedProject), Number(m.userId), m.role);
      }
      navigate('..');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add team members');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="glass-panel form-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Add Team Members</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <label>Project *</label>
            <select 
              className="input-field" 
              value={selectedProject} 
              onChange={e => setSelectedProject(e.target.value)}
              required
            >
              <option value="">Select Project...</option>
              {projects.map(p => (
                <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
              ))}
            </select>
          </div>

          <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ margin: 0 }}>Members to Add *</label>
              <button 
                type="button" 
                onClick={addMemberField}
                style={{ 
                  background: 'var(--primary-color)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  lineHeight: 1
                }}
                title="Add another member"
              >
                +
              </button>
            </div>

            {members.map((member, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ flex: 2 }}>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input-field"
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <select 
                    className="input-field" 
                    style={{ marginBottom: 0 }}
                    value={member.userId} 
                    onChange={e => updateMemberField(index, 'userId', e.target.value)}
                    required
                  >
                    <option value="">Select User...</option>
                    {filteredUsers.map(u => (
                      <option key={u.user_id} value={u.user_id}>{u.username} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <select 
                    className="input-field" 
                    style={{ marginBottom: 0 }}
                    value={member.role} 
                    onChange={e => updateMemberField(index, 'role', e.target.value)}
                    required
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="INCHARGE">INCHARGE</option>
                  </select>
                </div>

                {members.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeMemberField(index)}
                    style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', padding: '0.5rem', fontSize: '1.2rem' }}
                    title="Remove member"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link to=".." style={{ flex: 1 }}>
              <Button type="button" style={{ width: '100%', background: '#e5e7eb', color: 'var(--text-primary)' }}>Cancel</Button>
            </Link>
            <Button type="submit" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Members'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
