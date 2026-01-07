
import React from 'react';
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
  MoreVertical,
  ChevronRight
} from 'lucide-react';

const UserProfile: React.FC = () => {
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
                  style={{ backgroundImage: 'url("https://picsum.photos/seed/janedoe/200/200")' }}
                ></div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-white text-xl font-bold">Jane Doe</h3>
                <p className="text-dark-muted text-sm">Senior Logistics Manager</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">Active</span>
                </div>
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-dark-border text-white rounded-lg text-sm font-medium transition-colors w-full md:w-auto">
              <Camera size={18} />
              <span>Change Photo</span>
            </button>
          </div>
        </div>

        <form className="p-6 md:p-8 flex flex-col gap-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-8">
              <section>
                <h4 className="text-white text-lg font-medium border-b border-dark-border/50 pb-2 mb-6">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Full Name</label>
                    <input className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary outline-none transition-all" defaultValue="Jane Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Username</label>
                    <input className="w-full bg-dark-surface/50 border border-dark-border rounded-lg px-4 py-2.5 text-dark-muted cursor-not-allowed" readOnly value="janedoe" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                      <input className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-primary outline-none transition-all" type="email" defaultValue="jane.doe@company.com" />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-white text-lg font-medium border-b border-dark-border/50 pb-2 mb-6">Professional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Job Title</label>
                    <input className="w-full bg-dark-surface/50 border border-dark-border rounded-lg px-4 py-2.5 text-dark-muted cursor-not-allowed" readOnly value="Senior Logistics Manager" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">System Role</label>
                    <input className="w-full bg-dark-surface/50 border border-dark-border rounded-lg px-4 py-2.5 text-dark-muted cursor-not-allowed" readOnly value="Administrator" />
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

              <div className="bg-dark-bg/30 rounded-xl p-5 border border-dark-border">
                <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Monitor size={16} className="text-primary" />
                  Last Sessions
                </h5>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-xs text-white font-medium">Chrome on Mac OS</span>
                      <span className="text-[10px] text-dark-muted">Today, 10:42 AM • 192.168.1.42</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">CURRENT</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-xs text-white font-medium">Mobile App (iOS)</span>
                      <span className="text-[10px] text-dark-muted">Yesterday, 08:15 PM • San Francisco, CA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-dark-border/30">
            <button type="button" className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-dark-border text-white font-medium hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="button" className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
