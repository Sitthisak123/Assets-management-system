import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Search, X } from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';

type WorkplaceOption = {
  building?: string | null;
  room?: string | null;
} | null;

type UserOption = {
  id: number;
  fullname: string;
  display_name?: string | null;
  email?: string | null;
  position?: string | null;
  workplace?: WorkplaceOption;
  status?: number;
};

type UserSearchSelectProps = {
  users: UserOption[];
  value: number | null;
  onSelect: (userId: number | null) => void;
  placeholder?: string;
  onOpenChange?: (open: boolean) => void;
};

const getWorkplaceLabel = (user: UserOption) => {
  const building = user.workplace?.building?.trim();
  const room = user.workplace?.room?.trim();
  if (!building && !room) return '';
  return [building, room].filter(Boolean).join(' / ');
};

const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
  users,
  value,
  onSelect,
  placeholder,
  onOpenChange,
}) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    top: 0,
    left: 0,
    width: 0,
  });

  const getPrimaryLabel = (user: UserOption) => {
    const fullname = user.fullname?.trim();
    const displayName = user.display_name?.trim();
    return fullname || displayName || `${t('user')} #${user.id}`;
  };

  const getStatusLabel = (status?: number) => {
    if (status === 1) return t('status_active');
    if (status === 0) return t('status_inactive');
    if (status === -1) return t('status_suspended');
    return '';
  };

  const selectedUser = useMemo(() => {
    return users.find((user) => user.id === value) || null;
  }, [users, value]);

  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedUser ? getPrimaryLabel(selectedUser) : '');
    }
  }, [isOpen, selectedUser, t]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      const clickedInContainer = containerRef.current?.contains(targetNode);
      const clickedInDropdown = dropdownRef.current?.contains(targetNode);
      if (!clickedInContainer && !clickedInDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    return () => {
      onOpenChange?.(false);
    };
  }, [onOpenChange]);

  const recalculateDropdownPosition = () => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    recalculateDropdownPosition();

    const handleWindowChange = () => recalculateDropdownPosition();
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [isOpen]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const ranked = users
      .map((user) => {
        const primaryLabel = getPrimaryLabel(user).toLowerCase();
        const displayName = (user.display_name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const position = (user.position || '').toLowerCase();
        const workplace = getWorkplaceLabel(user).toLowerCase();
        const userId = String(user.id);

        if (!normalizedQuery) {
          return { user, score: 0 };
        }

        if (
          primaryLabel === normalizedQuery ||
          displayName === normalizedQuery ||
          email === normalizedQuery ||
          userId === normalizedQuery
        ) {
          return { user, score: 0 };
        }

        if (
          primaryLabel.startsWith(normalizedQuery) ||
          displayName.startsWith(normalizedQuery) ||
          email.startsWith(normalizedQuery)
        ) {
          return { user, score: 1 };
        }

        if (
          primaryLabel.includes(normalizedQuery) ||
          displayName.includes(normalizedQuery) ||
          email.includes(normalizedQuery) ||
          position.includes(normalizedQuery) ||
          workplace.includes(normalizedQuery) ||
          userId.includes(normalizedQuery)
        ) {
          return { user, score: 2 };
        }

        return { user, score: 99 };
      })
      .filter((item) => item.score < 99)
      .sort((a, b) => a.score - b.score || getPrimaryLabel(a.user).localeCompare(getPrimaryLabel(b.user)));

    return ranked.map((item) => item.user);
  }, [users, query, t]);

  const resolvedPlaceholder = placeholder ?? t('user_search_placeholder');

  return (
    <div className="relative z-40" ref={containerRef}>
      <div className="relative" ref={inputWrapRef}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
        <input
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          placeholder={resolvedPlaceholder}
          className="w-full bg-dark-bg border border-slate-700 rounded-lg pl-9 pr-10 py-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
        {value !== null && (
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white transition-colors"
            title={t('user_clear_selected')}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            width: dropdownStyle.width,
            zIndex: 9999,
          }}
          className="max-h-60 overflow-auto rounded-lg border border-dark-border bg-dark-bg shadow-2xl"
        >
          {filteredUsers.length === 0 ? (
            <p className="px-3 py-2 text-sm text-dark-muted">{t('user_no_results')}</p>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = user.id === value;
              const workplaceLabel = getWorkplaceLabel(user);
              const statusLabel = getStatusLabel(user.status);

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    onSelect(user.id);
                    setQuery(getPrimaryLabel(user));
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left border-b border-dark-border/40 last:border-b-0 transition-colors ${
                    isSelected ? 'bg-primary/15 text-primary' : 'text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate">{getPrimaryLabel(user)}</span>
                    {isSelected && <Check size={14} />}
                  </div>
                  <div className="text-[11px] text-dark-muted">
                    ID-{user.id}
                    {user.position ? `  |  ${user.position}` : ''}
                    {user.email ? `  |  ${user.email}` : ''}
                    {workplaceLabel ? `  |  ${workplaceLabel}` : ''}
                    {statusLabel ? `  |  ${statusLabel}` : ''}
                  </div>
                </button>
              );
            })
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserSearchSelect;
