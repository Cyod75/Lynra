import { Columns, LayoutGrid, List } from 'lucide-react';
import useStore from '../store/useStore';

const modes = [
  { key: 'grid', label: 'Grid', Icon: LayoutGrid },
  { key: 'list', label: 'Lista', Icon: List },
  { key: 'kanban', label: 'Kanban', Icon: Columns },
];

export default function ViewToggle() {
  const { viewMode, setViewMode } = useStore();

  return (
    <div className="surface-panel flex items-center gap-1 p-1 rounded-lg">
      {modes.map(({ key, label, Icon }) => {
        const active = viewMode === key;
        return (
          <button
            key={key}
            id={`view-${key}`}
            onClick={() => setViewMode(key)}
            title={label}
            className="flex items-center justify-center gap-1.5 h-8 rounded-md transition-all duration-200 px-2"
            style={{
              minWidth: active ? '4.7rem' : '2rem',
              backgroundColor: active ? 'var(--app-accent)' : 'transparent',
              color: active ? '#fff' : 'var(--app-muted)',
              boxShadow: active ? '0 8px 18px var(--app-glow)' : 'none',
            }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {active && <span className="hidden sm:inline text-xs font-semibold">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
