
import React, { useState } from 'react';
import { Info, ShoppingCart, UploadCloud, Trash2, PlusCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateRequisition: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([
    { id: 1, name: 'Industrial Lubricant 500ml', sku: 'LUB-IND-500', qty: 12, unit: 'Bottle', cost: 24.50 },
    { id: 2, name: 'Safety Goggles - UV Protection', sku: 'PPE-GOG-UV', qty: 5, unit: 'Pair', cost: 15.00 },
  ]);

  const subtotal = items.reduce((acc, curr) => acc + (curr.qty * curr.cost), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-sm text-dark-muted">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
          <ChevronRight size={14} />
          <button onClick={() => navigate('/requisitions')} className="hover:text-primary transition-colors">Requisitions</button>
          <span className="mx-2">/</span>
          <span className="text-white font-medium">Create New</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Create Material Requisition</h2>
            <p className="text-dark-muted mt-1">Fill in the details below to submit a new request for approval.</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-900 border border-dark-border rounded-lg hover:bg-slate-800 transition-all">
            Save Draft
          </button>
        </div>
      </header>

      <form className="flex flex-col gap-6">
        <div className="bg-dark-surface rounded-xl border border-dark-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border bg-dark-surface/50 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-primary">
              <Info size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">General Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Subject / Purpose</label>
              <input className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Q3 Maintenance Materials for Block A" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Date Required</label>
              <input type="date" className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Department</label>
              <select className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-primary">
                <option>Engineering</option>
                <option>Operations</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-dark-surface rounded-xl border border-dark-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border bg-dark-surface/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <ShoppingCart size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">Material Details</h3>
            </div>
            <button type="button" className="text-sm font-medium text-primary hover:text-blue-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
              <UploadCloud size={18} />
              Import CSV
            </button>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[35%]">Item Name</th>
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[20%]">SKU / Code</th>
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[12%]">Qty</th>
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[15%]">Unit</th>
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[13%]">Est. Cost</th>
                  <th className="pb-3 w-[5%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {items.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4">
                      <input className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white" defaultValue={item.name} />
                    </td>
                    <td className="py-3 pr-4">
                      <input className="w-full bg-transparent border-none text-sm text-dark-muted px-0" readOnly value={item.sku} />
                    </td>
                    <td className="py-3 pr-4">
                      <input type="number" className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white" defaultValue={item.qty} />
                    </td>
                    <td className="py-3 pr-4">
                      <select className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white">
                        <option>{item.unit}</option>
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-dark-muted text-sm">$</span>
                        <input className="w-full bg-dark-bg border border-dark-border rounded-lg pl-6 pr-3 py-2 text-sm text-white" defaultValue={item.cost.toFixed(2)} />
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <button type="button" className="text-dark-muted hover:text-red-400 p-1.5 rounded-md"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button type="button" className="w-full mt-4 py-3 rounded-lg border border-dashed border-slate-700 text-dark-muted hover:text-primary hover:border-primary/50 flex items-center justify-center gap-2 transition-all">
              <PlusCircle size={18} />
              <span className="text-sm font-medium">Add New Item</span>
            </button>

            <div className="mt-8 flex justify-end">
              <div className="w-72 space-y-3">
                <div className="flex justify-between text-sm text-dark-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-dark-muted">
                  <span>Tax (10%)</span>
                  <span className="font-medium text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-dark-border flex justify-between items-end">
                  <span className="text-sm font-medium text-white">Total Estimated Cost</span>
                  <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate('/requisitions')} className="px-6 py-3 text-sm font-medium text-dark-muted hover:text-white transition-colors">
            Cancel
          </button>
          <button type="button" className="px-8 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-all">
            <span>Submit Requisition</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequisition;
