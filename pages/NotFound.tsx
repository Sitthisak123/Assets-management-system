
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bug, AlertCircle, Terminal } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-8 relative overflow-hidden animate-in fade-in duration-700">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 px-4 max-w-[1100px] relative z-10">
        <div className="relative group">
          <div className="relative z-10 bg-slate-800 rounded-3xl w-[260px] h-[260px] md:w-[420px] md:h-[420px] flex items-center justify-center border border-dark-border shadow-2xl">
            <AlertCircle size={120} className="text-dark-muted opacity-20" />
            <span className="absolute text-[120px] font-black text-white/5 select-none">404</span>
          </div>
          <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[80px] rounded-full -z-10 pointer-events-none opacity-60"></div>
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-[500px] gap-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-surface border border-dark-border shadow-sm w-fit mx-auto md:mx-0">
              <AlertCircle size={18} className="text-primary" />
              <span className="text-slate-300 text-xs font-bold tracking-widest uppercase">Page Error</span>
            </div>
            <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-none tracking-tight">
              404 Not Found
            </h1>
            <p className="text-dark-muted text-lg md:xl font-medium leading-relaxed">
              The resource you requested is unavailable.
            </p>
          </div>
          
          <div className="h-px w-full bg-dark-border"></div>
          
          <p className="text-slate-500 text-base font-normal leading-relaxed">
            We couldn't locate the personnel record or material requisition you're looking for. It may have been moved, deleted, or the ID is incorrect.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full pt-2">
            <button 
              onClick={() => navigate('/')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary hover:bg-primary-dark text-white text-sm font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              <ArrowLeft size={20} />
              <span>Return to Dashboard</span>
            </button>
            <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg h-12 px-8 bg-dark-surface hover:bg-slate-700 border border-dark-border text-slate-200 text-sm font-bold tracking-wide transition-all">
              <Bug size={20} />
              <span>Report Issue</span>
            </button>
          </div>

          <div className="mt-4 pt-6 w-full flex items-center gap-3 text-xs font-mono text-slate-600 border-t border-dark-border/50">
            <Terminal size={16} />
            <span>Reference: SYSTEM_ERR_MISSING_#8X92</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
