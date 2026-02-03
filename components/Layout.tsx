
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { authService } from '../src/services/authService';
import { Search, Bell, HelpCircle, ChevronDown, Menu, LogOut } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = location.pathname.split('/')[1];
  const capitalizedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-dark-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md z-10 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-dark-muted hover:text-white transition-colors">
              <Menu size={24} />
            </button>
            <h2 className="text-white text-lg font-bold tracking-tight">{capitalizedTitle || 'Dashboard'}</h2>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden md:flex items-center bg-dark-surface rounded-lg px-3 py-2 w-64 border border-dark-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <Search size={18} className="text-dark-muted" />
              <input 
                className="bg-transparent border-none text-sm text-white placeholder-dark-muted focus:ring-0 w-full ml-2 p-0 h-auto leading-none" 
                placeholder="Search..." 
                type="text" 
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-full hover:bg-dark-surface transition-colors text-dark-muted hover:text-white">
                <Bell size={20} />
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-dark-bg"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-dark-surface transition-colors text-dark-muted hover:text-white hidden sm:block">
                <HelpCircle size={20} />
              </button>
              
              <div className="h-6 w-[1px] bg-dark-border mx-1 hidden sm:block"></div>
              
              <div 
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className="flex items-center gap-3 group">
                  <div className="relative">
                    <div 
                      className="bg-center bg-no-repeat bg-cover rounded-full size-8 bg-slate-700 ring-2 ring-transparent group-hover:ring-primary/50 transition-all" 
                      style={{ backgroundImage: 'url("https://picsum.photos/seed/admin/100/100")' }}
                    ></div>
                    <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-dark-bg"></div>
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors leading-tight">Admin User</span>
                    <span className="text-[10px] text-dark-muted uppercase tracking-wider font-semibold">Manager</span>
                  </div>
                  <ChevronDown size={16} className="text-dark-muted hidden sm:block group-hover:text-white transition-colors" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-dark-surface rounded-lg shadow-lg border border-dark-border py-1">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
