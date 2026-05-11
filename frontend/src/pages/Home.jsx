import { useEffect, useMemo, useState } from 'react';
import { BookMarked, Command, Focus, Plus, Sparkles, Star, Tags, TrendingUp, Wand2 } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, sortableKeyboardCoordinates,
  rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import useStore from '../store/useStore';
import BookmarkCard from '../components/BookmarkCard';
import BookmarkForm from '../components/BookmarkForm';
import ViewToggle from '../components/ViewToggle';
import SearchBar from '../components/SearchBar';

function SortableCard({ bookmark, onEdit, viewMode, index }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 220ms cubic-bezier(0.25, 1, 0.5, 1)',
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.45 : 1,
    '--i': index,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BookmarkCard bookmark={bookmark} onEdit={onEdit} viewMode={viewMode} dragListeners={listeners} index={index} />
    </div>
  );
}

function BookmarkSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="card px-4 py-3 flex items-center gap-3">
        <div className="skeleton w-8 h-8 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-2.5 w-3/4 rounded" />
        </div>
        <div className="skeleton h-7 w-20 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-4">
      <div className="flex gap-3">
        <div className="skeleton w-9 h-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-4/5 rounded" />
          <div className="skeleton h-2.5 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-2.5 w-full rounded" />
        <div className="skeleton h-2.5 w-2/3 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-md" />
        <div className="skeleton h-6 w-20 rounded-md" />
      </div>
    </div>
  );
}

