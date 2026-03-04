
import React, { useState, useEffect } from 'react';
import { User } from '../src/services/userService';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Shield, 
  UserX, 
  CheckCircle, 
  Download, 
  Users as UsersIcon,
  ChevronRight,
  Loader,
  Edit2,
  Eye
} from 'lucide-react';

const Users: React.FC = () => {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchUsers = async (role?: string, status?: string) => {
    setLoading(true);
    try {
      let query = `{
        getUsers {
          id
          fullname
          username
          email
          position
          role
          status
          created_at
          updated_at
        }
      }`;
      
      const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      if (data.errors) {
        setError(data.errors[0].message);
        setProfiles([]);
      } else {
        let users = data.data.getUsers || [];
        
        // Client-side filtering based on role and status
        if (role && role !== 'all') {
          users = users.filter((u: any) => u.role === parseInt(role));
        }
        
        if (status && status !== 'all') {
          users = users.filter((u: any) => u.status === parseInt(status));
        }
        
        if (searchQuery) {
          users = users.filter((u: any) => 
            u.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchQuery.toLowerCase())
          ) || [];
        }
        
        setProfiles(users);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(roleFilter, statusFilter);
  }, [roleFilter, statusFilter, searchQuery]);

  const getRoleInfo = (role: number) => {
    switch (role) {
      case 1: return { name: 'Administrator', access: 'Full Access' };
      case 0: return { name: 'User', access: 'Standard Access' };
      case -1: return { name: 'Personnel', access: 'N/A' };
      default: return { name: 'Unknown', access: 'N/A' };
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 1: return { text: 'Active', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
      case 0: return { text: 'Inactive', className: 'bg-slate-500/10 text-dark-muted border-dark-border' };
      case -1: return { text: 'Suspended', className: 'bg-red-500/10 text-red-500 border-red-500/20' };
      default: return { text: 'Unknown', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 1: return 'bg-gradient-to-br from-orange-600 to-purple-600';
      case 0: return 'bg-gradient-to-br from-blue-600 to-blue-400';
      case -1: return 'bg-gradient-to-br from-slate-600 to-slate-400';
      default: return 'bg-gradient-to-br from-gray-600 to-gray-400';
    }
  };
  
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const totalUsers = profiles.length;
  const activeUsers = profiles.filter(p => p.status === 1).length;
  const adminUsers = profiles.filter(p => p.role === 1).length;
  const inactiveUsers = profiles.filter(p => p.status !== 1).length;

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-dark-muted">
          <span className="hover:text-white transition-colors cursor-pointer">System</span>
          <ChevronRight size={14} />
          <span className="text-white font-medium">User Management</span>
        </nav>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-dark-border bg-dark-surface hover:bg-slate-700 text-dark-muted hover:text-white text-sm font-medium transition-all">
            <Download size={16} />
            Export
          </button>
          <Link to="/users/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all font-medium whitespace-nowrap">
            <Plus size={20} />
            <span>User</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-white text-3xl font-bold tracking-tight">Users & Roles</h1>
        <p className="text-dark-muted text-base max-w-3xl">Manage user access levels, departmental assignments, and account statuses across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><UsersIcon size={24} /></div>
            <div>
              <p className="text-dark-muted text-xs uppercase font-semibold tracking-wider">Total Users</p>
              <p className="text-white text-2xl font-bold">{loading ? '...' : totalUsers}</p>
            </div>
          </div>
          <div className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle size={24} /></div>
            <div>
              <p className="text-dark-muted text-xs uppercase font-semibold tracking-wider">Active Users</p>
              <p className="text-white text-2xl font-bold">{loading ? '...' : activeUsers}</p>
            </div>
          </div>
          <div className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500"><Shield size={24} /></div>
            <div>
              <p className="text-dark-muted text-xs uppercase font-semibold tracking-wider">Admins</p>
              <p className="text-white text-2xl font-bold">{loading ? '...' : adminUsers}</p>
            </div>
          </div>
          <div className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500"><UserX size={24} /></div>
            <div>
              <p className="text-dark-muted text-xs uppercase font-semibold tracking-wider">Inactive</p>
              <p className="text-white text-2xl font-bold">{loading ? '...' : inactiveUsers}</p>
            </div>
          </div>
      </div>

      <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-primary placeholder:text-slate-600 transition-all" 
            placeholder="Search by name, email or ID..." 
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-dark-bg border border-dark-border text-white text-sm rounded-lg pl-3 pr-8 py-2.5 focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="1">Administrator</option>
            <option value="0">User</option>
            <option value="-1">Personnel</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-bg border border-dark-border text-white text-sm rounded-lg pl-3 pr-8 py-2.5 focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
            <option value="-1">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary" size={40} /></div>
          ) : error ? (
            <div className="text-red-500 p-6">Error: {error}</div>
          ) : (
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-dark-bg/50 border-b border-dark-border text-dark-muted uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded bg-slate-900 border-dark-border" /></th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded bg-slate-900 border-dark-border" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full ${getRoleColor(p.role)} flex items-center justify-center text-white font-bold text-xs`}>
                        {getInitials(p.fullname)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{p.fullname}</p>
                        <p className="text-dark-muted text-xs">{p.username ? "@"+p.username : '<No Username>'} | {p.email || '<No Email>'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white text-sm">{getRoleInfo(p.role).name}</span>
                      <span className="text-dark-muted text-xs">{getRoleInfo(p.role).access}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-muted font-mono text-xs">{new Date(p.updated_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusInfo(p.status).className}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${p.status === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                      {getStatusInfo(p.status).text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link to={`/users/view/${p.id}`} className="text-dark-muted hover:text-blue-400 p-1.5 rounded-md"><Eye size={16} /></Link>
                      <Link to={`/users/edit/${p.id}`} className="text-dark-muted hover:text-white p-1.5 rounded-md"><Edit2 size={16} /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
