
import React from 'react';
/* Added FileCheck to the lucide-react imports */
import { Search, Filter, Plus, Edit2, Eye, ChevronRight, Hash, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Requisitions: React.FC = () => {
  const requisitions = [
    { id: 'REQ-001', date: 'Oct 24, 2023', user: 'John Doe', dept: 'Engineering', items: '5 items', cost: '$1,200.00', status: 'Pending', color: 'indigo' },
    { id: 'REQ-002', date: 'Oct 23, 2023', user: 'Jane Smith', dept: 'HR', items: '12 items', cost: '$450.00', status: 'Approved', color: 'pink' },
    { id: 'REQ-003', date: 'Oct 22, 2023', user: 'Mike Ross', dept: 'Sales', items: '2 items', cost: '$80.00', status: 'Rejected', color: 'green' },
    { id: 'REQ-004', date: 'Oct 21, 2023', user: 'Rachel Green', dept: 'Marketing', items: '8 items', cost: '$2,100.00', status: 'Pending', color: 'orange' },
    { id: 'REQ-005', date: 'Oct 20, 2023', user: 'Monica Geller', dept: 'Culinary', items: '15 items', cost: '$3,500.00', status: 'Approved', color: 'yellow' },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-10 flex items-center justify-center bg-primary/20 rounded-lg text-primary ring-1 ring-primary/20">
            <FileCheck size={24} />
          </div>
          <h2 className="text-white text-2xl font-bold leading-tight tracking-tight">Material Requisition Forms</h2>
        </div>
        <Link to="/requisitions/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all font-semibold">
          <Plus size={20} />
          <span>New Requisition</span>
        </Link>
      </header>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            className="w-full bg-slate-900 border border-dark-border text-white text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 h-10 placeholder:text-dark-muted transition-all" 
            placeholder="Search by ID, Requester or Dept" 
          />
        </div>
        <button className="flex items-center gap-2 px-4 h-10 bg-slate-900 border border-dark-border rounded-lg text-sm text-dark-muted hover:text-white transition-colors">
          <Filter size={18} />
          <span>Filter Status</span>
        </button>
      </div>

      <div className="bg-dark-surface rounded-xl border border-dark-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-dark-border">
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider w-32">ID</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Requester</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-right text-dark-muted text-xs font-semibold uppercase tracking-wider">Total Cost</th>
                <th className="px-6 py-4 text-center text-dark-muted text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-dark-muted text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {requisitions.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-white text-sm font-medium tracking-wide">{req.id}</td>
                  <td className="px-6 py-4 text-dark-muted text-sm">{req.date}</td>
                  <td className="px-6 py-4 text-white text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600`}></div>
                      <div className="font-medium">{req.user}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-muted text-sm">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full bg-${req.color}-400`}></span>
                      {req.dept}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-dark-muted text-sm">{req.items}</td>
                  <td className="px-6 py-4 text-right text-white text-sm font-medium tabular-nums">{req.cost}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      req.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="text-dark-muted hover:text-white p-1.5 rounded-md"><Edit2 size={16} /></button>
                      <button className="text-dark-muted hover:text-white p-1.5 rounded-md"><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-dark-border px-6 py-4 flex items-center justify-between bg-dark-bg/30">
          <p className="text-sm text-dark-muted">Showing <span className="text-white font-medium">1-5</span> of <span className="text-white font-medium">42</span> results</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded border border-dark-border text-dark-muted hover:text-white disabled:opacity-50 transition-colors" disabled>
              <ChevronRight className="rotate-180" size={16} />
            </button>
            <button className="px-3 py-1.5 rounded bg-primary text-white text-sm font-bold">1</button>
            <button className="px-3 py-1.5 rounded border border-dark-border text-dark-muted text-sm hover:text-white transition-colors">2</button>
            <button className="p-2 rounded border border-dark-border text-dark-muted hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requisitions;
