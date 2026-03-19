import React, { useEffect, useState } from 'react';
import { AlertCircle, Building2, Edit2, Loader, Plus, Save, Trash2, X } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { workplaceService, Workplace } from '../src/services/workplaceService';
import { useLanguage } from '../src/contexts/LanguageContext';

const Workplaces: React.FC = () => {
  const { t } = useLanguage();
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchWorkplaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workplaceService.getWorkplaces();
      const rows = Array.isArray(response.data) ? response.data : [];
      setWorkplaces(rows);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('workplace_error_fetch'));
      setWorkplaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkplaces();
  }, []);

  const getWorkplaceKey = (valueBuilding: string, valueRoom?: string | null) => {
    return `${valueBuilding.trim().toLowerCase()}::${(valueRoom || '').trim().toLowerCase()}`;
  };

  const resetForm = () => {
    setBuilding('');
    setRoom('');
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedBuilding = building.trim();
    const normalizedRoom = room.trim();
    if (!normalizedBuilding) {
      setFormError(t('workplace_error_building_required'));
      return;
    }

    const candidateKey = getWorkplaceKey(normalizedBuilding, normalizedRoom);
    const duplicateWorkplace = workplaces.find((row) => {
      const rowKey = getWorkplaceKey(row.building || '', row.room || '');
      return rowKey === candidateKey && row.id !== editingId;
    });

    if (duplicateWorkplace) {
      setFormError(t('workplace_error_duplicate'));
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId !== null) {
        await workplaceService.updateWorkplace(editingId, {
          building: normalizedBuilding,
          room: normalizedRoom || null,
        });
      } else {
        await workplaceService.createWorkplace({
          building: normalizedBuilding,
          room: normalizedRoom || null,
        });
      }
      resetForm();
      await fetchWorkplaces();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || t('workplace_error_save'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (row: Workplace) => {
    setBuilding(row.building || '');
    setRoom(row.room || '');
    setEditingId(row.id);
    setFormError(null);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(t('workplace_confirm_delete'));
    if (!confirmed) return;

    try {
      await workplaceService.deleteWorkplace(id);
      if (editingId === id) resetForm();
      await fetchWorkplaces();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('workplace_error_delete'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-4">
        <Breadcrumb />
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-white text-3xl font-bold tracking-tight">{t('workplaces_title')}</h1>
            <p className="text-dark-muted text-sm">{t('workplaces_subtitle')}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3">
          <input
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            placeholder={t('workplace_building_required')}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder={t('workplace_room_optional')}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader size={16} className="animate-spin" /> : editingId !== null ? <Save size={16} /> : <Plus size={16} />}
            <span>{editingId !== null ? t('workplace_update_button') : t('workplace_add_button')}</span>
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={submitting || (editingId === null && !building && !room)}
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
                  <th className="px-6 py-4">{t('workplace_building')}</th>
                  <th className="px-6 py-4">{t('workplace_room')}</th>
                  <th className="px-6 py-4">{t('common_updated')}</th>
                  <th className="px-6 py-4 text-right">{t('common_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {workplaces.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-dark-muted">{t('workplace_empty')}</td>
                  </tr>
                ) : (
                  workplaces.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-sm text-dark-muted font-mono">{row.id}</td>
                      <td className="px-6 py-4 font-medium">{row.building}</td>
                      <td className="px-6 py-4 text-slate-300">{row.room || '-'}</td>
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

export default Workplaces;