export default function Home() {
  const {
    bookmarks, fetchBookmarks, loading,
    viewMode, collections, activeCollection,
    activeTag, searchQuery, showFavoritesOnly,
    setActiveCollection,
  } = useStore();

  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => { setItems(bookmarks); }, [bookmarks]);

  useEffect(() => {
    fetchBookmarks();
  }, [activeCollection, activeTag, searchQuery, showFavoritesOnly]);

  useEffect(() => {
    const openNewBookmark = () => { setEditData(null); setShowForm(true); };
    window.addEventListener('lynra:new-bookmark', openNewBookmark);
    return () => window.removeEventListener('lynra:new-bookmark', openNewBookmark);
  }, []);

  const openEdit = (b) => { setEditData(b); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditData(null); };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIdx = prev.findIndex((b) => b.id === active.id);
      const newIdx = prev.findIndex((b) => b.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const handleDragCancel = () => setActiveId(null);
  const isEmpty = !loading && items.length === 0;

  const kanbanGroups = () => {
    const map = {};
    const uncol = [];
    items.forEach((b) => {
      if (b.collection_id) {
        if (!map[b.collection_id]) map[b.collection_id] = [];
        map[b.collection_id].push(b);
      } else {
        uncol.push(b);
      }
    });
    const cols = collections.filter((c) => map[c.id]).map((c) => ({ ...c, items: map[c.id] }));
    if (uncol.length) cols.push({ id: null, name: 'Sin colección', color: '#70708a', items: uncol });
    return cols;
  };

  const pageTitle = showFavoritesOnly ? 'Favoritos'
    : activeTag ? `#${activeTag}`
    : activeCollection ? (collections.find((c) => c.id === activeCollection)?.name || 'Colección')
    : searchQuery ? `"${searchQuery}"`
    : 'Todos los enlaces';

  const activeBookmark = activeId ? items.find((b) => b.id === activeId) : null;

  const insights = useMemo(() => {
    const favoriteCount = items.filter((b) => b.is_favorite).length;
    const tagCount = new Set(items.flatMap((b) => b.tags?.map((t) => t.name) || [])).size;
    const totalVisits = items.reduce((sum, b) => sum + Number(b.visits || 0), 0);
    return { favoriteCount, tagCount, totalVisits };
  }, [items]);

  return (
    <div className="flex flex-col h-full">
      <div className="page-hero mb-5 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between relative z-[1]">
          <div>
            <div className="quick-chip mb-3">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--app-accent)' }} />
              Biblioteca inteligente
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--app-text)' }}>
              {pageTitle}
            </h1>
            <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--app-muted)' }}>
              Guarda, redescubre y organiza tus mejores recursos con una experiencia rápida y visual.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="hero-action" onClick={() => window.dispatchEvent(new CustomEvent('lynra:open-command'))}>
                <Command className="w-4 h-4" />
                Pulsa Control + K para abrir comandos
              </button>
              <button className="hero-action" onClick={() => document.body.classList.toggle('lynra-cinema')}>
                <Focus className="w-4 h-4" />
                Modo visual
              </button>
              <button className="hero-action" onClick={() => window.dispatchEvent(new CustomEvent('lynra:new-bookmark'))}>
                <Wand2 className="w-4 h-4" />
                Crear enlace
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="quick-chip"><BookMarked className="w-3.5 h-3.5" />{items.length} enlaces</span>
            <span className="quick-chip"><Star className="w-3.5 h-3.5" />{insights.favoriteCount} favoritos</span>
            <span className="quick-chip"><Tags className="w-3.5 h-3.5" />{insights.tagCount} tags</span>
            <span className="quick-chip"><TrendingUp className="w-3.5 h-3.5" />{insights.totalVisits} visitas</span>
          </div>
        </div>
      </div>

      <div className="surface-panel sticky top-0 z-20 rounded-xl p-3 mb-5 flex items-center gap-3 flex-wrap">
        <SearchBar />
        <ViewToggle />
        <button id="add-bookmark-btn" onClick={() => { setEditData(null); setShowForm(true); }} className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Añadir</span>
        </button>
      </div>

      {collections.length > 0 && !loading && (
        <div className="collection-spectrum mb-5">
          {collections.slice(0, 10).map((collection, index) => (
            <button
              key={collection.id}
              className={`spectrum-item ${activeCollection === collection.id ? 'active' : ''}`}
              onClick={() => setActiveCollection(collection.id)}
              style={{ '--collection-color': collection.color || 'var(--app-accent)', '--i': index }}
            >
              <span className="spectrum-dot" />
              <span className="truncate">{collection.name}</span>
              <strong>{collection.bookmark_count}</strong>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className={viewMode === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}>
          {Array.from({ length: viewMode === 'list' ? 6 : 8 }).map((_, i) => (
            <BookmarkSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="page-hero flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center animate-pulse-dot"
            style={{ background: 'var(--app-accent-gradient)', boxShadow: '0 18px 50px var(--app-glow)' }}>
            <BookMarked className="w-9 h-9 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: 'var(--app-text)' }}>
              {searchQuery || activeTag ? 'Sin resultados' : 'Tu biblioteca está lista'}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--app-faint)' }}>
              {searchQuery || activeTag
                ? 'Prueba con otros términos o cambia de filtro.'
                : 'Añade el primer enlace y Lynra empezará a tomar forma.'}
            </p>
          </div>
          {!searchQuery && !activeTag && (
            <button onClick={() => { setEditData(null); setShowForm(true); }} className="btn-primary mt-2">
              <Plus className="w-4 h-4" /> Añadir primer enlace
            </button>
          )}
        </div>
      )}

      {!loading && !isEmpty && viewMode === 'grid' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <SortableContext items={items.map((b) => b.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((b, index) => (
                <SortableCard key={b.id} bookmark={b} onEdit={openEdit} viewMode="grid" index={index} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay adjustScale={false}>
            {activeBookmark && (
              <div style={{ transform: 'rotate(2deg) scale(1.02)', pointerEvents: 'none', opacity: 0.9 }}>
                <BookmarkCard bookmark={activeBookmark} onEdit={() => {}} viewMode="grid" />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {!loading && !isEmpty && viewMode === 'list' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <SortableContext items={items.map((b) => b.id)} strategy={rectSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((b, index) => (
                <SortableCard key={b.id} bookmark={b} onEdit={openEdit} viewMode="list" index={index} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeBookmark && (
              <div style={{ opacity: 0.9, pointerEvents: 'none' }}>
                <BookmarkCard bookmark={activeBookmark} onEdit={() => {}} viewMode="list" />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {!loading && !isEmpty && viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '200px' }}>
          {kanbanGroups().map((col) => (
            <div key={col.id ?? 'none'} className="flex-shrink-0 w-72">
              <div className="surface-panel flex items-center gap-2 mb-3 px-3 py-2 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.color }} />
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--app-text-2)' }}>
                  {col.name}
                </span>
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: 'var(--app-surface-2)', color: 'var(--app-faint)' }}>
                  {col.items.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {col.items.map((b, index) => (
                  <BookmarkCard key={b.id} bookmark={b} onEdit={openEdit} viewMode="grid" index={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <BookmarkForm onClose={closeForm} editData={editData} />}
    </div>
  );
}
