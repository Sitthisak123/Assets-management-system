
import React, { useState, useEffect } from 'react';
import { Material as MaterialType } from '../types';
import { Search, Filter, Plus, Edit2, MoreVertical, Download, Printer, Box, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('material')
        .select('*, material_type(title)');
      if (error) {
        setError(error.message);
      } else if (data) {
        setMaterials(data as any);
      }
      setLoading(false);
    };
    
    fetchMaterials();
  }, []);

  const getStatusInfo = (quantity: number) => {
    if (quantity === 0) return { text: 'Out of Stock', className: 'bg-red-500/10 text-red-400' };
    if (quantity < 20) return { text: 'Low Stock', className: 'bg-orange-500/10 text-orange-400' };
    return { text: 'In Stock', className: 'bg-emerald-500/10 text-emerald-400' };
  };

  const totalSKUs = materials.length;
  const lowStockCount = materials.filter(m => m.quantity > 0 && m.quantity < 20).length;
  // Assuming no price field in the schema to calculate total value for now.
  const totalValue = 'N/A';

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-dark-border/50">
        <div className="flex flex-col gap-2">
          <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">Material Directory</h2>
          <p className="text-dark-muted text-base font-normal max-w-2xl">View and manage inventory items, stock levels, and procurement needs across all departments.</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark transition-all h-11 px-6 text-white text-sm font-bold shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
          <Plus size={18} />
          <span>New Material</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="group flex flex-col gap-3 rounded-xl p-6 border border-dark-border bg-dark-surface hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-dark-muted text-sm font-medium uppercase tracking-wider">Total SKUs</p>
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-blue-500"><Box size={20} /></div>
            </div>
            <p className="text-white text-3xl font-bold tracking-tight">{loading ? '...' : totalSKUs}</p>
        </div>
        <div className="group flex flex-col gap-3 rounded-xl p-6 border border-dark-border bg-dark-surface hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-dark-muted text-sm font-medium uppercase tracking-wider">Low Stock Alerts</p>
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-orange-500"><Box size={20} /></div>
            </div>
            <p className="text-white text-3xl font-bold tracking-tight">{loading ? '...' : lowStockCount}</p>
        </div>
        <div className="group flex flex-col gap-3 rounded-xl p-6 border border-dark-border bg-dark-surface hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-dark-muted text-sm font-medium uppercase tracking-wider">Total Value</p>
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-500"><Box size={20} /></div>
            </div>
            <p className="text-white text-3xl font-bold tracking-tight">{loading ? '...' : totalValue}</p>
        </div>
      </div>

      <div className="bg-dark-surface rounded-xl border border-dark-border overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row justify-between gap-4 p-5 border-b border-dark-border">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={18} />
              <input 
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-900 border border-dark-border text-white placeholder-dark-muted focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all" 
                placeholder="Search by SKU or Name..." 
              />
            </div>
            <button className="flex items-center justify-center h-11 w-11 rounded-lg border border-dark-border bg-slate-900 text-dark-muted hover:text-white transition-colors">
              <Filter size={18} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-11 px-4 rounded-lg border border-dark-border bg-slate-900 text-dark-muted text-sm font-medium hover:text-white transition-colors">
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button className="flex items-center gap-2 h-11 px-4 rounded-lg border border-dark-border bg-slate-900 text-dark-muted text-sm font-medium hover:text-white transition-colors">
              <Printer size={18} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary" size={40} /></div>
          ) : error ? (
            <div className="text-red-500 p-6">Error: {error}</div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30 border-b border-dark-border">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-dark-muted w-14">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-900 text-primary h-4 w-4" />
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-dark-muted">Item Details</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-dark-muted">Category</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-dark-muted text-right">Qty</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-dark-muted">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-dark-muted w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {materials.map((m) => (
                <tr key={m.id} className="group hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6">
                    <input type="checkbox" className="rounded border-slate-600 bg-slate-900 text-primary h-4 w-4" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-lg bg-slate-800 flex items-center justify-center text-dark-muted">
                        <Box size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-semibold group-hover:text-primary transition-colors cursor-pointer">{m.title}</span>
                        <span className="text-slate-500 text-xs font-mono">SKU-{m.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">{m.material_type.title}</span>
                  </td>
                  <td className="py-4 px-6 text-right text-slate-200 text-sm font-medium">{m.quantity} {m.unit}</td>
                  <td className="py-4 px-6">
                     <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full w-fit border ${getStatusInfo(m.quantity).className.replace('bg-', 'border-')}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${getStatusInfo(m.quantity).className.replace('text-', 'bg-')}`}></div>
                      <span className={`${getStatusInfo(m.quantity).className.split(' ')[1]}`}>{getStatusInfo(m.quantity).text}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-dark-muted hover:text-white p-1.5 rounded-md transition-colors"><Edit2 size={16} /></button>
                      <button className="text-dark-muted hover:text-white p-1.5 rounded-md transition-colors"><MoreVertical size={16} /></button>
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

export default Materials;
