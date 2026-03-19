import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const labelMap: Record<string, string> = {
    dashboard: t('dashboard'),
    personnel: t('personnel'),
    materials: t('inventory'),
    requisitions: t('requisitions'),
    users: t('users'),
    workplaces: t('workplaces'),
    settings: t('settings'),
    create: t('create'),
    edit: t('edit'),
    view: t('view'),
    slip: t('slip'),
    types: t('material_types'),
  };

  return (
    <nav className="flex items-center text-sm font-medium">
      <Link to="/" className="text-dark-muted hover:text-primary transition-colors">{t('home')}</Link>
      <ChevronRight size={16} className="text-slate-400 mx-2" />
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        // Check if the path segment is a number (e.g., an ID)
        if (!isNaN(Number(name))) {
          return null; // Don't display numeric IDs in the breadcrumb
        }
        const label = labelMap[name] || capitalize(name);
        return isLast ? (
          <span key={name} className="text-white bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded text-xs tracking-wide uppercase">
            {label}
          </span>
        ) : (
          <React.Fragment key={name}>
            <Link to={routeTo} className="text-dark-muted hover:text-primary transition-colors">
              {label}
            </Link>
            <ChevronRight size={16} className="text-slate-400 mx-2" />
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
