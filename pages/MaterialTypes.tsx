import React, { useEffect, useState } from 'react';
import { AlertCircle, Edit2, Loader, Plus, Save, Tags, Trash2, X } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { materialService, MaterialType } from '../src/services/materialService';
import { useLanguage } from '../src/contexts/LanguageContext';

const MaterialTypes: React.FC = () => {
  const { t } = useLanguage();
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMaterialTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.getMaterialTypes();
      const rows = Array.isArray(response.data) ? response.data : [];
      setMaterialTypes(rows);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('material_types_error_fetch'));
      setMaterialTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterialTypes();
  }, []);

  const resetForm = () => {
    setTitle('');
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setFormError(t('material_types_error_required'));
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId !== null) {
        await materialService.updateMaterialType(editingId, { title: normalizedTitle });
      } else {
        await materialService.createMaterialType({ title: normalizedTitle });
      }
      resetForm();
      await fetchMaterialTypes();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || t('material_types_error_save'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (row: MaterialType) => {
    setTitle(row.title || '');
    setEditingId(row.id);
    setFormError(null);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(t('material_types_confirm_delete'));
    if (!confirmed) return;

    try {
      await materialService.deleteMaterialType(id);
      if (editingId === id) resetForm();
      await fetchMaterialTypes();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('material_types_error_delete'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-4">
        <Breadcrumb />
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Tags size={20} />
          </div>
          <div>
            <h1 className="text-white text-3xl font-bold tracking-tight">{t('material_types_title')}</h1>
            <p className="text-dark-muted text-sm">{t('material_types_subtitle')}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-dark-surface border border-dark-border rounded-xl p-4 md:p-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('material_types_placeholder')}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader size={16} className="animate-spin" /> : editingId !== null ? <Save size={16} /> : <Plus size={16} />}
            <span>{editingId !== null ? t('material_types_update') : t('material_types_add')}</span>
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={submitting || (editingId === null && !title)}
            className="px-4 py-2.5 rounded-lg border border-dark-border text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X size={16} />
            <span>{t('common_clear')}</span>
          </button>
        </div>
        {formError && (
          <p className="text-sm text-red-400">{formError}</p>
        )}
      </form>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-56">
              <Loader className="animate-spin text-primary" size={36} />
            </div>
          ) : (
            <table className="w-full text-left text-sm text-white">
              <thead className="bg-dark-bg/50 border-b border-dark-border text-dark-muted uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">{t('material_types_table_title')}</th>
                  <th className="px-6 py-4">{t('common_updated')}</th>
                  <th className="px-6 py-4 text-right">{t('common_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {materialTypes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-dark-muted">{t('material_types_empty')}</td>
                  </tr>
                ) : (
                  materialTypes.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-sm text-dark-muted font-mono">{row.id}</td>
                      <td className="px-6 py-4 font-medium">{row.title}</td>
                      <td className="px-6 py-4 text-dark-muted">{row.updated_at ? new Date(row.updated_at).toLocaleString() : t('not_available')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleEdit(row)}
                            className="p-1.5 rounded-md text-dark-muted hover:text-white hover:bg-slate-800 transition-colors"
                            title={t('common_edit')}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 rounded-md text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title={t('common_delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialTypes;

