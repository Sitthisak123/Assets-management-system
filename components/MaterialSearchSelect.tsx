import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Search, X } from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';

type MaterialOption = {
  id: number;
  title: string;
  quantity?: number;
  unit?: string;
};

type MaterialSearchSelectProps = {
  materials: MaterialOption[];
  value: number | null;
  disabledMaterialIds: Set<number>;
  onSelect: (materialId: number | null) => void;
  placeholder?: string;
  onOpenChange?: (open: boolean) => void;
};

const MaterialSearchSelect: React.FC<MaterialSearchSelectProps> = ({
  materials,
  value,
  disabledMaterialIds,
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

  const selectedMaterial = useMemo(() => {
    return materials.find((material) => material.id === value) || null;
  }, [materials, value]);

  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedMaterial?.title || '');
    }
  }, [isOpen, selectedMaterial]);

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
    if (!onOpenChange) return;
    onOpenChange(isOpen);
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

  const filteredMaterials = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const ranked = materials
      .map((material) => {
        const materialTitle = (material.title || '').toLowerCase();
        const materialId = String(material.id);

        if (!normalizedQuery) {
          return { material, score: 0 };
        }

        if (materialTitle === normalizedQuery || materialId === normalizedQuery) {
          return { material, score: 0 };
        }

        if (materialTitle.startsWith(normalizedQuery)) {
          return { material, score: 1 };
        }

        if (materialTitle.includes(normalizedQuery) || materialId.includes(normalizedQuery)) {
          return { material, score: 2 };
        }

        return { material, score: 99 };
      })
      .filter((item) => item.score < 99)
      .sort((a, b) => a.score - b.score || a.material.title.localeCompare(b.material.title));

    return ranked.map((item) => item.material);
  }, [materials, query]);

  const resolvedPlaceholder = placeholder ?? t('material_search_placeholder');

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
          className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-10 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
            title={t('material_clear_selected')}
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
          className="max-h-56 overflow-auto rounded-lg border border-dark-border bg-dark-bg shadow-2xl"
        >
          {filteredMaterials.length === 0 ? (
            <p className="px-3 py-2 text-sm text-dark-muted">{t('material_no_results')}</p>
          ) : (
            filteredMaterials.map((material) => {
              const isSelected = material.id === value;
              const isDisabled = disabledMaterialIds.has(material.id) && !isSelected;

              return (
                <button
                  key={material.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    onSelect(material.id);
                    setQuery(material.title);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left border-b border-dark-border/40 last:border-b-0 transition-colors ${
                    isDisabled
                      ? 'opacity-45 cursor-not-allowed text-dark-muted'
                      : isSelected
                        ? 'bg-primary/15 text-primary'
                        : 'text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate">{material.title}</span>
                    {isSelected && <Check size={14} />}
                  </div>
                  <div className="text-[11px] text-dark-muted">
                    SKU-{material.id}
                    {typeof material.quantity === 'number'
                      ? `  |  ${t('material_stock')}: ${material.quantity}${material.unit ? ` ${material.unit}` : ''}`
                      : ''}
                    {isDisabled ? `  |  ${t('material_already_selected')}` : ''}
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

export default MaterialSearchSelect;
