import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService, User } from '../src/services/userService';
import { Loader, AlertCircle, User as UserIcon, Mail, MapPin, BadgeCheck, Shield, KeyRound, Calendar, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';

const ViewUser: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError(t('users_error_missing_id'));
        setLoading(false);
        return;
      }

      try {
        const response = await userService.getUserById(id);
        setUser(response.data);
      } catch (err: any) {
        setError(err.message || t('users_error_fetch'));
      }
      setLoading(false);
    };

    fetchUser();
  }, [id]);

  const getRoleInfo = (role: number) => {
    switch (role) {
      case 1: return { name: t('users_role_superadmin'), className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 0: return { name: t('users_role_admin_user'), className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case -1: return { name: t('role_personnel'), className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
      default: return { name: t('role_unknown'), className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 1: return { text: t('status_active'), className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 0: return { text: t('status_inactive'), className: 'bg-slate-500/10 text-dark-muted border-dark-border' };
      case -1: return { text: t('status_suspended'), className: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default: return { text: t('status_unknown'), className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  const getWorkplaceLabel = () => {
    if (!user) return t('not_available');
    if (user.workplace?.building || user.workplace?.room) {
      return [user.workplace.building, user.workplace.room].filter(Boolean).join(' / ');
    }
    if (user.workplace_id) {
      return `${t('workplace')} #${user.workplace_id}`;
    }
    return t('not_set');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-8 text-white">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-4 flex flex-col items-center gap-3">
          <AlertCircle size={40} />
          <h3 className="text-xl font-bold">{t('common_error')}</h3>
          <span>{error || t('users_not_found')}</span>
          <Link to="/users" className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">
            <ArrowLeft size={16} className="inline-block mr-2" />
            {t('users_back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <Link to="/users" className="flex items-center gap-2 text-sm text-dark-muted hover:text-white transition-colors">
          <ArrowLeft size={16} />
          {t('users_back')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl p-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-primary/20 flex items-center justify-center overflow-hidden mb-4">
              <span className="text-5xl font-bold text-white">{user.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{user.fullname}</h1>
            <p className="text-dark-muted">{user.display_name ? `@${user.display_name}`: ''}</p>
            <p className="text-primary mt-2">{user.position}</p>
          </div>

          <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Mail size={18} /> {t('users_contact_information')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-muted">{t('label_email_address')}</span>
                <span className="text-white font-medium">{user.email || t('not_set')}</span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-dark-muted inline-flex items-center gap-1"><MapPin size={14} /> {t('workplace')}</span>
                <span className="text-white font-medium text-right">{getWorkplaceLabel()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><KeyRound size={18} /> {t('users_credentials')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-muted">{t('label_username')}</span>
                <span className="text-white font-mono">{user.username || t('not_set')}</span>
              </div>
            </div>
          </div>

          <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Shield size={18} /> {t('users_role_status')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-bg/50 p-4 rounded-lg">
                <p className="text-xs text-dark-muted mb-1">{t('label_role')}</p>
                <p className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleInfo(user.role).className}`}>
                  {getRoleInfo(user.role).name}
                </p>
              </div>
              <div className="bg-dark-bg/50 p-4 rounded-lg">
                <p className="text-xs text-dark-muted mb-1">{t('common_status')}</p>
                <p className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusInfo(user.status).className}`}>
                  {getStatusInfo(user.status).text}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Calendar size={18} /> {t('users_activity')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-muted">{t('common_date_created')}</span>
                <span className="text-white font-mono">{new Date(user.created_at!).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-muted">{t('common_last_updated')}</span>
                <span className="text-white font-mono">{new Date(user.updated_at!).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {user.created_by && (
            <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><UserIcon size={18} /> {t('users_created_by')}</h3>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-white font-semibold">{user.created_by_user.fullname}</span>
                  <span className="text-dark-muted text-sm">{user.created_by_user.position}</span>
                </div>
                <Link to={`/users/view/${user.created_by}`} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">
                  {t('users_view_user')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
