import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BadgeCheck, 
  Calendar, 
  Camera, 
  Save, 
  X, 
  Plus,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const EditPersonnel: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [fullname, setFullname] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonnel = async () => {
      if (!id) {
        setError("No personnel ID provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setFullname(data.fullname);
        setPosition(data.position);
      }
      setLoading(false);
    };

    fetchPersonnel();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('personnel')
      .update({ fullname, position })
      .eq('id', id);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/personnel');
    }
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
            <h3 className="text-xl font-bold">Error</h3>
            <span>{error}</span>
            <button 
              onClick={() => navigate('/personnel')}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
            >
              Back to Personnel
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6">
        <nav className="flex items-center text-sm text-dark-muted">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Dashboard</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate('/personnel')} className="hover:text-primary transition-colors">Personnel</button>
          <span className="mx-2">/</span>
          <span className="text-white font-medium">Edit</span>
        </nav>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Edit Personnel</h1>
          <p className="text-dark-muted text-base max-w-3xl">Update the employee's information in the organization directory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 space-y-12">
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
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="e.g. Sarah Connor" 
                />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Position Title <span className="text-primary">*</span></label>
                <input 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="e.g. Senior Frontend Engineer" 
                />
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
            Cancel
          </button>
          <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : <><Save size={18} /><span>Save Changes</span></>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPersonnel;