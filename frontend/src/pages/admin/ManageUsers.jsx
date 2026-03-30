import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Trash2, User as UserIcon } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id) => {
    try {
      await axios.put(`/api/users/${id}/approve`);
      setUsers(users.map(user => user.id === id ? { ...user, isApproved: true } : user));
    } catch (err) {
      alert('Failed to approve user');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div className="users-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">Approve and manage user accounts</p>
        </div>
      </header>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                      <div className="user-avatar" style={{background: '#f1f3f4', padding: '0.5rem', borderRadius: '50%'}}>
                        <UserIcon size={18} />
                      </div>
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isApproved ? 'approved' : 'pending'}`}>
                      {user.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </td>
                  <td className="table-actions">
                    {!user.isApproved && (
                      <button className="icon-btn approve" onClick={() => approveUser(user.id)} title="Approve User">
                        <Check size={18} color="#34a853" />
                      </button>
                    )}
                    <button className="icon-btn delete" onClick={() => deleteUser(user.id)} title="Delete User">
                      <Trash2 size={18} color="#ea4335" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
