import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Select custom sombre, cohérent avec le thème
// Props: value, onChange(value), options: [{value, label, icon?}], placeholder?
const Select = ({ value, onChange, options, placeholder = 'Sélectionner', className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = useMemo(() => options.find(o => o.value === value), [options, value]);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-b from-white/[0.04] to-white/[0.02] border border-white/10 text-white text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 hover:border-white/20 transition-all flex items-center justify-between"
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.icon && <span className="shrink-0">{selected.icon}</span>}
          <span className="truncate">{selected?.label || placeholder}</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[70] mt-2 w-full rounded-xl bg-[#0b0b11]/95 border border-white/10 shadow-lg backdrop-blur-md max-h-64 overflow-auto"
            role="listbox"
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm ${
                    opt.value === value ? 'bg-white/[0.06] text-white' : 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  role="option"
                  aria-selected={opt.value === value}
                >
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;


