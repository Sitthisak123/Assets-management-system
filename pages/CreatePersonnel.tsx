
import React, { useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Lock,
  MapPin, 
  BadgeCheck, 
  Calendar, 
  Camera, 
  Save, 
  Plus,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { personnelService } from '../src/services/personnelService';
import { workplaceService, Workplace } from '../src/services/workplaceService';
import Breadcrumb from '../components/Breadcrumb';
import { useLanguage } from '../src/contexts/LanguageContext';

const CreatePersonnel: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [workplaceId, setWorkplaceId] = useState<number | ''>('');
  const role = -1; // Default role for new personnel, can be updated later by admin
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [workplacesLoading, setWorkplacesLoading] = useState(true);
  const [workplacesError, setWorkplacesError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const personnelData = {
      fullname,
      email: email || undefined, // Make email optional in case it's not provided
      position,
      workplace_id: workplaceId === '' ? null : workplaceId,
      role,
    };

    try {
      await personnelService.createPersonnel(personnelData);
      navigate('/personnel');
    } catch (err: any) {
      setError(err.message || t('personnel_error_create'));
      setLoading(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6">
        <Breadcrumb />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('personnel_create_title')}</h1>
          <p className="text-dark-muted text-base max-w-3xl">
            {t('personnel_create_subtitle')}{' '}
            <span className="text-primary">*</span> {t('common_required_hint')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-dark-border bg-dark-bg/30">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-dark-border group-hover:border-primary flex items-center justify-center overflow-hidden transition-colors cursor-pointer relative z-10">
                <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: 'url("https://picsum.photos/seed/newuser/200/200")' }}></div>
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-dark-surface p-1 rounded-full border border-dark-border z-20">
                <div className="bg-primary rounded-full p-1.5 text-white flex items-center justify-center">
                  <Plus size={14} />
                </div>
              </div>
            </div>
            <div className="text-center sm:text-left pt-1">
              <h3 className="text-lg font-semibold text-white">{t('profile_photo_title')}</h3>
              <p className="text-sm text-dark-muted mt-1 max-w-sm">{t('profile_photo_subtitle_personnel')}</p>
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
                <label className="text-sm font-medium text-gray-300">
                  {t('label_email_address')} <span className="text-primary">*</span>
                </label>
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
              <div className="space-y-2">
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
                <label className="text-sm font-medium text-gray-300">{t('label_role')}</label>
                <div className="relative">
                  <select
                    value={role}
                    disabled
                    className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-not-allowed appearance-none"
                  >
                    <option value={-1}>{t('role_personnel')}</option>
                  </select>
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-slate-950/50 p-6 md:px-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-dark-border">
          <button 
            type="button" 
            onClick={() => navigate('/personnel')}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-dark-muted hover:text-white transition-all rounded-lg"
          >
            {t('common_cancel')}
          </button>
          <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? t('common_saving') : <><Save size={18} /><span>{t('personnel_save_button')}</span></>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePersonnel;
