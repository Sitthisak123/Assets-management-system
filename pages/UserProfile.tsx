
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Profile } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Save, 
  Key, 
  Lock, 
  Monitor, 
  Smartphone, 
  ChevronRight,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          setError(error.message);
        } else if (data) {
          setProfile(data);
          setUsername(data.username || '');
          setTitle(data.title || '');
        }
      } else {
        setError("No user is logged in.");
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase
      .from('profiles')
      .update({ username, title, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Profile updated successfully!");
      // Optionally re-fetch profile to confirm changes
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if(data) setProfile(data);
    }
    setUpdating(false);
  };

  const getStatusInfo = (status: number | undefined) => {
    switch (status) {
      case 1: return { text: 'Active', className: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' };
      case 0: return { text: 'Inactive', className: 'bg-slate-500/10 text-slate-400 ring-slate-500/20' };
      case -1: return { text: 'Suspended', className: 'bg-red-500/10 text-red-400 ring-red-500/20' };
      default: return { text: 'Unknown', className: 'bg-gray-500/10 text-gray-400 ring-gray-500/20' };
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary" size={40} /></div>;
  }

  if (error && !profile) {
    return <div className="flex justify-center items-center h-64 text-red-500"><AlertCircle size={40} /> <span className="ml-4">{error}</span></div>;
  }

  return (
    <div className="max-w-[960px] mx-auto flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-dark-muted">
          <span className="font-medium hover:text-primary cursor-pointer transition-colors">Settings</span>
          <ChevronRight size={14} />
          <span className="text-white font-medium">My Profile</span>
        </div>
        <h2 className="text-white text-3xl font-bold tracking-tight">User Profile</h2>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 md:p-8 border-b border-dark-border bg-dark-bg/20">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer">
                <div 
                  className="h-24 w-24 rounded-full bg-cover bg-center border-4 border-dark-bg shadow-md" 
                  style={{ backgroundImage: `url(${profile?.avatar_url || 'https://picsum.photos/seed/profile/200/200'})` }}
                ></div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-white text-xl font-bold">{profile?.username || 'User'}</h3>
                <p className="text-dark-muted text-sm">{profile?.title || 'No title set'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusInfo(profile?.status).className}`}>
                    {getStatusInfo(profile?.status).text}
                  </span>
                </div>
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-dark-border text-white rounded-lg text-sm font-medium transition-colors w-full md:w-auto">
              <Camera size={18} />
              <span>Change Photo</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-6 md:p-8 flex flex-col gap-10">
           {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3">
              <AlertCircle size={20} /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg p-3 flex items-center gap-3">
              <CheckCircle size={20} /><span>{success}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-8">
              <section>
                <h4 className="text-white text-lg font-medium border-b border-dark-border/50 pb-2 mb-6">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Username</label>
                    <input className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary outline-none transition-all" value={username} onChange={e => setUsername(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Title</label>
                     <input className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary outline-none transition-all" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                      <input className="w-full bg-dark-surface/50 border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-dark-muted cursor-not-allowed" type="email" readOnly value={user?.email || ''} />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="md:col-span-4 space-y-6">
              <div className="bg-dark-bg/30 rounded-xl p-5 border border-dark-border">
                <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield size={16} className="text-primary" />
                  Security
                </h5>
                <button type="button" className="w-full flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg text-sm text-slate-300 group transition-colors">
                  <span className="flex items-center gap-2"><Key size={16} /> Password</span>
                  <ChevronRight size={14} className="text-dark-muted group-hover:text-white" />
                </button>
                <button type="button" className="w-full flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg text-sm text-slate-300 group transition-colors">
                  <span className="flex items-center gap-2"><Smartphone size={16} /> 2FA Setup</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-dark-border/30">
            <button type="button" className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-dark-border text-white font-medium hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={updating} className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {updating ? <><Loader size={18} className="animate-spin" /><span>Saving...</span></> : <><Save size={18} /><span>Save Changes</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
