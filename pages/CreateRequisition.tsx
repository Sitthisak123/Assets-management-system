import React, { useState, useEffect, useMemo } from 'react';
import { personnelService } from '../src/services/personnelService';
import { materialService } from '../src/services/materialService';
import { requisitionService } from '../src/services/requisitionService';
import { authService } from '../src/services/authService';
import { Personnel, Material } from '../types';
import { ShoppingCart, Trash2, PlusCircle, ChevronRight, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import DatePicker from '../components/DatePicker';
import MaterialSearchSelect from '../components/MaterialSearchSelect';
import UserSearchSelect from '../components/UserSearchSelect';
import { useLanguage } from '../src/contexts/LanguageContext';

type RequisitionItemRow = { material_id: number | null; quantity: number };

const getTodayDateValue = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const CreateRequisition: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  
  const [items, setItems] = useState<RequisitionItemRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [openMaterialSelectRow, setOpenMaterialSelectRow] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personnelRes = await personnelService.getPersonnel();
        setPersonnel(personnelRes.data);

        const materialsRes = await materialService.getMaterials();
        setMaterials(materialsRes.data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  const allMaterialsSelected = useMemo(() => {
    const selectedIds = new Set(
      items
        .map((item) => item.material_id)
        .filter((materialId): materialId is number => materialId !== null)
    );
    return materials.length > 0 && selectedIds.size >= materials.length;
  }, [items, materials]);

  const selectedOwner = useMemo(() => {
    return personnel.find((entry) => entry.id === ownerId) || null;
  }, [personnel, ownerId]);

  const addItem = () => {
    const selectedMaterialIds = new Set(
      items
        .map((item) => item.material_id)
        .filter((materialId): materialId is number => materialId !== null)
    );

    if (materials.length > 0 && selectedMaterialIds.size >= materials.length) {
      setSelectionError(t('requisitions_error_all_materials_selected'));
      return;
    }

    setSelectionError(null);
    setItems([...items, { material_id: null, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setSelectionError(null);
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index: number, field: 'material_id' | 'quantity', value: any) => {
    setSelectionError(null);
    const newItems = [...items];
    if(field === 'material_id') {
      const nextMaterialId = value ? parseInt(value, 10) : null;
      if (nextMaterialId !== null) {
        const duplicateIndex = newItems.findIndex((item, i) => i !== index && item.material_id === nextMaterialId);
        if (duplicateIndex !== -1) {
          setSelectionError(t('requisitions_error_duplicate_material'));
          return;
        }
      }
      newItems[index][field] = nextMaterialId;
    } else {
      const nextQtyRaw = parseInt(value, 10);
      const stockQty = getMaterialStockQty(newItems[index].material_id);
      let nextQty = Number.isNaN(nextQtyRaw) ? 1 : nextQtyRaw;
      if (nextQty < 1) nextQty = 1;

      if (stockQty !== null && stockQty > 0 && nextQty > stockQty) {
        nextQty = stockQty;
        setSelectionError(`${t('requisitions_error_exceed_stock')} (${stockQty}).`);
      }

      newItems[index][field] = nextQty;
    }
    setItems(newItems);
  };

  const getMaterialStockQty = (materialId: number | null) => {
    if (!materialId) return null;
    const material = materials.find((entry) => entry.id === materialId);
    if (!material) return null;
    const stockQty = Number(material.quantity || 0);
    if (!Number.isFinite(stockQty)) return null;
    return Math.max(0, stockQty);
  };

  const getMaterialAvailability = (materialId: number | null, requestQty: number) => {
    if (!materialId) return null;
    const material = materials.find((entry) => entry.id === materialId);
    if (!material) return null;

    const stockQty = Number(material.quantity || 0);
    const usedQty = Number(requestQty || 0);
    const remainingQty = stockQty - usedQty;

    return {
      stockQty,
      remainingQty,
      unitLabel: material.unit || '',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSelectionError(null);

    if (date && date > getTodayDateValue()) {
      setError(t('requisitions_error_date_future'));
      setLoading(false);
      return;
    }

    const user = authService.getCurrentUser();
    if (!user || !ownerId) {
      setError(t('requisitions_error_owner_required'));
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setSelectionError(t('requisitions_error_item_required'));
      setLoading(false);
      return;
    }
    
    const selectedMaterialIds = items
      .map((item) => item.material_id)
      .filter((materialId): materialId is number => materialId !== null);

    if (new Set(selectedMaterialIds).size !== selectedMaterialIds.length) {
      setSelectionError(t('requisitions_error_duplicate_material'));
      setLoading(false);
      return;
    }

    if (items.some(item => !item.material_id || item.quantity <= 0)) {
      setError(t('requisitions_error_item_invalid'));
      setLoading(false);
      return;
    }

    const exceedsStock = items.some((item) => {
      const stockQty = getMaterialStockQty(item.material_id);
      return stockQty !== null && stockQty > 0 && item.quantity > stockQty;
    });

    if (exceedsStock) {
      setSelectionError(t('requisitions_error_exceed_stock_available'));
      setLoading(false);
      return;
    }

    const requisitionData = {
      subject,
      description,
      purpose,
      form_date: date,
      owner_id: ownerId,
      // The creator_id will be set on the backend from the JWT
      items: items.map(item => ({
        material_id: item.material_id,
        quantity: item.quantity,
      })),
    };

    try {
      await requisitionService.createRequisition(requisitionData);
      navigate('/requisitions');
    } catch (err: any) {
      setError(err.message || t('requisitions_error_create'));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col gap-6">
        <Breadcrumb />
        <h2 className="text-3xl font-bold text-white tracking-tight">{t('requisitions_create_title')}</h2>
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
              <label className="text-sm font-medium text-slate-300">{t('requisitions_label_subject')}</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder={t('requisitions_placeholder_subject')}
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-300">{t('requisitions_label_description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                rows={3}
                placeholder={t('requisitions_placeholder_description')}
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-300">{t('requisitions_label_purpose')}</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                rows={3}
                placeholder={t('requisitions_placeholder_purpose')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">{t('requisitions_label_date_required')}</label>
              <DatePicker
                value={date}
                onChange={setDate}
                max={getTodayDateValue()}
                required
                ariaLabel={t('requisitions_label_date_required')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                {t('requisitions_label_owner')} <span className="text-primary">*</span>
              </label>
              <UserSearchSelect
                users={personnel}
                value={ownerId}
                onSelect={setOwnerId}
                placeholder={t('user_search_placeholder')}
              />
              {selectedOwner && (
                <p className="text-[11px] text-dark-muted">
                  ID-{selectedOwner.id}
                  {selectedOwner.position ? `  |  ${selectedOwner.position}` : ''}
                  {selectedOwner.email ? `  |  ${selectedOwner.email}` : ''}
                  {(selectedOwner.workplace?.building || selectedOwner.workplace?.room)
                    ? `  |  ${[selectedOwner.workplace?.building, selectedOwner.workplace?.room].filter(Boolean).join(' / ')}`
                    : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-dark-surface rounded-xl border border-dark-border shadow-sm overflow-hidden">
          <h3 className="text-lg font-semibold text-white p-4 flex items-center gap-2">
            <ShoppingCart size={20} /> {t('requisitions_material_details')}
          </h3>
          <div className={`p-6 ${openMaterialSelectRow !== null ? 'overflow-hidden' : 'overflow-x-auto overflow-y-visible'}`}>
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[50%]">{t('materials_item_name')}</th>
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[20%]">{t('materials_qty')}</th>
                  <th className="pb-3 w-[10%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {items.map((item, index) => (
                  <tr key={index} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4 align-top">
                      <MaterialSearchSelect
                        materials={materials}
                        value={item.material_id}
                        disabledMaterialIds={
                          new Set(
                            items
                              .filter((_, rowIndex) => rowIndex !== index)
                              .map((row) => row.material_id)
                              .filter((materialId): materialId is number => materialId !== null)
                          )
                        }
                        onSelect={(materialId) => updateItem(index, 'material_id', materialId)}
                        onOpenChange={(isOpen) => {
                          setOpenMaterialSelectRow((current) => {
                            if (isOpen) return index;
                            if (current === index) return null;
                            return current;
                          });
                        }}
                      />
                      {(() => {
                        const availability = getMaterialAvailability(item.material_id, item.quantity);
                        if (!availability) return null;

                        return (
                          <p className={`mt-2 text-[11px] ${availability.remainingQty < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {t('requisitions_remaining')}: {availability.remainingQty}
                            {availability.unitLabel ? ` ${availability.unitLabel}` : ''}
                            <span className="text-dark-muted"> ({t('material_stock')}: {availability.stockQty})</span>
                          </p>
                        );
                      })()}
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        min={1}
                        max={(() => {
                          const stockQty = getMaterialStockQty(item.material_id);
                          return stockQty !== null && stockQty > 0 ? stockQty : undefined;
                        })()}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
                       />
                    </td>
                    <td className="py-3 text-center align-top">
                      <button type="button" onClick={() => removeItem(index)} className="text-dark-muted hover:text-red-400 p-1.5 rounded-md"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectionError && (
              <p className="text-xs text-amber-400 mt-3">{selectionError}</p>
            )}
            
            <button
              type="button"
              onClick={addItem}
              disabled={allMaterialsSelected}
              className="w-full mt-4 py-3 rounded-lg border border-dashed border-slate-700 text-dark-muted hover:text-primary hover:border-primary/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-dark-muted disabled:hover:border-slate-700"
            >
              <PlusCircle size={18} />
              <span className="text-sm font-medium">{allMaterialsSelected ? t('requisitions_all_materials_added') : t('requisitions_add_item')}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate('/requisitions')} className="px-6 py-3 text-sm font-medium text-dark-muted hover:text-white transition-colors">
            {t('common_cancel')}
          </button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50">
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>{t('requisitions_submitting')}</span>
              </>
            ) : (
              <span>{t('requisitions_submit')}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequisition;
