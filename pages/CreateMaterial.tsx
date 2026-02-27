import React, { useState, useEffect } from 'react';
import { 
  Box,
  Save, 
  Plus,
  AlertCircle,
  ChevronDown,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { materialService } from '../src/services/materialService';
import Breadcrumb from '../components/Breadcrumb';

interface MaterialType {
  id: number;
  title: string;
}

const CreateMaterial: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [minimumThreshold, setMinimumThreshold] = useState<number | ''>('');
  const [materialTypeId, setMaterialTypeId] = useState<number | ''>('');
  
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMaterialType, setNewMaterialType] = useState('');

  useEffect(() => {
    const fetchMaterialTypes = async () => {
      try {
        const response = await materialService.getMaterialTypes();
        setMaterialTypes(response.data);
      } catch (err) {
        setError('Failed to fetch material types.');
      }
    };
    fetchMaterialTypes();
  }, []);

  const handleCreateNewType = async () => {
    if (!newMaterialType.trim()) return;
    try {
      const response = await materialService.createMaterialType({ title: newMaterialType });
      setMaterialTypes([...materialTypes, response.data]);
      setMaterialTypeId(response.data.id);
      setIsModalOpen(false);
      setNewMaterialType('');
    } catch (err) {
      setError('Failed to create new material type.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !unit || !materialTypeId) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    setError(null);

    const materialData = {
      title,
      unit,
      quantity: quantity || 0,
      minimum_threshold: minimumThreshold || null,
      material_type_id: materialTypeId,
    };

    try {
      await materialService.createMaterial(materialData);
      navigate('/materials');
    } catch (err: any) {
      setError(err.message || 'Failed to create material.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6">
        <Breadcrumb />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Create Material</h1>
          <p className="text-dark-muted text-base max-w-3xl">Add a new item to the material inventory. Please ensure all required fields marked with <span className="text-primary">*</span> are completed.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 space-y-12">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <Box size={18} />
              </div>
              <h3 className="text-lg font-semibold text-white">Material Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-300">Material Name <span className="text-primary">*</span></label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g. 1/2 inch PVC Pipe" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Material Type <span className="text-primary">*</span></label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <select 
                      value={materialTypeId}
                      onChange={(e) => setMaterialTypeId(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                      className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                    >
                      <option value="">Select a type</option>
                      {materialTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" size={18} />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(true)} 
                    className="px-4 py-2.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Unit of Measurement <span className="text-primary">*</span></label>
                <input 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g. pcs, kg, m" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Initial Quantity</label>
                <input 
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Minimum Threshold</label>
                <input 
                  type="number"
                  value={minimumThreshold}
                  onChange={(e) => setMinimumThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Optional"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="bg-slate-950/50 p-6 md:px-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-dark-border">
          <button 
            type="button" 
            onClick={() => navigate('/materials')}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-dark-muted hover:text-white transition-all rounded-lg"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : <><Save size={18} /><span>Save Material</span></>}
          </button>
        </div>
      </form>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-in fade-in">
          <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-2xl p-8 max-w-sm w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Add New Material Type</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-dark-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Type Name</label>
                <input
                  value={newMaterialType}
                  onChange={(e) => setNewMaterialType(e.target.value)}
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g. Piping, Fasteners"
                />
              </div>
              <button
                onClick={handleCreateNewType}
                className="w-full px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-all"
              >
                Create Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMaterial;
