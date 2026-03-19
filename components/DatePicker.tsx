import React from 'react';
import { CalendarDays, RotateCcw, X } from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';

type DatePickerProps = {
  value: string;
  onChange: (nextValue: string) => void;
  id?: string;
  name?: string;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  showQuickActions?: boolean;
  clearable?: boolean;
  ariaLabel?: string;
};

const getTodayValue = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  id,
  name,
  min,
  max,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  showQuickActions = true,
  clearable = true,
  ariaLabel,
}) => {
  const { t } = useLanguage();
  const baseInputClassName = 'w-full bg-dark-bg border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed';
  const formatLabelDate = (dateValue: string) => {
    if (!dateValue) return t('datepicker_no_date_selected');
    const parsed = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return t('datepicker_invalid_date');
    return parsed.toLocaleDateString();
  };

  return (
    <div className={className}>
      <div className="relative group">
        <CalendarDays
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors pointer-events-none"
        />
        <input
          type="date"
          id={id}
          name={name}
          value={value}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value)}
          className={`date-picker-input ${baseInputClassName} ${inputClassName}`.trim()}
        />
      </div>

      {showQuickActions && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs text-dark-muted truncate">{formatLabelDate(value)}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(getTodayValue())}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-dark-border text-dark-muted hover:text-white hover:border-primary/50 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={12} />
              <span>{t('datepicker_today')}</span>
            </button>
            {clearable && !required && (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={disabled || !value}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-dark-border text-dark-muted hover:text-white hover:border-primary/50 transition-colors disabled:opacity-50"
              >
                <X size={12} />
                <span>{t('common_clear')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
