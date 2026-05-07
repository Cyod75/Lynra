import { useEffect, useState } from 'react';
import { Plus, BookMarked, Loader2 } from 'lucide-react';
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

// ── Sortable wrapper for each card ───────────────────────
function SortableCard({ bookmark, onEdit, viewMode }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.45 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BookmarkCard bookmark={bookmark} onEdit={onEdit} viewMode={viewMode} dragListeners={listeners} />
    </div>
  );
}

// ── Home page ────────────────────────────────────────────
export default function Home() {
  const {
    bookmarks, fetchBookmarks, loading,
    viewMode, collections, activeCollection,
    activeTag, searchQuery, showFavoritesOnly,
  } = useStore();

  const [items,     setItems]     = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [editData,  setEditData]  = useState(null);
  const [activeId,  setActiveId]  = useState(null); // for DragOverlay

  // Sync store → local items
  useEffect(() => { setItems(bookmarks); }, [bookmarks]);

  useEffect(() => {
    fetchBookmarks();
  }, [activeCollection, activeTag, searchQuery, showFavoritesOnly]);

  const openEdit  = (b) => { setEditData(b); setShowForm(true); };
  const closeForm = () =>  { setShowForm(false); setEditData(null); };

  // DnD sensors — pointer + keyboard accessible
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

  // ── Kanban grouping ──────────────────────────────────
  const kanbanGroups = () => {
    const map = {};
    const uncol = [];
    items.forEach((b) => {
      if (b.collection_id) {
        if (!map[b.collection_id]) map[b.collection_id] = [];
        map[b.collection_id].push(b);
      } else { uncol.push(b); }
    });
    const cols = collections.filter((c) => map[c.id]).map((c) => ({ ...c, items: map[c.id] }));
    if (uncol.length) cols.push({ id: null, name: 'Sin colección', color: '#70708a', items: uncol });
    return cols;
  };

  // Page title
  const pageTitle = showFavoritesOnly ? 'Favoritos'
    : activeTag ? `#${activeTag}`
    : activeCollection ? (collections.find((c) => c.id === activeCollection)?.name || 'Colección')
    : searchQuery ? `"${searchQuery}"`
    : 'Todos los enlaces';

  const activeBookmark = activeId ? items.find((b) => b.id === activeId) : null;

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ─────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <SearchBar />
        <ViewToggle />
        <button id="add-bookmark-btn" onClick={() => { setEditData(null); setShowForm(true); }} className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Añadir</span>
        </button>
      </div>

      {/* ── Heading ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--app-text)' }}>{pageTitle}</h1>
        {!loading && (
          <span className="text-xs" style={{ color: 'var(--app-faint)' }}>
            {items.length} {items.length === 1 ? 'enlace' : 'enlaces'}
          </span>
        )}
      </div>

      {/* ── Loading ─────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--app-accent)' }} />
        </div>
      )}

      {/* ── Empty state ──────────────────────────── */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--app-surface-2)', border: '1px solid var(--app-border)' }}>
            <BookMarked className="w-7 h-7" style={{ color: 'var(--app-faint)' }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--app-text-2)' }}>
              {searchQuery || activeTag ? 'Sin resultados' : 'No hay bookmarks aún'}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--app-faint)' }}>
              {searchQuery || activeTag
                ? 'Prueba con otros términos'
                : 'Pulsa "Añadir" para guardar tu primer enlace'}
            </p>
          </div>
          {!searchQuery && !activeTag && (
            <button onClick={() => { setEditData(null); setShowForm(true); }} className="btn-primary mt-2">
              <Plus className="w-4 h-4" /> Añadir primer enlace
            </button>
          )}
        </div>
      )}

      {/* ── Grid view with DnD ──────────────────── */}
      {!loading && !isEmpty && viewMode === 'grid' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <SortableContext items={items.map((b) => b.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((b) => (
                <SortableCard key={b.id} bookmark={b} onEdit={openEdit} viewMode="grid" />
              ))}
            </div>
          </SortableContext>
          {/* Ghost card while dragging */}
          <DragOverlay adjustScale={false}>
            {activeBookmark && (
              <div style={{ transform: 'rotate(2deg) scale(1.02)', pointerEvents: 'none', opacity: 0.9 }}>
                <BookmarkCard bookmark={activeBookmark} onEdit={() => {}} viewMode="grid" />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── List view with DnD ──────────────────── */}
      {!loading && !isEmpty && viewMode === 'list' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <SortableContext items={items.map((b) => b.id)} strategy={rectSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((b) => (
                <SortableCard key={b.id} bookmark={b} onEdit={openEdit} viewMode="list" />
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

      {/* ── Kanban view ──────────────────────────── */}
      {!loading && !isEmpty && viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '200px' }}>
          {kanbanGroups().map((col) => (
            <div key={col.id ?? 'none'} className="flex-shrink-0 w-72">
              <div className="flex items-center gap-2 mb-3 px-1">
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
                {col.items.map((b) => (
                  <BookmarkCard key={b.id} bookmark={b} onEdit={openEdit} viewMode="grid" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bookmark form modal ───────────────────── */}
      {showForm && <BookmarkForm onClose={closeForm} editData={editData} />}
    </div>
  );
}
