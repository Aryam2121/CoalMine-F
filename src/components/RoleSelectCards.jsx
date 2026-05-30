import React from 'react';
import { ROLE_CATALOG, getRoleAccessList } from '../utils/roles';
import { Check } from 'lucide-react';

/** Pickable roles for self-registration (excludes admin tiers) */
const RoleSelectCards = ({ value, onChange, name = 'role', showAccessForSelected = true }) => {
  const options = ROLE_CATALOG.filter((r) => r.signup);
  const selectedInfo = options.find((o) => o.value === value);
  const accessList = value && showAccessForSelected ? getRoleAccessList(value) : [];

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Select your role">
      <span className="text-sm font-medium text-slate-300">Your role *</span>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                selected
                  ? 'border-amber-500/80 bg-amber-500/10 ring-1 ring-amber-500/30 shadow-sm shadow-amber-500/10'
                  : 'border-slate-600/80 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/70'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span className="block font-semibold text-white text-sm">{opt.label}</span>
              <span className="mt-1 block text-xs text-slate-400 leading-snug">{opt.description}</span>
            </label>
          );
        })}
      </div>

      {showAccessForSelected && selectedInfo && accessList.length > 0 && (
        <div className="rounded-xl border border-slate-700/80 bg-slate-800/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-2">
            What {selectedInfo.label} can access
          </p>
          <ul className="space-y-1.5">
            {accessList.map((line) => (
              <li key={line} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
                <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Mine Admin and Super Admin are assigned by your organization — not available at signup.
      </p>
    </div>
  );
};

export default RoleSelectCards;
