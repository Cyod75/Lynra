import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart2, Bookmark, Columns, Grid3X3, List, Plus, Search,
  Sparkles, Star, Upload, X,
} from 'lucide-react';
import useStore from '../store/useStore';

export default function CommandPalette({ onNavigate }) {
  const {
    collections, tags, setActiveCollection, setActiveTag,
    setShowFavoritesOnly, setViewMode,
  } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      const isCommand = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      if (isCommand) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const actions = useMemo(() => {
    const base = [
      {
        label: 'Añadir enlace',
        hint: 'Crear un nuevo bookmark',
        icon: Plus,
        run: () => window.dispatchEvent(new CustomEvent('lynra:new-bookmark')),
      },
      {
        label: 'Buscar en Lynra',
        hint: 'Filtra tus enlaces al instante',
        icon: Search,
        run: () => document.getElementById('search-input')?.focus(),
      },
      {
        label: 'Todos los enlaces',
        hint: 'Volver a la biblioteca completa',
        icon: Bookmark,
        run: () => {
          setActiveCollection(null); setActiveTag(null); setShowFavoritesOnly(false); onNavigate('home');
        },
      },
      {
        label: 'Favoritos',
        hint: 'Ver enlaces marcados',
        icon: Star,
        run: () => { setShowFavoritesOnly(true); onNavigate('home'); },
      },
      { label: 'Vista grid', hint: 'Tarjetas visuales', icon: Grid3X3, run: () => setViewMode('grid') },
      { label: 'Vista lista', hint: 'Exploración compacta', icon: List, run: () => setViewMode('list') },
      { label: 'Vista kanban', hint: 'Organizar por colecciones', icon: Columns, run: () => setViewMode('kanban') },
      { label: 'Estadísticas', hint: 'Actividad y tendencias', icon: BarChart2, run: () => onNavigate('stats') },
      { label: 'Importar / Exportar', hint: 'Migrar o respaldar datos', icon: Upload, run: () => onNavigate('import') },
    ];

    const collectionActions = collections.slice(0, 8).map((collection) => ({
      label: collection.name,
      hint: 'Abrir colección',
      icon: Sparkles,
      color: collection.color,
      run: () => { setActiveCollection(collection.id); onNavigate('home'); },
    }));

    const tagActions = tags.slice(0, 8).map((tag) => ({
      label: `#${tag.name}`,
      hint: `${tag.usage_count} usos`,
      icon: Search,
      run: () => { setActiveTag(tag.name); onNavigate('home'); },
    }));

    return [...base, ...collectionActions, ...tagActions];
  }, [collections, tags, onNavigate, setActiveCollection, setActiveTag, setShowFavoritesOnly, setViewMode]);

  const filtered = actions.filter((item) => {
    const text = `${item.label} ${item.hint}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const execute = (item) => {
    item.run();
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((v) => Math.min(v + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((v) => Math.max(v - 1, 0));
    }
    if (e.key === 'Enter' && filtered[active]) {
      e.preventDefault();
      execute(filtered[active]);
    }
  };

  if (!open) return null;

  return (
    <div className="command-overlay" onMouseDown={() => setOpen(false)}>
      <div className="command-box" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <Search className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Busca acciones, colecciones o tags..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--app-text)' }}
          />
          <button className="btn-ghost p-1.5" onClick={() => setOpen(false)} title="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[22rem] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm px-3 py-8 text-center" style={{ color: 'var(--app-faint)' }}>
              No hay acciones para esa búsqueda.
            </p>
          ) : filtered.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.label}-${index}`}
                className={`command-item ${index === active ? 'active' : ''}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => execute(item)}
              >
                <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--app-surface-2)', color: item.color || 'var(--app-accent)' }}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold truncate">{item.label}</span>
                  <span className="block text-xs truncate" style={{ color: 'var(--app-faint)' }}>{item.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-2 text-[11px]"
          style={{ borderTop: '1px solid var(--app-border)', color: 'var(--app-faint)' }}>
          <span>Enter para ejecutar</span>
          <span>Ctrl K para abrir</span>
        </div>
      </div>
    </div>
  );
}
