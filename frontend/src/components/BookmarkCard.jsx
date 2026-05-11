import { useMemo, useState } from 'react';
import {
  Check, Copy, ExternalLink, Globe, GripVertical, MousePointer2,
  Pencil, Star, Trash2,
} from 'lucide-react';
import useStore from '../store/useStore';
import { visitBookmark } from '../api/client';
import { toast } from './Toaster';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function FaviconImg({ src, title }) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: 'var(--app-surface-2)' }}>
      <Globe className="w-4 h-4" style={{ color: 'var(--app-faint)' }} />
    </div>
  );
  return <img src={src} alt={title} className="w-9 h-9 rounded-xl object-contain flex-shrink-0 p-1"
    style={{ backgroundColor: 'var(--app-surface-2)' }} onError={() => setErr(true)} />;
}

export default function BookmarkCard({ bookmark, onEdit, viewMode, dragListeners, index = 0 }) {
  const { removeBookmark, editBookmark } = useStore();
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const domain = useMemo(() => getDomain(bookmark.url), [bookmark.url]);
  const accent = bookmark.collection_color || (bookmark.is_favorite ? '#eab308' : 'var(--app-accent)');

  const handleOpen = async () => {
    try { await visitBookmark(bookmark.id); } catch {}
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${bookmark.title}"?`)) return;
    setDeleting(true);
    try {
      await removeBookmark(bookmark.id);
      toast({ title: 'Enlace eliminado', message: bookmark.title || domain, type: 'success' });
    }
    catch (err) {
      toast({ title: 'No se pudo eliminar', message: err.message, type: 'error' });
      setDeleting(false);
    }
  };

  const handleFavorite = async () => {
    try {
      await editBookmark(bookmark.id, { is_favorite: !bookmark.is_favorite });
      toast({
        title: bookmark.is_favorite ? 'Quitado de favoritos' : 'Añadido a favoritos',
        message: bookmark.title || domain,
        type: 'success',
      });
    }
    catch (err) { toast({ title: 'No se pudo actualizar', message: err.message, type: 'error' }); }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      setCopied(true);
      toast({ title: 'Enlace copiado', message: domain, type: 'success' });
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast({ title: 'No se pudo copiar', message: 'El navegador no permitió acceder al portapapeles.', type: 'error' });
    }
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  const actionButtons = (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      <button onClick={handleFavorite} className="btn-ghost p-1.5 rounded-lg"
        style={{ color: bookmark.is_favorite ? '#eab308' : undefined }} title="Favorito">
        <Star className="w-4 h-4 transition-transform hover:scale-110" fill={bookmark.is_favorite ? 'currentColor' : 'none'} />
      </button>
      <button onClick={handleCopy} className="btn-ghost p-1.5 rounded-lg" title="Copiar enlace">
        {copied ? <Check className="w-4 h-4" style={{ color: 'var(--app-success)' }} /> : <Copy className="w-4 h-4" />}
      </button>
      <button onClick={() => onEdit(bookmark)} className="btn-ghost p-1.5 rounded-lg" title="Editar">
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={handleDelete} disabled={deleting} className="btn-danger p-1.5 rounded-lg" title="Eliminar">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className={`card bookmark-card flex items-center gap-3 px-4 py-3 group ${deleting ? 'opacity-40 pointer-events-none' : ''}`}
        onMouseMove={handleMouseMove}
        style={{ '--card-accent': accent, '--i': index, borderRadius: '0.75rem' }}>
        {dragListeners && (
          <button {...dragListeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity touch-none p-1 rounded"
            style={{ color: 'var(--app-faint)' }} tabIndex={-1} title="Arrastrar">
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <FaviconImg src={bookmark.favicon} title={bookmark.title} />
        <div className="flex-1 min-w-0">
          <button onClick={handleOpen}
            className="text-sm font-semibold text-left truncate block w-full transition-colors hover:opacity-75"
            style={{ color: 'var(--app-text)' }}>
            {bookmark.title || bookmark.url}
          </button>
          <span className="text-xs truncate block" style={{ color: 'var(--app-faint)' }}>{domain}</span>
        </div>
        {bookmark.collection_name && (
          <span className="hidden md:flex items-center gap-1 text-xs flex-shrink-0" style={{ color: 'var(--app-muted)' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
            {bookmark.collection_name}
          </span>
        )}
        <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
          {bookmark.tags?.slice(0, 2).map((t) => <span key={t.id} className="tag-chip">{t.name}</span>)}
        </div>
        {actionButtons}
      </div>
    );
  }

  return (
    <div className={`card bookmark-card flex flex-col p-4 group min-h-[13rem] ${deleting ? 'opacity-40 pointer-events-none' : ''}`}
      onMouseMove={handleMouseMove}
      style={{ '--card-accent': accent, '--i': index }}>
      <div className="relative z-[1] flex items-start gap-3 mb-3">
        <FaviconImg src={bookmark.favicon} title={bookmark.title} />
        <div className="flex-1 min-w-0">
          <button onClick={handleOpen}
            className="text-sm font-bold text-left line-clamp-2 leading-snug w-full flex items-start gap-1 transition-colors hover:opacity-80"
            style={{ color: 'var(--app-text)' }}>
            <span className="flex-1">{bookmark.title || bookmark.url}</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-40" />
          </button>
          <p className="text-xs mt-1 truncate" style={{ color: 'var(--app-faint)' }}>{domain}</p>
        </div>
        {dragListeners && (
          <button {...dragListeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity touch-none p-1 rounded flex-shrink-0"
            style={{ color: 'var(--app-faint)' }} tabIndex={-1} title="Arrastrar">
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {bookmark.description ? (
        <p className="relative z-[1] text-xs line-clamp-3 mb-3 leading-relaxed flex-1" style={{ color: 'var(--app-muted)' }}>
          {bookmark.description}
        </p>
      ) : (
        <p className="relative z-[1] text-xs line-clamp-2 mb-3 leading-relaxed flex-1 italic" style={{ color: 'var(--app-faint)' }}>
          Sin descripción guardada todavía.
        </p>
      )}

      {bookmark.tags?.length > 0 && (
        <div className="relative z-[1] flex flex-wrap gap-1 mb-3">
          {bookmark.tags.slice(0, 4).map((t) => <span key={t.id} className="tag-chip">{t.name}</span>)}
          {bookmark.tags.length > 4 && <span className="tag-chip">+{bookmark.tags.length - 4}</span>}
        </div>
      )}

      <div className="relative z-[1] flex items-center justify-between pt-3 mt-auto"
        style={{ borderTop: '1px solid var(--app-border)' }}>
        <div className="flex items-center gap-2 min-w-0 text-xs" style={{ color: 'var(--app-faint)' }}>
          {bookmark.collection_name && (
            <span className="flex items-center gap-1 truncate" style={{ color: 'var(--app-muted)' }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
              <span className="truncate">{bookmark.collection_name}</span>
            </span>
          )}
          <span className="flex-shrink-0">{formatDate(bookmark.created_at)}</span>
          {bookmark.visits > 0 && (
            <span className="hidden sm:flex items-center gap-1 flex-shrink-0">
              <MousePointer2 className="w-3 h-3" />{bookmark.visits}
            </span>
          )}
        </div>
        <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {actionButtons}
        </div>
      </div>
    </div>
  );
}
