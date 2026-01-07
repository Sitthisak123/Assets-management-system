
import React from 'react';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Shield, 
  UserX, 
  CheckCircle, 
  Download, 
  Users as UsersIcon,
  ChevronRight 
} from 'lucide-react';

const Users: React.FC = () => {
  const users = [
    { name: 'Alex Smith', email: 'alex.smith@company.com', role: 'Administrator', access: 'Full Access', dept: 'IT Operations', status: 'Active', active: 'Just now', initials: 'AS' },
    { name: 'Maria Rodriguez', email: 'm.rodriguez@company.com', role: 'Manager', access: 'Approval Level 2', dept: 'Logistics', status: 'Active', active: '4h ago', initials: 'MR' },
    { name: 'David Johnson', email: 'david.j@company.com', role: 'Viewer', access: 'Read Only', dept: 'Procurement', status: 'Inactive', active: '2d ago', initials: 'DJ' },
    { name: 'Sarah Lee', email: 's.lee@company.com', role: 'Manager', access: 'Approval Level 1', dept: 'Inventory', status: 'Active', active: '1w ago', initials: 'SL' },
  ];

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
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-all shadow-lg">
            <Plus size={16} />
            Add New User
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-white text-3xl font-bold tracking-tight">Users & Roles</h1>
        <p className="text-dark-muted text-base max-w-3xl">Manage user access levels, departmental assignments, and account statuses across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '1,248', icon: <UsersIcon size={24} />, color: 'blue' },
          { label: 'Active Now', value: '854', icon: <CheckCircle size={24} />, color: 'emerald' },
          { label: 'Admins', value: '12', icon: <Shield size={24} />, color: 'purple' },
          { label: 'Inactive', value: '24', icon: <UserX size={24} />, color: 'orange' },
        ].map((s, i) => (
          <div key={i} className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-lg bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-500`}>
              {s.icon}
            </div>
            <div>
              <p className="text-dark-muted text-xs uppercase font-semibold tracking-wider">{s.label}</p>
              <p className="text-white text-2xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            className="w-full bg-dark-bg border border-dark-border text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-primary placeholder:text-slate-600 transition-all" 
            placeholder="Search by name, email or ID..." 
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select className="bg-dark-bg border border-dark-border text-white text-sm rounded-lg pl-3 pr-8 py-2.5 focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
            <option>All Roles</option>
          </select>
          <select className="bg-dark-bg border border-dark-border text-white text-sm rounded-lg pl-3 pr-8 py-2.5 focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
            <option>All Status</option>
          </select>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-dark-bg/50 border-b border-dark-border text-dark-muted uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded bg-slate-900 border-dark-border" /></th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded bg-slate-900 border-dark-border" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        {u.initials}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-dark-muted text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white text-sm">{u.role}</span>
                      <span className="text-dark-muted text-xs">{u.access}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-muted">{u.dept}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-dark-muted border-dark-border'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-dark-muted font-mono text-xs">{u.active}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-slate-800 text-dark-muted hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
