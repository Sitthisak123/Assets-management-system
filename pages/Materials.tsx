import React, { useEffect, useMemo, useState } from 'react';
import { materialService, Material } from '../src/services/materialService';
import { 
  Search, 
  Plus, 
  Tags,
  Edit2, 
  ChevronRight, 
  Box,
  Loader,
  Filter,
  X,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

type StockFilterValue = 'all' | 'in' | 'low' | 'out';

type MaterialFilters = {
  typeId: string;
  stock: StockFilterValue;
  unit: string;
  minQty: string;
  maxQty: string;
};

const defaultMaterialFilters: MaterialFilters = {
  typeId: 'all',
  stock: 'all',
  unit: 'all',
  minQty: '',
  maxQty: '',
};

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<MaterialFilters>(defaultMaterialFilters);
  const [draftFilters, setDraftFilters] = useState<MaterialFilters>(defaultMaterialFilters);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddQtyModalOpen, setIsAddQtyModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [addQtyValue, setAddQtyValue] = useState<number | ''>('');
  const [addQtyError, setAddQtyError] = useState<string | null>(null);
  const [isAddQtyLoading, setIsAddQtyLoading] = useState(false);
  const [isAddQtySubmitting, setIsAddQtySubmitting] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.getMaterials();
      setMaterials(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const getStockLevel = (quantity: number, minimumThreshold: number = 20): StockFilterValue => {
    if (quantity === 0) return 'out';
    if (quantity <= minimumThreshold) return 'low';
    return 'in';
  };

  const getStatusInfo = (quantity: number, minimumThreshold: number = 20) => {
    const stockLevel = getStockLevel(quantity, minimumThreshold);
    switch (stockLevel) {
      case 'out':
        return { text: 'Out of Stock', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 'low':
        return { text: 'Low Stock', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
      case 'in':
      default:
        return { text: 'In Stock', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
  };

  const materialTypeOptions = useMemo(() => {
    const typeMap = new Map<number, string>();

    materials.forEach((item) => {
      const resolvedId = Number(item.material_type?.id ?? item.material_type_id);
      if (!Number.isFinite(resolvedId)) return;
      const resolvedTitle = item.material_type?.title?.trim() || `Type #${resolvedId}`;
      typeMap.set(resolvedId, resolvedTitle);
    });

    return Array.from(typeMap.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [materials]);

  const unitOptions = useMemo(() => {
    const unitMap = new Map<string, string>();

    materials.forEach((item) => {
      const cleanedUnit = (item.unit || '').trim();
      if (!cleanedUnit) return;
      const unitKey = cleanedUnit.toLowerCase();
      if (!unitMap.has(unitKey)) unitMap.set(unitKey, cleanedUnit);
    });

    return Array.from(unitMap.values()).sort((a, b) => a.localeCompare(b));
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const minQty = filters.minQty === '' ? null : Number(filters.minQty);
    const maxQty = filters.maxQty === '' ? null : Number(filters.maxQty);

    return materials.filter((material) => {
      if (normalizedSearch) {
        const searchText = [
          material.title,
          material.material_type?.title,
          material.unit,
          `sku-${material.id}`,
          `${material.id}`,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchText.includes(normalizedSearch)) return false;
      }

      if (filters.typeId !== 'all') {
        const selectedTypeId = Number(filters.typeId);
        const materialTypeId = Number(material.material_type?.id ?? material.material_type_id);
        if (!Number.isFinite(materialTypeId) || materialTypeId !== selectedTypeId) return false;
      }

      if (filters.stock !== 'all') {
        const materialStock = getStockLevel(material.quantity, material.minimum_threshold || 20);
        if (materialStock !== filters.stock) return false;
      }

      if (filters.unit !== 'all') {
        const materialUnit = (material.unit || '').trim().toLowerCase();
        if (materialUnit !== filters.unit.toLowerCase()) return false;
      }

      if (Number.isFinite(minQty) && minQty !== null && material.quantity < minQty) return false;
      if (Number.isFinite(maxQty) && maxQty !== null && material.quantity > maxQty) return false;

      return true;
    });
  }, [filters, materials, searchQuery]);

  const totalSKUs = filteredMaterials.length;
  const lowStockCount = filteredMaterials.filter((m) => {
    return m.quantity > 0 && m.quantity <= (m.minimum_threshold || 20);
  }).length;
  const outOfStock = filteredMaterials.filter((m) => m.quantity === 0).length;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.typeId !== 'all') count += 1;
    if (filters.stock !== 'all') count += 1;
    if (filters.unit !== 'all') count += 1;
    if (filters.minQty !== '') count += 1;
    if (filters.maxQty !== '') count += 1;
    return count;
  }, [filters]);

  const openFilterModal = () => {
    setDraftFilters(filters);
    setIsFilterModalOpen(true);
  };

  const clearAllFilters = () => {
    setFilters(defaultMaterialFilters);
    setDraftFilters(defaultMaterialFilters);
  };

  const applyFilters = () => {
    const nextFilters = { ...draftFilters };
    const minQty = nextFilters.minQty === '' ? null : Number(nextFilters.minQty);
    const maxQty = nextFilters.maxQty === '' ? null : Number(nextFilters.maxQty);

    if (Number.isFinite(minQty) && Number.isFinite(maxQty) && minQty !== null && maxQty !== null && minQty > maxQty) {
      nextFilters.minQty = String(maxQty);
      nextFilters.maxQty = String(minQty);
    }

    setFilters(nextFilters);
    setIsFilterModalOpen(false);
  };

  const closeAddQtyModal = () => {
    if (isAddQtySubmitting) return;
    setIsAddQtyModalOpen(false);
    setSelectedMaterial(null);
    setAddQtyValue('');
    setAddQtyError(null);
    setIsAddQtyLoading(false);
  };

  const openAddQtyModal = async (material: Material) => {
    setSuccessMessage(null);
    setSelectedMaterial(material);
    setAddQtyValue('');
    setAddQtyError(null);
    setIsAddQtyModalOpen(true);
    setIsAddQtyLoading(true);

    try {
      const response = await materialService.getMaterialById(material.id);
      const latestMaterial = response.data;
      setSelectedMaterial({
        ...material,
        ...latestMaterial,
        material_type: latestMaterial.material_type ?? material.material_type,
      });
    } catch (err: any) {
      setAddQtyError(err.response?.data?.message || err.message || 'Failed to load latest material data.');
    } finally {
      setIsAddQtyLoading(false);
    }
  };

  const handleAddQtySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) {
      setAddQtyError('Material not found.');
      return;
    }

    const parsedAddValue = Number(addQtyValue);
    if (!Number.isInteger(parsedAddValue) || parsedAddValue <= 0) {
      setAddQtyError('Add value must be a positive integer.');
      return;
    }

    setIsAddQtySubmitting(true);
    setAddQtyError(null);

    try {
      const response = await materialService.addMaterialQty(selectedMaterial.id, {
        add_value: parsedAddValue,
      });
      const payload = response.data;

      setMaterials((current) =>
        current.map((item) =>
          item.id === payload.material.id
            ? {
                ...item,
                ...payload.material,
                material_type: payload.material.material_type ?? item.material_type,
              }
            : item
        )
      );

      setSuccessMessage(
        `${payload.material.title}: ${payload.last_value} + ${payload.add_value} = ${payload.new_value}${payload.material.unit ? ` ${payload.material.unit}` : ''}`
      );
      setIsAddQtyModalOpen(false);
      setSelectedMaterial(null);
      setAddQtyValue('');
      setAddQtyError(null);
    } catch (err: any) {
      setAddQtyError(err.response?.data?.message || err.message || 'Failed to add quantity.');
    } finally {
      setIsAddQtySubmitting(false);
    }
  };

  const addQtyPreview = useMemo(() => {
    if (!selectedMaterial) return null;
    const parsedAddValue = Number(addQtyValue);
    if (!Number.isFinite(parsedAddValue) || parsedAddValue <= 0) {
      return selectedMaterial.quantity;
    }
    return selectedMaterial.quantity + parsedAddValue;
  }, [addQtyValue, selectedMaterial]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <Breadcrumb />
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/materials/types" className="flex items-center justify-center gap-2 bg-dark-surface border border-dark-border hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg transition-all font-medium whitespace-nowrap">
            <Tags size={18} />
            <span>Material Type</span>
          </Link>
          <Link to="/materials/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all font-medium whitespace-nowrap">
            <Plus size={20} />
            <span>Material</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Material Directory</h2>
        <p className="text-dark-muted text-sm max-w-2xl">Manage your inventory items, stock levels, and procurement needs efficiently.</p>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-lg p-3 flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
            +
          </span>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Box className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-dark-muted">Total SKUs</p>
            <p className="text-2xl font-bold text-white">{loading ? '...' : totalSKUs}</p>
          </div>
        </div>
        <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Box className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-dark-muted">Low Stock</p>
            <p className="text-2xl font-bold text-white">{loading ? '...' : lowStockCount}</p>
          </div>
        </div>
        <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Box className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-dark-muted">Out of Stock</p>
            <p className="text-2xl font-bold text-white">{loading ? '...' : outOfStock}</p>
          </div>
        </div>
      </div>

      <div className="bg-dark-surface p-4 rounded-xl shadow-sm border border-dark-border flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 backdrop-blur-xl bg-dark-surface/95">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={20} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-dark-border text-white text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 py-2.5 placeholder:text-dark-muted transition-all" 
            placeholder="Search by name, SKU, or category..." 
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={openFilterModal}
            type="button"
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-dark-border rounded-lg hover:border-primary/50 transition-all text-sm font-medium text-slate-300"
          >
            <Filter size={16} />
            <span>{activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}</span>
            <ChevronRight size={14} className="rotate-90" />
          </button>
          {(activeFilterCount > 0 || searchQuery.trim()) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                clearAllFilters();
              }}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-dark-border rounded-lg hover:border-primary/50 transition-all text-sm font-medium text-slate-300"
            >
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
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
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Material</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Category</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider text-right">Quantity</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Unit</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 px-6 text-center text-dark-muted">
                      No materials match your current search/filter.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-4 px-6 text-sm text-dark-muted font-mono">{material.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-dark-muted">
                            <Box size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-white">{material.title}</div>
                            <div className="text-xs text-dark-muted">SKU-{material.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {material.material_type?.title || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="text-sm text-slate-300 font-medium">{material.quantity}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-white">{material.unit}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusInfo(material.quantity, material.minimum_threshold || 20).className}`}>
                          {getStatusInfo(material.quantity, material.minimum_threshold || 20).text}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                          <button
                            type="button"
                            onClick={() => openAddQtyModal(material)}
                            className="p-1.5 text-dark-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                            title="Add quantity"
                          >
                            <Plus size={18} />
                          </button>
                          <Link to={`/materials/edit/${material.id}`} className="p-1.5 text-dark-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"><Edit2 size={18} /></Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-dark-surface px-6 py-4 border-t border-dark-border flex items-center justify-between">
          <p className="text-sm text-dark-muted">
            Showing{' '}
            <span className="font-medium text-white">{filteredMaterials.length}</span>
            {' '}of{' '}
            <span className="font-medium text-white">{materials.length}</span>
            {' '}results
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg border border-dark-border text-sm font-medium text-dark-muted hover:bg-slate-800 disabled:opacity-50 transition-colors" disabled>Previous</button>
            <button className="px-4 py-2 rounded-lg border border-dark-border text-sm font-medium text-dark-muted hover:bg-slate-800 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-xl bg-dark-surface border border-dark-border shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <h3 className="text-white text-lg font-semibold">Inventory Filters</h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-md text-dark-muted hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close filter modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-dark-muted">Material Type</label>
                <select
                  value={draftFilters.typeId}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, typeId: e.target.value }))}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                >
                  <option value="all">All Types</option>
                  {materialTypeOptions.map((option) => (
                    <option key={option.id} value={String(option.id)}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-dark-muted">Stock Status</label>
                <select
                  value={draftFilters.stock}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, stock: e.target.value as StockFilterValue }))}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="in">In Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-dark-muted">Unit</label>
                <select
                  value={draftFilters.unit}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, unit: e.target.value }))}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                >
                  <option value="all">All Units</option>
                  {unitOptions.map((unitValue) => (
                    <option key={unitValue} value={unitValue}>
                      {unitValue}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-dark-muted">Min Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={draftFilters.minQty}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, minQty: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-dark-muted">Max Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={draftFilters.maxQty}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, maxQty: e.target.value }))}
                    placeholder="999"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-dark-border bg-dark-bg/40 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDraftFilters(defaultMaterialFilters)}
                className="px-4 py-2 rounded-lg border border-dark-border text-dark-muted hover:text-white hover:bg-slate-800 transition-colors text-sm"
              >
                Clear
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-dark-border text-dark-muted hover:text-white hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddQtyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-xl bg-dark-surface border border-dark-border shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <div>
                <h3 className="text-white text-lg font-semibold">Add QTY.</h3>
                <p className="text-xs text-dark-muted mt-1">Increase quantity for a material item using the dedicated API.</p>
              </div>
              <button
                type="button"
                onClick={closeAddQtyModal}
                disabled={isAddQtySubmitting}
                className="p-1.5 rounded-md text-dark-muted hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                aria-label="Close add quantity modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {isAddQtyLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader className="animate-spin text-primary" size={36} />
                </div>
              ) : !selectedMaterial ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  Unable to load material details.
                </div>
              ) : (
                <form onSubmit={handleAddQtySubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-dark-border bg-dark-bg/70 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-dark-muted">Item Name</p>
                      <p className="text-sm font-medium text-white mt-1">{selectedMaterial.title}</p>
                      <p className="text-[11px] text-dark-muted mt-1">SKU-{selectedMaterial.id}</p>
                    </div>
                    <div className="rounded-lg border border-dark-border bg-dark-bg/70 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-dark-muted">Material Type</p>
                      <p className="text-sm font-medium text-white mt-1">{selectedMaterial.material_type?.title || `Type #${selectedMaterial.material_type_id}`}</p>
                      <p className="text-[11px] text-dark-muted mt-1">{selectedMaterial.unit}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-blue-300/80">Last Value</p>
                      <p className="text-2xl font-bold text-white mt-1">{selectedMaterial.quantity}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-emerald-300/80">Add Value</p>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={addQtyValue}
                        onChange={(e) => {
                          setAddQtyValue(e.target.value === '' ? '' : Number(e.target.value));
                          if (addQtyError) setAddQtyError(null);
                        }}
                        className="mt-2 w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="0"
                      />
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-primary/80">New Value</p>
                      <p className="text-2xl font-bold text-white mt-1">{addQtyPreview ?? '-'}</p>
                    </div>
                  </div>

                  {addQtyError && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{addQtyError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeAddQtyModal}
                      disabled={isAddQtySubmitting}
                      className="px-4 py-2 rounded-lg border border-dark-border text-dark-muted hover:text-white hover:bg-slate-800 transition-colors text-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddQtySubmitting || !selectedMaterial}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isAddQtySubmitting ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                      <span>{isAddQtySubmitting ? 'Updating...' : 'Add Quantity'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
