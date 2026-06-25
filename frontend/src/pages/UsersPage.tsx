import React, { useEffect, useState } from 'react';
import { getAllUsers, changeUserRole, changeUserStatus, type User } from '../services/user.service';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, currentStatus: boolean) => {
    try {
      await changeUserStatus(userId, !currentStatus);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change user status');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await changeUserRole(userId, newRole);
      fetchUsers(); // Refresh to get the updated role names properly nested
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change user role');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#e74c3c' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>User Management</h1>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Created</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const roleName = user.user_roles?.[0]?.role?.role_name || 'N/A';
              return (
                <tr key={user.user_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{user.username}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={roleName}
                      onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Collaborator">Collaborator</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      background: user.is_active ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                      color: user.is_active ? '#2ecc71' : '#e74c3c'
                    }}>
                      {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Button 
                      type="button"
                      onClick={() => handleStatusChange(user.user_id, user.is_active)}
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        fontSize: '0.8rem', 
                        background: user.is_active ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)',
                        color: user.is_active ? '#e74c3c' : '#2ecc71',
                        border: '1px solid currentColor'
                      }}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No users found.
          </div>
        )}
      </div>
    </div>
  );
};
