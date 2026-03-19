import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Mail, 
  MapPin,
  BadgeCheck, 
  Save, 
  AlertCircle,
  Loader,
  Archive,
  Camera
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { personnelService } from '../src/services/personnelService';
import { workplaceService, Workplace } from '../src/services/workplaceService';
import Breadcrumb from '../components/Breadcrumb';
import { useLanguage } from '../src/contexts/LanguageContext';

const EditPersonnel: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Current form values
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [workplaceId, setWorkplaceId] = useState<number | ''>('');
  const [role, setRole] = useState(-1);

  // Original values for change detection
  const [originalFullname, setOriginalFullname] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPosition, setOriginalPosition] = useState('');
  const [originalWorkplaceId, setOriginalWorkplaceId] = useState<number | ''>('');
  const [originalRole, setOriginalRole] = useState(-1);

  const [loading, setLoading] = useState(true);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [workplacesLoading, setWorkplacesLoading] = useState(true);
  const [workplacesError, setWorkplacesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track if form has changed
  const hasChanges = useMemo(() => {
    return (
      fullname !== originalFullname ||
      email !== originalEmail ||
      position !== originalPosition ||
      workplaceId !== originalWorkplaceId ||
      role !== originalRole
    );
  }, [fullname, originalFullname, email, originalEmail, position, originalPosition, workplaceId, originalWorkplaceId, role, originalRole]);

  useEffect(() => {
    const fetchPersonnel = async () => {
      if (!id) {
        setError(t('personnel_error_missing_id'));
        setLoading(false);
        return;
      }

      try {
        const response = await personnelService.getPersonnelById(id);
        const data = response.data;
        if (data) {
          setFullname(data.fullname);
          setEmail(data.email || '');
          setPosition(data.position);
          setWorkplaceId(data.workplace_id ?? '');
          setRole(data.role);

          // Store original values for change detection
          setOriginalFullname(data.fullname);
          setOriginalEmail(data.email || '');
          setOriginalPosition(data.position);
          setOriginalWorkplaceId(data.workplace_id ?? '');
          setOriginalRole(data.role);
        }
      } catch (err: any) {
        setError(err.message || t('personnel_error_fetch'));
      }
      setLoading(false);
    };

    fetchPersonnel();
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const fetchWorkplaces = async () => {
      setWorkplacesLoading(true);
      try {
        const response = await workplaceService.getWorkplaces();
        if (!mounted) return;
        setWorkplaces(response.data || []);
        setWorkplacesError(null);
      } catch (err: any) {
        if (!mounted) return;
        setWorkplaces([]);
        setWorkplacesError(err.response?.data?.message || err.message || t('workplace_error_load'));
      } finally {
        if (mounted) setWorkplacesLoading(false);
      }
    };

    fetchWorkplaces();
    return () => {
      mounted = false;
    };
  }, []);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleDeleteModal = () => {
    setIsDeleteModalOpen(!isDeleteModalOpen);
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    setError(null);

    try {
      await personnelService.deletePersonnel(id);
      navigate('/personnel');
    } catch (err: any) {
      setError(err.message || t('personnel_error_delete'));
      setIsDeleting(false);
      toggleDeleteModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !hasChanges) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await personnelService.updatePersonnel(id, {
        fullname,
        email,
        position,
        workplace_id: workplaceId === '' ? null : workplaceId,
        role,
      });
      // Update original values after successful save
      setOriginalFullname(fullname);
      setOriginalEmail(email);
      setOriginalPosition(position);
      setOriginalWorkplaceId(workplaceId);
      setOriginalRole(role);
      navigate('/personnel');
    } catch (err: any) {
      setError(err.message || t('personnel_error_update'));
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
            onClick={() => navigate('/personnel')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
          >
            {t('personnel_back')}
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
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('personnel_edit_title')}</h1>
          <p className="text-dark-muted text-base max-w-3xl">{t('personnel_edit_subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-dark-border bg-dark-bg/30">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-dark-border group-hover:border-primary flex items-center justify-center overflow-hidden transition-colors cursor-pointer relative z-10">
                <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: 'url("https://picsum.photos/seed/user-' + id + '/200/200")' }}></div>
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-dark-surface p-1 rounded-full border border-dark-border z-20">
                <div className="bg-primary rounded-full p-1.5 text-white flex items-center justify-center">
                  <Camera size={14} />
                </div>
              </div>
            </div>
            <div className="text-center sm:text-left pt-1">
              <h3 className="text-lg font-semibold text-white">{t('profile_photo_title')}</h3>
              <p className="text-sm text-dark-muted mt-1 max-w-sm">{t('profile_photo_subtitle_personnel_update')}</p>
              <div className="flex gap-4 mt-4 justify-center sm:justify-start">
                <button type="button" className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 border border-dark-border px-4 py-2 rounded-lg transition-colors">
                  {t('common_choose_file')}
                </button>
                <button type="button" className="text-sm font-medium text-red-400 hover:text-red-300 px-2 py-2 transition-colors">
                  {t('common_remove')}
                </button>
              </div>
            </div>
          </div>
        </div>

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
                <User size={18} />
              </div>
              <h3 className="text-lg font-semibold text-white">{t('section_personal_information')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  {t('label_full_name')} <span className="text-primary">*</span>
                </label>
                <input 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder={t('placeholder_fullname_example')} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{t('label_email_address')}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-dark-border rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    type="email" 
                    placeholder={t('placeholder_email_example')} 
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-300">{t('workplace')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                  <select
                    value={workplaceId}
                    onChange={(e) => setWorkplaceId(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full bg-slate-900 border border-dark-border rounded-lg pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value="">{workplacesLoading ? t('workplace_loading') : t('workplace_select_optional')}</option>
                    {workplaces.map((workplace) => (
                      <option key={workplace.id} value={workplace.id}>
                        {[workplace.building, workplace.room].filter(Boolean).join(' / ')}
                      </option>
                    ))}
                  </select>
                </div>
                {workplacesError && (
                  <p className="text-xs text-amber-400">{workplacesError}</p>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <BadgeCheck size={18} />
              </div>
              <h3 className="text-lg font-semibold text-white">{t('section_role_responsibilities')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  {t('label_position_title')} <span className="text-primary">*</span>
                </label>
                <input 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder={t('placeholder_position_example')} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  {t('label_role')} <span className="text-primary">*</span>
                </label>
                <select 
                  value={role}
                  onChange={(e) => setRole(parseInt(e.target.value))}
                  disabled
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-not-allowed appearance-none"
                >
                  <option value={-1}>{t('role_personnel')}</option>
                </select>
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
              {t('personnel_delete_button')}
            </button>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full sm:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/personnel')}
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
              {isSubmitting ? t('common_saving') : <><Save size={18} /><span>{t('common_save_changes')}</span></>}
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
              <h2 className="text-2xl font-bold text-white">{t('personnel_delete_confirm_title')}</h2>
              <p className="text-dark-muted mt-2">
                {t('personnel_delete_confirm_body')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={toggleDeleteModal}
                disabled={isDeleting}
                className="px-6 py-3 text-sm font-medium text-dark-muted hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
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

export default EditPersonnel;
