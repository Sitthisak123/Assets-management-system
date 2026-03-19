import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { requisitionService, Requisition } from '../src/services/requisitionService';
import { Loader, AlertCircle, ChevronRight, FileText, User, ShoppingCart, Check, X, Hourglass, Calendar, Edit, Printer } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useLanguage } from '../src/contexts/LanguageContext';

const ViewRequisition: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);

  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const fetchRequisition = async () => {
    if (!id) {
      setError(t('requisitions_error_missing_id'));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await requisitionService.getRequisitionById(Number(id));
      setRequisition(response.data);
    } catch (err: any) {
      setError(err.message || t('requisitions_error_fetch'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequisition();
  }, [id]);

  const handleEvaluate = async (status: 1 | -1) => {
    if (!user) {
      setError(t('requisitions_error_login_required'));
      return;
    }
    if (!id) return;
    
    setIsEvaluating(true);
    try {
      await requisitionService.evaluateRequisition(Number(id), status, user.id);
      // Refresh data
      await fetchRequisition();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('requisitions_error_evaluate'));
    }
    setIsEvaluating(false);
  };

  const getStatusInfo = (status: '-1' | '0' | '1') => {
    const statusStr = String(status);
    switch (statusStr) {
      case '1':
        return { label: t('status_approved'), className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <Check size={18} /> };
      case '-1':
        return { label: t('status_rejected'), className: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <X size={18} /> };
      case '0':
      default:
        return { label: t('status_pending'), className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: <Hourglass size={18} /> };
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 1: return 'bg-gradient-to-br from-orange-600 to-purple-600';
      case 0: return 'bg-gradient-to-br from-blue-600 to-blue-400';
      case -1: return 'bg-gradient-to-br from-slate-600 to-slate-400';
      default: return 'bg-gradient-to-br from-gray-600 to-gray-400';
    }
  };
  
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  if (loading && !isEvaluating) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error && !requisition) {
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

  if (!requisition) {
    return null; // or a 'not found' message
  }
  
  const statusInfo = getStatusInfo(requisition.status);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-sm text-dark-muted">
            <Link to="/" className="hover:text-primary transition-colors">{t('home')}</Link>
            <ChevronRight size={14} />
            <Link to="/requisitions" className="hover:text-primary transition-colors">{t('requisitions')}</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">{t('requisitions_view_label')} {requisition.ref_no}</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight max-w-2xl truncate">{requisition.subject}</h1>
                <p className="text-dark-muted mt-2">
                  {t('requisitions_reference_no')}: <span className="font-mono text-white">{requisition.ref_no}</span>
                </p>
            </div>
            <div className="flex items-center gap-4">
                <span className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.className}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                </span>
                <Link to={`/requisitions/slip/${requisition.id}`} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-all font-semibold">
                    <Printer size={16} />
                    <span>{t('requisitions_slip')}</span>
                </Link>
                {requisition.status == '0' && (
                  <Link to={`/requisitions/edit/${requisition.id}`} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-all font-semibold">
                      <Edit size={16} />
                      <span>{t('common_edit')}</span>
                  </Link>
                )}
            </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Action Buttons */}
            {requisition.status == '0' && (
            <>
              {!user && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span>
                    {t('requisitions_login_required')}{' '}
                    <Link to="/login" className="font-bold underline hover:text-yellow-300">{t('login_sign_in')}</Link>{' '}
                    {t('requisitions_login_required_suffix')}
                  </span>
                </div>
              )}
              <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className='flex flex-col'>
                      <h3 className="text-lg font-semibold text-white">{t('common_actions')}</h3>
                      <p className="text-sm text-dark-muted">{t('requisitions_action_hint')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                      <button
                          onClick={() => handleEvaluate(-1)}
                          disabled={isEvaluating || !user}
                          className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-6 py-2.5 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isEvaluating ? <Loader size={18} className="animate-spin" /> : <X size={18} />}
                          <span>{t('status_rejected')}</span>
                      </button>
                      <button
                          onClick={() => handleEvaluate(1)}
                          disabled={isEvaluating || !user}
                          className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-6 py-2.5 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isEvaluating ? <Loader size={18} className="animate-spin" /> : <Check size={18} />}
                          <span>{t('status_approved')}</span>
                      </button>
                  </div>
              </div>
            </>
            )}
            
            {/* Details Section */}
            <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl">
                <div className="p-6 border-b border-dark-border flex items-center gap-3">
                    <FileText size={20} className="text-primary"/>
                    <h3 className="text-lg font-semibold text-white">{t('requisitions_details_title')}</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-dark-muted">{t('requisitions_label_subject')}</label>
                        <p className="text-white">{requisition.subject}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-dark-muted">{t('requisitions_label_date_required')}</label>
                        <p className="text-white">{new Date(requisition.form_date).toLocaleDateString()}</p>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-sm text-dark-muted">{t('requisitions_label_description')}</label>
                        <p className="text-white whitespace-pre-wrap">{requisition.description || t('not_available')}</p>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-sm text-dark-muted">{t('requisitions_label_purpose')}</label>
                        <p className="text-white whitespace-pre-wrap">{requisition.purpose || t('not_available')}</p>
                    </div>
                </div>
            </div>

            {/* Materials Section */}
            <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl">
                <div className="p-6 border-b border-dark-border flex items-center gap-3">
                    <ShoppingCart size={20} className="text-primary"/>
                    <h3 className="text-lg font-semibold text-white">
                      {t('materials_table_material')} ({requisition.mr_form_materials.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-dark-border bg-slate-900/50">
                                <th className="px-6 py-3 text-xs font-semibold text-dark-muted uppercase tracking-wider">{t('materials_item_name')}</th>
                                <th className="px-6 py-3 text-xs font-semibold text-dark-muted uppercase tracking-wider">{t('materials_table_quantity')}</th>
                                <th className="px-6 py-3 text-xs font-semibold text-dark-muted uppercase tracking-wider">{t('materials_table_unit')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {requisition.mr_form_materials.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">{item.material?.title}</td>
                                    <td className="px-6 py-4 text-white">{item.quantity}</td>
                                    <td className="px-6 py-4 text-dark-muted">{item.material?.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Personnel Section */}
            <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl">
                <div className="p-6 border-b border-dark-border flex items-center gap-3">
                    <User size={20} className="text-primary"/>
                    <h3 className="text-lg font-semibold text-white">{t('personnel')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <Link to={`/users/view/${requisition.creator.id}`} className="flex items-center gap-4 group">
                        <div className={`flex-shrink-0 size-10 rounded-full ${getRoleColor(requisition.creator.role)} flex items-center justify-center text-white font-bold text-xs`}>
                            {getInitials(requisition.creator.fullname)}
                        </div>
                        <div>
                            <p className="text-sm text-dark-muted">{t('requisitions_creator')}</p>
                            <p className="font-semibold text-white group-hover:text-primary transition-colors">{requisition.creator.fullname}</p>
                            <p className="text-sm text-dark-muted">{requisition.creator.position}</p>
                        </div>
                    </Link>
                     <Link to={`/users/view/${requisition.owner.id}`} className="flex items-center gap-4 group">
                        <div className={`flex-shrink-0 size-10 rounded-full ${getRoleColor(requisition.owner.role)} flex items-center justify-center text-white font-bold text-xs`}>
                            {getInitials(requisition.owner.fullname)}
                        </div>
                        <div>
                            <p className="text-sm text-dark-muted">{t('requisitions_label_owner')}</p>
                            <p className="font-semibold text-white group-hover:text-primary transition-colors">{requisition.owner.fullname}</p>
                            <p className="text-sm text-dark-muted">{requisition.owner.position}</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4 group">
                        {requisition.authorizer ? (
                            <Link to={`/users/view/${requisition.authorizer.id}`} className="flex items-center gap-4 group">
                                <div className={`flex-shrink-0 size-10 rounded-full ${getRoleColor(requisition.authorizer.role)} flex items-center justify-center text-white font-bold text-xs`}>
                                    {getInitials(requisition.authorizer.fullname)}
                                </div>
                                <div>
                                    <p className="text-sm text-dark-muted">{t('requisitions_authorizer')}</p>
                                    <p className="font-semibold text-white group-hover:text-primary transition-colors">{requisition.authorizer.fullname}</p>
                                    <p className="text-sm text-dark-muted">{requisition.authorizer.position}</p>
                                </div>
                            </Link>
                        ) : (
                            <>
                                <div className="flex-shrink-0 size-10 rounded-full bg-slate-700"></div>
                                <div>
                                    <p className="text-sm text-dark-muted">{t('requisitions_authorizer')}</p>
                                    <p className="text-yellow-500">{t('requisitions_pending_authorization')}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Timeline Section */}
            <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl">
                 <div className="p-6 border-b border-dark-border flex items-center gap-3">
                    <Calendar size={20} className="text-primary"/>
                    <h3 className="text-lg font-semibold text-white">{t('requisitions_timeline')}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="size-3 rounded-full bg-primary ring-4 ring-primary/20"></div>
                            <div className="w-px flex-grow bg-slate-700"></div>
                        </div>
                        <div>
                            <p className="text-white font-medium">{t('requisitions_created')}</p>
                            <p className="text-dark-muted text-sm">{new Date(requisition.created_at).toLocaleString()}</p>
                        </div>
                    </div>

                    {requisition.evaluated_at && (
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="size-3 rounded-full bg-primary ring-4 ring-primary/20"></div>
                                <div className="w-px flex-grow bg-slate-700"></div>
                            </div>
                            <div>
                                <p className="text-white font-medium">{requisition.status === 1 ? t('status_approved') : t('status_rejected')}</p>
                                <p className="text-dark-muted text-sm">{new Date(requisition.evaluated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                    
                    {new Date(requisition.updated_at) > new Date(requisition.evaluated_at || requisition.created_at) && (
                        <div className="flex gap-4">
                           <div className="flex flex-col items-center">
                                <div className="size-3 rounded-full bg-primary ring-4 ring-primary/20"></div>
                            </div>
                            <div>
                                <p className="text-white font-medium">{t('common_last_updated')}</p>
                                <p className="text-dark-muted text-sm">{new Date(requisition.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRequisition;
