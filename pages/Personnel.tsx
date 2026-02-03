
import React, { useState, useEffect } from 'react';
import { Personnel as PersonnelType } from '../types';
import { 
  Search, 
  Plus, 
  Edit2, 
  Archive, 
  List, 
  Grid as GridIcon, 
  ChevronRight, 
  Users,
  Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Personnel: React.FC = () => {
  const [personnel, setPersonnel] = useState<PersonnelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonnel = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('personnel')
        .select(`
          id,
          fullname,
          position,
          created_at,
          profiles (
            id,
            username,
            title,
            role,
            status
          )
        `);

      if (error) {
        setError(error.message);
        setPersonnel([]);
      } else if (data) {
        // The result from a join is an array, but we expect a single profile.
        const formattedData = data.map(p => ({
          ...p,
          profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
        }));
        setPersonnel(formattedData as any);
      }
      setLoading(false);
    };

    fetchPersonnel();
  }, []);

  const getStatusInfo = (status: number | undefined) => {
    switch (status) {
      case 1: return { text: 'Active', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 0: return { text: 'Inactive', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
      case -1: return { text: 'Suspended', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default: return { text: 'Unknown', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };
  
  const handleDelete = async (personnelId: number) => {
    if (window.confirm('Are you sure you want to delete this personnel?')) {
      const { error } = await supabase
        .from('personnel')
        .delete()
        .eq('id', personnelId);

      if (error) {
        setError(error.message);
      } else {
        setPersonnel(personnel.filter(p => p.id !== personnelId));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <nav className="flex items-center text-sm font-medium">
          <Link to="/" className="text-dark-muted hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={16} className="text-slate-400 mx-2" />
          <span className="text-white bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded text-xs tracking-wide uppercase">Personnel</span>
        </nav>
        <Link to="/personnel/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all font-medium whitespace-nowrap">
          <Plus size={20} />
          <span>Add Employee</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Personnel Directory</h2>
        <p className="text-dark-muted text-sm max-w-2xl">Manage your organization's talent pool, track roles, and handle access requests efficiently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-dark-muted">Total Employees</p>
              <p className="text-2xl font-bold text-white">{loading ? '...' : "totalEmployees"}</p>
            </div>
          </div>
          <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Users className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-dark-muted">Active Now</p>
              <p className="text-2xl font-bold text-white">{loading ? '...' : "activeEmployees"}</p>
            </div>
          </div>
          <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Users className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-dark-muted">On Leave</p>
              <p className="text-2xl font-bold text-white">{loading ? '...' : "onLeaveEmployees"}</p>
            </div>
          </div>
      </div>

      <div className="bg-dark-surface p-4 rounded-xl shadow-sm border border-dark-border flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 backdrop-blur-xl bg-dark-surface/95">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={20} />
          <input 
            className="w-full bg-slate-900/50 border border-dark-border text-white text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 py-2.5 placeholder:text-dark-muted transition-all" 
            placeholder="Search by name, role, or ID..." 
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-dark-border rounded-lg hover:border-primary/50 transition-all text-sm font-medium text-slate-300">
            <span>Department</span>
            <ChevronRight size={14} className="rotate-90" />
          </button>
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-dark-border">
            <button className="p-1.5 bg-white dark:bg-slate-700 text-primary shadow-sm rounded-md"><List size={18} /></button>
            <button className="p-1.5 text-dark-muted hover:text-white"><GridIcon size={18} /></button>
          </div>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              Error: {error}
            </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-dark-border">
                <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider w-16">#</th>
                <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Employee</th>
                <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Contact</th>
                <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Role</th>
                <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {personnel.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4 px-6 text-sm text-dark-muted font-mono">{emp.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={emp.profiles?.avatar_url || `https://picsum.photos/seed/${emp.id}/100/100`} className="h-10 w-10 rounded-full object-cover border-2 border-white/10" alt={emp.fullname} />
                      <div>
                        <div className="font-medium text-white">{emp.fullname}</div>
                        <div className="text-xs text-dark-muted">{emp.profiles?.title || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col text-sm">
                      <span className="text-slate-300">{emp.profiles?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-white">{emp.position}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusInfo(emp.profiles?.status).className}`}>
                      {getStatusInfo(emp.profiles?.status).text}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Link to={`/personnel/edit/${emp.id}`} className="p-1.5 text-dark-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"><Edit2 size={18} /></Link>
                      <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-dark-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Archive size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
        <div className="bg-dark-surface px-6 py-4 border-t border-dark-border flex items-center justify-between">
          <p className="text-sm text-dark-muted">Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">{personnel.length}</span> of <span className="font-medium text-white">{personnel.length}</span> results</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg border border-dark-border text-sm font-medium text-dark-muted hover:bg-slate-800 disabled:opacity-50 transition-colors" disabled>Previous</button>
            <button className="px-4 py-2 rounded-lg border border-dark-border text-sm font-medium text-dark-muted hover:bg-slate-800 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personnel;
