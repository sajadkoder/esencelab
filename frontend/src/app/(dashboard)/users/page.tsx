'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { User } from '@/types';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { Users, Search, Trash2 } from 'lucide-react';

export default function UsersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);

      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.data.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchTerm]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (user?.role === 'admin') {
      void fetchUsers();
      return;
    }
    setLoading(false);
  }, [fetchUsers, isAuthenticated, user?.role]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${userId}`);
      void fetchUsers();
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !currentStatus });
      void fetchUsers();
    } catch {
      alert('Failed to update user status');
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'primary' | 'success' | 'warning'> = {
      admin: 'warning',
      employer: 'success',
      student: 'primary',
    };
    return <Badge variant={variants[role] || 'secondary'}>{role}</Badge>;
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">User Management</h1>
          <p className="text-secondary">Manage platform users</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="field-3d w-full rounded-xl py-2.5 pl-10 pr-4 focus:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="field-3d rounded-xl px-4 py-2.5 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-secondary">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary">Joined</th>
                  <th className="text-right py-3 px-4 font-medium text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-black/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center">
                          <span className="text-black text-sm font-medium">
                            {u.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-black">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-secondary">{u.email}</td>
                    <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(u.id, !!u.isActive)}
                        className={`px-2 py-1 rounded text-xs font-medium ${u.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-secondary text-sm">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-2 hover:bg-red-50 rounded text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-secondary/70 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No users found</h3>
            <p className="text-secondary">Try adjusting your search criteria</p>
          </div>
        )}
      </Card>
    </div>
  );
}
