import React, { useState, useEffect } from 'react';
import { personnelService } from '../src/services/personnelService';
import { materialService } from '../src/services/materialService';
import { requisitionService } from '../src/services/requisitionService';
import { Personnel, Material, MrForm, MrFormMaterial } from '../types';
import { Info, ShoppingCart, UploadCloud, Trash2, PlusCircle, ArrowRight, ChevronRight, Loader, AlertCircle, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const EditRequisition: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<MrForm | null>(null);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [items, setItems] = useState<{ id?:number, material_id: number | null, quantity: number }[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const personnelRes = await personnelService.getPersonnel();
        setPersonnel(personnelRes.data);

        const materialsRes = await materialService.getMaterials();
        setMaterials(materialsRes.data);

        if (id) {
          const formRes = await requisitionService.getRequisitionById(id);
          const formData = formRes.data;
          setForm(formData);
          setSubject(formData.subject);
          setDate(new Date(formData.form_date).toISOString().split('T')[0]);
          setOwnerId(formData.owner_id);
          setItems(formData.mr_form_materials || []);
        }
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const addItem = () => {
    setItems([...items, { material_id: null, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index: number, field: 'material_id' | 'quantity', value: any) => {
    const newItems = [...items];
    if(field === 'material_id') {
      newItems[index][field] = value ? parseInt(value, 10) : null;
    } else {
       newItems[index][field] = parseInt(value, 10);
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!id) return;

    setLoading(true);
    setError(null);

    const requisitionData = {
      subject,
      form_date: date,
      owner_id: ownerId,
      items: items.map(item => ({
        material_id: item.material_id,
        quantity: item.quantity,
      })),
    };

    try {
      await requisitionService.updateRequisition(id, requisitionData);
      navigate('/requisitions');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary" size={40} /></div>
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-sm text-dark-muted">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
          <ChevronRight size={14} />
          <button onClick={() => navigate('/requisitions')} className="hover:text-primary transition-colors">Requisitions</button>
          <span className="mx-2">/</span>
          <span className="text-white font-medium">Edit REQ-{id}</span>
        </nav>
        <h2 className="text-3xl font-bold text-white tracking-tight">Edit Material Requisition</h2>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
         {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3">
              <AlertCircle size={20} /><span>{error}</span>
            </div>
          )}
        <div className="bg-dark-surface rounded-xl border border-dark-border shadow-sm overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Subject / Purpose</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} required className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Date Required</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Owner</label>
              <select value={ownerId ?? ''} onChange={e => setOwnerId(parseInt(e.target.value, 10))} required className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white">
                <option value="">Select an owner</option>
                {personnel.map(p => (
                  <option key={p.id} value={p.id}>{p.fullname}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-dark-surface rounded-xl border border-dark-border shadow-sm overflow-hidden">
           <h3 className="text-lg font-semibold text-white p-4">Material Details</h3>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[50%]">Item Name</th>
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[20%]">Qty</th>
                  <th className="pb-3 w-[10%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {items.map((item, index) => (
                  <tr key={index} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4">
                      <select 
                        value={item.material_id ?? ''} 
                        onChange={(e) => updateItem(index, 'material_id', e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
                      >
                         <option value="">Select a material</option>
                         {materials.map(m => (
                           <option key={m.id} value={m.id}>{m.title}</option>
                         ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
                       />
                    </td>
                    <td className="py-3 text-center">
                      <button type="button" onClick={() => removeItem(index)} className="text-dark-muted hover:text-red-400 p-1.5 rounded-md"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addItem} className="w-full mt-4 py-3 rounded-lg border border-dashed border-slate-700 text-dark-muted hover:text-primary hover:border-primary/50 flex items-center justify-center gap-2 transition-all">
              <PlusCircle size={18} />
              <span className="text-sm font-medium">Add New Item</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate('/requisitions')} className="px-6 py-3 text-sm font-medium text-dark-muted hover:text-white transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50">
            {loading ? <><Loader size={18} className="animate-spin" /><span>Saving...</span></> : <><span>Save Changes</span><Save size={18} /></>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRequisition;
