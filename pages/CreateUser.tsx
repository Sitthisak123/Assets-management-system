import React, { useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Shield,
  MapPin, 
  BadgeCheck, 
  Camera, 
  Save, 
  Plus,
  AlertCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../src/services/userService';
import { personnelService } from '../src/services/personnelService';
import { workplaceService, Workplace } from '../src/services/workplaceService';
import Breadcrumb from '../components/Breadcrumb';

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [display_name, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [workplaceId, setWorkplaceId] = useState<number | ''>('');
  const [role, setRole] = useState<number>(0); // Default to 0 (admin/user)
  const [status, setStatus] = useState<number>(1); // Default to 1 (active)
  const isPersonnelRole = role === -1;
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [workplacesLoading, setWorkplacesLoading] = useState(true);
  const [workplacesError, setWorkplacesError] = useState<string | null>(null);
  const [isWorkplaceModalOpen, setIsWorkplaceModalOpen] = useState(false);
  const [newBuilding, setNewBuilding] = useState('');
  const [newRoom, setNewRoom] = useState('');

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
        setWorkplacesError(err.response?.data?.message || err.message || 'Failed to load workplaces');
      } finally {
        if (mounted) setWorkplacesLoading(false);
      }
    };

    fetchWorkplaces();
    return () => {
      mounted = false;
    };
  }, []);

  const getWorkplaceKey = (building: string, room?: string | null) => {
    return `${building.trim().toLowerCase()}::${(room || '').trim().toLowerCase()}`;
  };

  const handleCreateNewWorkplace = async () => {
    const normalizedBuilding = newBuilding.trim();
    const normalizedRoom = newRoom.trim();
    if (!normalizedBuilding) {
      setWorkplacesError('Building is required.');
      return;
    }

    const candidateKey = getWorkplaceKey(normalizedBuilding, normalizedRoom);
    const duplicateWorkplace = workplaces.find((item) => {
      return getWorkplaceKey(item.building || '', item.room || '') === candidateKey;
    });

    if (duplicateWorkplace) {
      setWorkplaceId(duplicateWorkplace.id);
      setIsWorkplaceModalOpen(false);
      setNewBuilding('');
      setNewRoom('');
      setWorkplacesError('Workplace already exists. Selected existing workplace.');
      return;
    }

    try {
      const response = await workplaceService.createWorkplace({
        building: normalizedBuilding,
        room: normalizedRoom || null,
      });
      setWorkplaces((prev) => [...prev, response.data]);
      setWorkplaceId(response.data.id);
      setIsWorkplaceModalOpen(false);
      setNewBuilding('');
      setNewRoom('');
      setWorkplacesError(null);
    } catch (err: any) {
      setWorkplacesError(err.response?.data?.message || err.message || 'Failed to create workplace');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isPersonnelRole) {
        const personnelData = {
          fullname: fullname.trim(),
          email: email.trim() || undefined,
          position: position.trim(),
          workplace_id: workplaceId === '' ? null : workplaceId,
          role: -1,
        };
        await personnelService.createPersonnel(personnelData);
      } else {
        const userData = {
          fullname: fullname.trim(),
          username: username.trim(),
          display_name: display_name.trim() || undefined,
          email: email.trim(),
          position: position.trim(),
          workplace_id: workplaceId === '' ? null : workplaceId,
          role,
          status,
        };
        await userService.createUser(userData);
      }
      navigate('/users');
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6">
        <Breadcrumb />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Create User</h1>
          <p className="text-dark-muted text-base max-w-3xl">Add a new user account to the system. Please ensure all required fields marked with <span className="text-primary">*</span> are completed.</p>
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
              <h3 className="text-lg font-semibold text-white">Profile Photo</h3>
              <p className="text-sm text-dark-muted mt-1 max-w-sm">Upload a professional headshot. This will be used for user profiles and the internal directory.</p>
              <div className="flex gap-4 mt-4 justify-center sm:justify-start">
                <button type="button" className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 border border-dark-border px-4 py-2 rounded-lg transition-colors">Choose File</button>
                <button type="button" className="text-sm font-medium text-red-400 hover:text-red-300 px-2 py-2 transition-colors">Remove</button>
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
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name <span className="text-primary">*</span></label>
                <input 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="e.g. Sarah Connor" 
                />
              </div>
              {!isPersonnelRole && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Username <span className="text-primary">*</span></label>
                  <input 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    placeholder="e.g. sarah_connor" 
                  />
                </div>
              )}
              {!isPersonnelRole && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Display Name</label>
                  <input 
                    value={display_name}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    placeholder="e.g. Sarah" 
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address <span className="text-primary">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required={!isPersonnelRole}
                    className="w-full bg-slate-900 border border-dark-border rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    placeholder="sarah@company.com" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Workplace</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                    <select
                      value={workplaceId}
                      onChange={(e) => setWorkplaceId(e.target.value ? parseInt(e.target.value, 10) : '')}
                      className="w-full bg-slate-900 border border-dark-border rounded-lg pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                    >
                      <option value="">{workplacesLoading ? 'Loading workplaces...' : 'Select workplace (optional)'}</option>
                      {workplaces.map((workplace) => (
                        <option key={workplace.id} value={workplace.id}>
                          {[workplace.building, workplace.room].filter(Boolean).join(' / ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWorkplaceModalOpen(true)}
                    className="px-4 py-2.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center"
                    title="Add workplace"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {workplacesError && (
                  <p className="text-xs text-amber-400">{workplacesError}</p>
                )}
              </div>
              <div className={`space-y-2 ${isPersonnelRole ? '' : 'md:col-span-2'}`}>
                <label className="text-sm font-medium text-gray-300">
                  {isPersonnelRole ? 'Position Title' : 'Position'}<span className="text-primary"> *</span>
                </label>
                <input 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="e.g. Senior Frontend Engineer" 
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <BadgeCheck size={18} />
              </div>
              <h3 className="text-lg font-semibold text-white">Role & Access</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Role <span className="text-primary">*</span></label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                  <select
                    value={role}
                    onChange={(e) => setRole(parseInt(e.target.value, 10))}
                    required
                    className="w-full bg-slate-900 border border-dark-border rounded-lg pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value={-1}>Personnel</option>
                    <option value={0}>Admin / User</option>
                    <option value={1}>Superadmin</option>
                  </select>
                </div>
              </div>
              {!isPersonnelRole && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status <span className="text-primary">*</span></label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(parseInt(e.target.value, 10))}
                      required
                      className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                    >
                      <option value={-1}>Suspended</option>
                      <option value={0}>Inactive</option>
                      <option value={1}>Active</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="bg-slate-950/50 p-6 md:px-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-dark-border">
          <button 
            type="button" 
            onClick={() => navigate('/users')}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-dark-muted hover:text-white transition-all rounded-lg"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : <><Save size={18} /><span>{isPersonnelRole ? 'Save Personnel' : 'Create User'}</span></>}
          </button>
        </div>
      </form>

      {isWorkplaceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-in fade-in">
          <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-2xl p-8 max-w-sm w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Add New Workplace</h3>
              <button
                onClick={() => setIsWorkplaceModalOpen(false)}
                className="text-dark-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Building <span className="text-primary">*</span></label>
                <input
                  value={newBuilding}
                  onChange={(e) => setNewBuilding(e.target.value)}
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g. HQ Building A"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Room</label>
                <input
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g. 2F-204"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateNewWorkplace}
                className="w-full px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-all"
              >
                Add Workplace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateUser;
