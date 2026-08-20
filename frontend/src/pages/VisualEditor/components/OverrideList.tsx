import { Trash2 } from 'lucide-react';
import { SYSTEM_TEXTS } from '../../../i18n/system.ts';
import { SYSTEM_THEME } from '../../../theme/system.ts';
import type { VisualOverride } from '../contracts/visualEditor.types.ts';
import { getVisualSurface } from '../registry/visualEditor.registry.ts';

interface OverrideListProps {
  overrides: VisualOverride[];
  onRemove: (override: VisualOverride) => void;
}

export function OverrideList({ overrides, onRemove }: OverrideListProps) {
  if (overrides.length === 0) {
    return <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-400">{SYSTEM_TEXTS.visualEditor.emptyOverrides}</p>;
  }

  return (
    <ul className="space-y-2" aria-label={SYSTEM_TEXTS.visualEditor.overrideCount(overrides.length)}>
      {overrides.map((override) => (
        <li key={`${override.uiKey}:${override.property}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <span className="min-w-0 text-xs">
            <span className="block truncate font-bold text-slate-200">{getVisualSurface(override.uiKey)?.label ?? override.uiKey}</span>
            <span className="mt-1 block truncate text-slate-400">{SYSTEM_TEXTS.visualEditor.properties[override.property]}: {override.value}</span>
          </span>
          <button
            type="button"
            className={SYSTEM_THEME.visualEditor.button}
            onClick={() => onRemove(override)}
            aria-label={`${SYSTEM_TEXTS.visualEditor.remove}: ${override.property}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
