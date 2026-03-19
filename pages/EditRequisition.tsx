import React, { useState, useEffect, useMemo } from 'react';
import { personnelService } from '../src/services/personnelService';
import { materialService } from '../src/services/materialService';
import { requisitionService } from '../src/services/requisitionService';
import { Personnel, Material, MrForm, MrFormMaterial } from '../types';
import { ShoppingCart, Loader, AlertCircle, Save, PlusCircle, Trash2, ChevronRight, Archive, RotateCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from '../components/DatePicker';
import MaterialSearchSelect from '../components/MaterialSearchSelect';
import UserSearchSelect from '../components/UserSearchSelect';
import { useLanguage } from '../src/contexts/LanguageContext';

type RequisitionItemRow = { id?: number; material_id: number | null; quantity: number; is_deleted?: boolean };

const getTodayDateValue = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const EditRequisition: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Current form values
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [items, setItems] = useState<RequisitionItemRow[]>([]);

  // Original values for change detection
  const [originalSubject, setOriginalSubject] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [originalPurpose, setOriginalPurpose] = useState('');
  const [originalDate, setOriginalDate] = useState('');
  const [originalOwnerId, setOriginalOwnerId] = useState<number | null>(null);
  const [originalItems, setOriginalItems] = useState<RequisitionItemRow[]>([]);

  const [form, setForm] = useState<MrForm | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [openMaterialSelectRow, setOpenMaterialSelectRow] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Track if form has changed
  const hasChanges = useMemo(() => {
    return (
      subject !== originalSubject ||
      description !== originalDescription ||
      purpose !== originalPurpose ||
      date !== originalDate ||
      ownerId !== originalOwnerId ||
      JSON.stringify(items) !== JSON.stringify(originalItems)
    );
  }, [subject, originalSubject, description, originalDescription, purpose, originalPurpose, date, originalDate, ownerId, originalOwnerId, items, originalItems]);

  const allMaterialsSelected = useMemo(() => {
    const selectedIds = new Set(
      items
        .filter((item) => !item.is_deleted)
        .map((item) => item.material_id)
        .filter((materialId): materialId is number => materialId !== null)
    );
    return materials.length > 0 && selectedIds.size >= materials.length;
  }, [items, materials]);

  const selectedOwner = useMemo(() => {
    return personnel.find((entry) => entry.id === ownerId) || null;
  }, [personnel, ownerId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [personnelRes, materialsRes] = await Promise.all([
          personnelService.getPersonnel(),
          materialService.getMaterials(),
        ]);
        setPersonnel(personnelRes.data);
        setMaterials(materialsRes.data);

        if (id) {
          const formRes = await requisitionService.getRequisitionById(id);
          const formData = formRes.data;
          setForm(formData);

          // Set current values
          setSubject(formData.subject);
          setDescription(formData.description || '');
          setPurpose(formData.purpose || '');
          setDate(new Date(formData.form_date).toISOString().split('T')[0]);
          setOwnerId(formData.owner_id);
          setItems((formData.mr_form_materials || []).map((row: RequisitionItemRow) => ({ ...row, is_deleted: false })));

          // Set original values for change detection
          setOriginalSubject(formData.subject);
          setOriginalDescription(formData.description || '');
          setOriginalPurpose(formData.purpose || '');
          setOriginalDate(new Date(formData.form_date).toISOString().split('T')[0]);
          setOriginalOwnerId(formData.owner_id);
          setOriginalItems((formData.mr_form_materials || []).map((row: RequisitionItemRow) => ({ ...row, is_deleted: false })));
        }
      } catch (err: any) {
        setError(err.message || t('requisitions_error_fetch'));
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

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
    setItems([...items, { material_id: null, quantity: 1, is_deleted: false }]);
  };

  const removeItem = (index: number) => {
    setSelectionError(null);
    if (openMaterialSelectRow === index) setOpenMaterialSelectRow(null);
    const target = items[index];
    if (!target) return;

    // Newly added rows (no DB id yet) should be removed immediately.
    if (target.id === undefined || target.id === null) {
      setItems(items.filter((_, i) => i !== index));
      return;
    }

    // Existing rows are soft-deleted until user saves.
    setItems(items.map((item, i) => (i === index ? { ...item, is_deleted: true } : item)));
  };

  const restoreItem = (index: number) => {
    setSelectionError(null);
    const row = items[index];
    if (!row) return;

    if (row.material_id !== null) {
      const duplicateIndex = items.findIndex((item, i) => {
        return i !== index && !item.is_deleted && item.material_id === row.material_id;
      });

      if (duplicateIndex !== -1) {
        setSelectionError(t('requisitions_error_restore_duplicate'));
        return;
      }
    }

    setItems(items.map((item, i) => (i === index ? { ...item, is_deleted: false } : item)));
  };

  const updateItem = (index: number, field: 'material_id' | 'quantity', value: any) => {
    setSelectionError(null);
    const newItems = [...items];
    if (newItems[index]?.is_deleted) return;
    if (field === 'material_id') {
      const nextMaterialId = value ? parseInt(value, 10) : null;
      if (nextMaterialId !== null) {
        const duplicateIndex = newItems.findIndex((item, i) => i !== index && !item.is_deleted && item.material_id === nextMaterialId);
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

  const toggleDeleteModal = () => {
    setIsDeleteModalOpen(!isDeleteModalOpen);
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    setError(null);

    try {
      await requisitionService.deleteRequisition(id);
      navigate('/requisitions');
    } catch (err: any) {
      setError(err.message || t('requisitions_error_delete'));
      setIsDeleting(false);
      toggleDeleteModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !hasChanges) return;

    setIsSubmitting(true);
    setError(null);
    setSelectionError(null);

    if (date && date > getTodayDateValue()) {
      setError(t('requisitions_error_date_future'));
      setIsSubmitting(false);
      return;
    }

    if (!ownerId) {
      setSelectionError(t('requisitions_error_owner_required_edit'));
      setIsSubmitting(false);
      return;
    }

    const activeItems = items.filter((item) => !item.is_deleted);

    if (activeItems.length === 0) {
      setSelectionError(t('requisitions_error_item_required'));
      setIsSubmitting(false);
      return;
    }

    const selectedMaterialIds = activeItems
      .map((item) => item.material_id)
      .filter((materialId): materialId is number => materialId !== null);

    if (new Set(selectedMaterialIds).size !== selectedMaterialIds.length) {
      setSelectionError(t('requisitions_error_duplicate_material'));
      setIsSubmitting(false);
      return;
    }

    if (activeItems.some((item) => !item.material_id || item.quantity <= 0)) {
      setSelectionError(t('requisitions_error_item_invalid_edit'));
      setIsSubmitting(false);
      return;
    }

    const exceedsStock = activeItems.some((item) => {
      const stockQty = getMaterialStockQty(item.material_id);
      return stockQty !== null && stockQty > 0 && item.quantity > stockQty;
    });

    if (exceedsStock) {
      setSelectionError(t('requisitions_error_exceed_stock_available'));
      setIsSubmitting(false);
      return;
    }

    const requisitionData = {
      subject,
      description,
      purpose,
      form_date: date,
      owner_id: ownerId,
      items: activeItems.map((item) => ({
        id: item.id,
        material_id: item.material_id,
        quantity: item.quantity,
      })),
    };

    try {
      await requisitionService.updateRequisition(id, requisitionData);

      // Update original values after successful save
      setOriginalSubject(subject);
      setOriginalDescription(description);
      setOriginalPurpose(purpose);
      setOriginalDate(date);
      setOriginalOwnerId(ownerId);
      setOriginalItems(items);

      navigate('/requisitions');
    } catch (err: any) {
      setError(err.message || t('requisitions_error_update'));
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
          <h3 className="text-xl font-bold">{t('common_error')}</h3>
          <span>{error}</span>
          <button
            onClick={() => navigate('/requisitions')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
          >
            {t('requisitions_back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-sm text-dark-muted">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">{t('home')}</button>
          <ChevronRight size={14} />
          <button onClick={() => navigate('/requisitions')} className="hover:text-primary transition-colors">{t('requisitions')}</button>
          <span className="mx-2">/</span>
          <span className="text-white font-medium">{t('requisitions_edit_label')} {form?.ref_no}</span>
        </nav>
        <h2 className="text-3xl font-bold text-white tracking-tight">{t('requisitions_edit_title')}</h2>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
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
                className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white"
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
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[50%]">
                    {t('materials_item_name')}
                  </th>
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[20%]">{t('materials_qty')}</th>
                  <th className="pb-3 w-[10%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {items.map((item, index) => (
                  <tr key={index} className={`group hover:bg-slate-800/30 transition-colors ${item.is_deleted ? 'opacity-60' : ''}`}>
                    <td className="py-3 pr-4 align-top">
                      {item.is_deleted ? (
                        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-300">
                          <p className="font-medium">
                            {materials.find((material) => material.id === item.material_id)?.title || t('materials_table_material')}
                          </p>
                          <p className="text-[11px] text-red-200/80">{t('requisitions_marked_for_delete')}</p>
                        </div>
                      ) : (
                        <>
                          <MaterialSearchSelect
                            materials={materials}
                            value={item.material_id}
                            disabledMaterialIds={
                              new Set(
                                items
                                  .filter((_, rowIndex) => rowIndex !== index)
                                  .filter((row) => !row.is_deleted)
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
                        </>
                      )}
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        disabled={item.is_deleted}
                        min={1}
                        max={(() => {
                          const stockQty = getMaterialStockQty(item.material_id);
                          return stockQty !== null && stockQty > 0 ? stockQty : undefined;
                        })()}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="py-3 text-center align-top">
                      {item.is_deleted ? (
                        <button
                          type="button"
                          onClick={() => restoreItem(index)}
                          className="text-dark-muted hover:text-emerald-400 p-1.5 rounded-md"
                          title={t('requisitions_restore_item')}
                        >
                          <RotateCcw size={18} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-dark-muted hover:text-red-400 p-1.5 rounded-md"
                          title={t('requisitions_mark_for_delete')}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
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

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={toggleDeleteModal}
              className="px-6 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 transition-all rounded-lg"
            >
              {t('requisitions_delete_button')}
            </button>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/requisitions')}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-dark-muted hover:text-white transition-all rounded-lg"
            >
              {t('common_cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              title={!hasChanges ? t('common_no_changes') : t('common_save_changes')}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>{t('common_saving')}</span>
                </>
              ) : (
                <>
                  <span>{t('common_save_changes')}</span>
                  <Save size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-in fade-in">
          <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-2xl p-8 max-w-md w-full m-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-500/10 rounded-full border-4 border-red-500/20 mb-4">
                <Archive size={32} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">{t('requisitions_delete_confirm_title')}</h2>
              <p className="text-dark-muted mt-2">
                {t('requisitions_delete_confirm_body')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={toggleDeleteModal}
                disabled={isDeleting}
                className="px-6 py-3 text-sm font-medium text-dark-muted hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50"
              >
                {t('common_cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? t('common_deleting') : t('common_confirm_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditRequisition;
