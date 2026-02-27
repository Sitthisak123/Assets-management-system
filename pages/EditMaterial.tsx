import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box,
  Save, 
  Plus,
  AlertCircle,
  ChevronDown,
  X,
  Loader,
  Trash2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { materialService } from '../src/services/materialService';
import Breadcrumb from '../components/Breadcrumb';

interface MaterialType {
  id: number;
  title: string;
}

const EditMaterial: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Current form values
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [minimumThreshold, setMinimumThreshold] = useState<number | ''>('');
  const [materialTypeId, setMaterialTypeId] = useState<number | ''>('');

  // Original values for change detection
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalUnit, setOriginalUnit] = useState('');
  const [originalQuantity, setOriginalQuantity] = useState<number | ''>('');
  const [originalMinimumThreshold, setOriginalMinimumThreshold] = useState<number | ''>('');
  const [originalMaterialTypeId, setOriginalMaterialTypeId] = useState<number | ''>('');

  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMaterialType, setNewMaterialType] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Track if form has changed
  const hasChanges = useMemo(() => {
    return (
      title !== originalTitle ||
      unit !== originalUnit ||
      quantity !== originalQuantity ||
      minimumThreshold !== originalMinimumThreshold ||
      materialTypeId !== originalMaterialTypeId
    );
  }, [
    title, originalTitle,
    unit, originalUnit,
    quantity, originalQuantity,
    minimumThreshold, originalMinimumThreshold,
    materialTypeId, originalMaterialTypeId
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No material ID provided.");
        setLoading(false);
        return;
      }

      try {
        const [materialResponse, typesResponse] = await Promise.all([
          materialService.getMaterialById(id),
          materialService.getMaterialTypes()
        ]);

        const material = materialResponse.data;
        setMaterialTypes(typesResponse.data);

        // Set current values
        setTitle(material.title);
        setUnit(material.unit);
        setQuantity(material.quantity || '');
        setMinimumThreshold(material.minimum_threshold || '');
        setMaterialTypeId(material.material_type_id || '');

        // Set original values for change detection
        setOriginalTitle(material.title);
        setOriginalUnit(material.unit);
        setOriginalQuantity(material.quantity || '');
        setOriginalMinimumThreshold(material.minimum_threshold || '');
        setOriginalMaterialTypeId(material.material_type_id || '');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch material data.');
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

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

  const toggleDeleteModal = () => {
    setIsDeleteModalOpen(!isDeleteModalOpen);
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    setError(null);

    try {
      await materialService.deleteMaterial(id);
      navigate('/materials');
    } catch (err: any) {
      setError(err.message || 'Failed to delete material.');
      setIsDeleting(false);
      toggleDeleteModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !hasChanges) return;

    setIsSubmitting(true);
    setError(null);

    const materialData = {
      title,
      unit,
      quantity: quantity || 0,
      minimum_threshold: minimumThreshold || null,
      material_type_id: materialTypeId,
    };

    try {
      await materialService.updateMaterial(id, materialData);

      // Update original values after successful save
      setOriginalTitle(title);
      setOriginalUnit(unit);
      setOriginalQuantity(quantity);
      setOriginalMinimumThreshold(minimumThreshold);
      setOriginalMaterialTypeId(materialTypeId);

      navigate('/materials');
    } catch (err: any) {
      setError(err.message || 'Failed to update material.');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-4 flex flex-col items-center gap-3">
          <AlertCircle size={40} />
          <h3 className="text-xl font-bold">Error</h3>
          <span>{error}</span>
          <button 
            onClick={() => navigate('/materials')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
          >
            Back to Materials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6">
        <Breadcrumb />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Edit Material</h1>
          <p className="text-dark-muted text-base max-w-3xl">Update the material information in the inventory. Changes are indicated and can be saved.</p>
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
                <label className="text-sm font-medium text-gray-300">Current Quantity</label>
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

        <div className="bg-slate-950/50 p-6 md:px-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-dark-border">
          <div>
            <button
              type="button"
              onClick={toggleDeleteModal}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 transition-all rounded-lg"
            >
              Delete Material
            </button>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full sm:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/materials')}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-dark-muted hover:text-white transition-all rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !hasChanges}
              title={!hasChanges ? "No changes made" : "Save changes"}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : <><Save size={18} /><span>Save Changes</span></>}
            </button>
          </div>
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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-in fade-in">
          <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-2xl p-8 max-w-md w-full m-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-500/10 rounded-full border-4 border-red-500/20 mb-4">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Confirm Deletion</h2>
              <p className="text-dark-muted mt-2">
                Are you sure you want to delete this material? This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={toggleDeleteModal}
                disabled={isDeleting}
                className="px-6 py-3 text-sm font-medium text-dark-muted hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditMaterial;
