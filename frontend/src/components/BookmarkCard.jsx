import { useState } from 'react';
import { ExternalLink, Star, Trash2, Edit2, Globe, GripVertical } from 'lucide-react';
import useStore from '../store/useStore';
import { visitBookmark } from '../api/client';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function FaviconImg({ src, title }) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: 'var(--app-surface-2)' }}>
      <Globe className="w-3.5 h-3.5" style={{ color: 'var(--app-faint)' }} />
    </div>
  );
  return <img src={src} alt={title} className="w-6 h-6 rounded-md object-contain flex-shrink-0" onError={() => setErr(true)} />;
}

export default function BookmarkCard({ bookmark, onEdit, viewMode, dragListeners }) {
  const { removeBookmark, editBookmark } = useStore();
  const [deleting, setDeleting] = useState(false);

  const handleOpen = async () => {
    try { await visitBookmark(bookmark.id); } catch {}
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${bookmark.title}"?`)) return;
    setDeleting(true);
    try { await removeBookmark(bookmark.id); }
    catch (err) { alert(err.message); setDeleting(false); }
  };

  const handleFavorite = async () => {
    try { await editBookmark(bookmark.id, { is_favorite: !bookmark.is_favorite }); }
    catch (err) { alert(err.message); }
  };

  // ── List view ─────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div className={`card flex items-center gap-3 px-4 py-3 group ${deleting ? 'opacity-40 pointer-events-none' : ''}`}
        style={{ borderRadius: '0.75rem' }}>
        {dragListeners && (
          <button {...dragListeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity touch-none p-1 rounded"
            style={{ color: 'var(--app-faint)' }} tabIndex={-1}>
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <FaviconImg src={bookmark.favicon} title={bookmark.title} />
        <div className="flex-1 min-w-0">
          <button onClick={handleOpen}
            className="text-sm font-medium text-left truncate block w-full transition-colors hover:opacity-70"
            style={{ color: 'var(--app-text)' }}>
            {bookmark.title || bookmark.url}
          </button>
          <span className="text-xs truncate block" style={{ color: 'var(--app-faint)' }}>{bookmark.url}</span>
        </div>
        {bookmark.collection_name && (
          <span className="hidden sm:flex items-center gap-1 text-xs flex-shrink-0" style={{ color: 'var(--app-muted)' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bookmark.collection_color || '#7c3aed' }} />
            {bookmark.collection_name}
          </span>
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          {bookmark.tags?.slice(0, 2).map((t) => <span key={t.id} className="tag-chip">{t.name}</span>)}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={handleFavorite} className="btn-ghost p-1.5 rounded-lg"
            style={{ color: bookmark.is_favorite ? '#eab308' : undefined }}>
            <Star className="w-4 h-4" fill={bookmark.is_favorite ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onEdit(bookmark)} className="btn-ghost p-1.5 rounded-lg"><Edit2 className="w-4 h-4" /></button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  // ── Grid / Kanban card ────────────────────────────────
  return (
    <div className={`card flex flex-col p-4 group ${deleting ? 'opacity-40 pointer-events-none' : ''}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <FaviconImg src={bookmark.favicon} title={bookmark.title} />
        <div className="flex-1 min-w-0">
          <button onClick={handleOpen}
            className="text-sm font-semibold text-left line-clamp-2 leading-snug w-full flex items-start gap-1 transition-colors"
            style={{ color: 'var(--app-text)' }}>
            <span className="flex-1">{bookmark.title || bookmark.url}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5 opacity-30" />
          </button>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--app-faint)' }}>
            {(() => { try { return new URL(bookmark.url).hostname; } catch { return bookmark.url; } })()}
          </p>
        </div>
        {/* Drag handle */}
        {dragListeners && (
          <button {...dragListeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity touch-none p-1 rounded flex-shrink-0"
            style={{ color: 'var(--app-faint)' }} tabIndex={-1}>
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Description */}
      {bookmark.description && (
        <p className="text-xs line-clamp-2 mb-3 leading-relaxed flex-1" style={{ color: 'var(--app-muted)' }}>
          {bookmark.description}
        </p>
      )}

      {/* Tags */}
      {bookmark.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {bookmark.tags.slice(0, 4).map((t) => <span key={t.id} className="tag-chip">{t.name}</span>)}
          {bookmark.tags.length > 4 && <span className="tag-chip">+{bookmark.tags.length - 4}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-auto"
        style={{ borderTop: '1px solid var(--app-border)' }}>
        <div className="flex items-center gap-2 min-w-0">
          {bookmark.collection_name && (
            <span className="flex items-center gap-1 text-xs truncate" style={{ color: 'var(--app-muted)' }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: bookmark.collection_color || '#7c3aed' }} />
              <span className="truncate">{bookmark.collection_name}</span>
            </span>
          )}
          <span className="text-xs flex-shrink-0" style={{ color: 'var(--app-faint)' }}>
            {formatDate(bookmark.created_at)}
          </span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={handleFavorite} className="btn-ghost p-1.5 rounded-lg"
            style={{ color: bookmark.is_favorite ? '#eab308' : undefined }}>
            <Star className="w-3.5 h-3.5" fill={bookmark.is_favorite ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onEdit(bookmark)} className="btn-ghost p-1.5 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger p-1.5 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
}
