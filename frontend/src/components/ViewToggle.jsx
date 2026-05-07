import { LayoutGrid, List, Columns } from 'lucide-react';
import useStore from '../store/useStore';

const modes = [
  { key: 'grid',   label: 'Grid',   Icon: LayoutGrid },
  { key: 'list',   label: 'Lista',  Icon: List },
  { key: 'kanban', label: 'Kanban', Icon: Columns },
];

export default function ViewToggle() {
  const { viewMode, setViewMode } = useStore();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg"
      style={{ backgroundColor: 'var(--app-surface-2)', border: '1px solid var(--app-border)' }}>
      {modes.map(({ key, label, Icon }) => (
        <button
          key={key}
          id={`view-${key}`}
          onClick={() => setViewMode(key)}
          title={label}
          className="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150"
          style={{
            backgroundColor: viewMode === key ? 'var(--app-accent)' : 'transparent',
            color: viewMode === key ? '#fff' : 'var(--app-muted)',
            boxShadow: viewMode === key ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
