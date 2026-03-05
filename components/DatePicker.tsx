import React from 'react';
import { CalendarDays, RotateCcw, X } from 'lucide-react';

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

const formatLabelDate = (value: string) => {
  if (!value) return 'No date selected';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 'Invalid date';
  return parsed.toLocaleDateString();
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
  const baseInputClassName = 'w-full bg-dark-bg border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed';

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
              <span>Today</span>
            </button>
            {clearable && !required && (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={disabled || !value}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-dark-border text-dark-muted hover:text-white hover:border-primary/50 transition-colors disabled:opacity-50"
              >
                <X size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
