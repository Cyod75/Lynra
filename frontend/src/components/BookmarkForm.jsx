import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Globe, Tag, Plus, Check } from 'lucide-react';
import useStore from '../store/useStore';
import { scrapeUrl } from '../api/client';
import { toast } from './Toaster';

export default function BookmarkForm({ onClose, editData }) {
  const { addBookmark, editBookmark, fetchBookmarks, fetchTags, collections, tags: allTags } = useStore();
  const isEdit = !!editData;

  const [url,          setUrl]          = useState(editData?.url || '');
  const [title,        setTitle]        = useState(editData?.title || '');
  const [description,  setDescription]  = useState(editData?.description || '');
  const [favicon,      setFavicon]      = useState(editData?.favicon || '');
  const [collectionId, setCollectionId] = useState(editData?.collection_id ?? '');
  const [selectedTags, setSelectedTags] = useState(editData?.tags?.map((t) => t.name) || []);
  const [tagInput,     setTagInput]     = useState('');
  const [scraping,     setScraping]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [faviconErr,   setFaviconErr]   = useState(false);
  const [showSuggest,  setShowSuggest]  = useState(false);
  const tagRef = useRef(null);

  const handleScrape = async () => {
    if (!url.trim()) return;
    setScraping(true);
    try {
      const meta = await scrapeUrl(url.trim());
      if (meta.title) setTitle(meta.title);
      if (meta.description) setDescription(meta.description);
      if (meta.favicon) { setFavicon(meta.favicon); setFaviconErr(false); }
    } catch (err) {
      toast({ title: 'No se pudieron obtener metadatos', message: err.message, type: 'error' });
    }
    finally { setScraping(false); }
  };

  const addTag = (name) => {
    const t = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!t || selectedTags.includes(t)) return;
    setSelectedTags([...selectedTags, t]);
    setTagInput('');
    setShowSuggest(false);
  };

  const removeTag = (name) => setSelectedTags(selectedTags.filter((t) => t !== name));

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput) { e.preventDefault(); addTag(tagInput); }
    else if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) { removeTag(selectedTags.at(-1)); }
    else if (e.key === 'Escape') setShowSuggest(false);
  };

  const suggestions = allTags
    .filter((t) => t.name.includes(tagInput.toLowerCase()) && !selectedTags.includes(t.name))
    .slice(0, 6);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSaving(true);
    try {
      const payload = {
        url: url.trim(),
        title: title.trim() || url.trim(),
        description: description.trim() || null,
        favicon: favicon.trim() || null,
        collection_id: collectionId ? Number(collectionId) : null,
        tags: selectedTags,
      };
      if (isEdit) await editBookmark(editData.id, payload);
      else await addBookmark(payload);
      await Promise.all([fetchBookmarks(), fetchTags()]);
      toast({
        title: isEdit ? 'Enlace actualizado' : 'Enlace guardado',
        message: payload.title,
        type: 'success',
      });
      onClose();
    } catch (err) {
      toast({ title: 'No se pudo guardar', message: err.message, type: 'error' });
    }
    finally { setSaving(false); }
  };

  const Label = ({ children }) => (
    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
      style={{ color: 'var(--app-muted)' }}>{children}</label>
  );

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sticky top-0"
          style={{ borderBottom: '1px solid var(--app-border)', backgroundColor: 'var(--app-surface)', zIndex: 1 }}>
          <h2 className="font-bold text-base" style={{ color: 'var(--app-text)' }}>
            {isEdit ? 'Editar enlace' : 'Añadir enlace'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* URL */}
          <div>
            <Label>URL *</Label>
            <div className="flex gap-2">
              <input id="bookmark-url" type="url" required value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                className="input-base flex-1" autoFocus />
              <button type="button" onClick={handleScrape} disabled={scraping || !url}
                className="btn-outline flex-shrink-0 px-3" title="Obtener metadatos automáticamente">
                {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Favicon preview */}
          {favicon && !faviconErr && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: 'var(--app-surface-2)', border: '1px solid var(--app-border)' }}>
              <img src={favicon} alt="favicon" className="w-8 h-8 rounded-lg object-contain"
                onError={() => setFaviconErr(true)} />
              <span className="text-xs flex-1 truncate" style={{ color: 'var(--app-muted)' }}>{favicon}</span>
              <button type="button" onClick={() => setFavicon('')}
                className="btn-ghost p-1 rounded-md"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {/* Title */}
          <div>
            <Label>Título</Label>
            <input id="bookmark-title" type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del enlace" className="input-base" />
          </div>

          {/* Description */}
          <div>
            <Label>Descripción</Label>
            <textarea id="bookmark-description" value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional…" rows={3}
              className="input-base resize-none" />
          </div>

          {/* Collection */}
          <div>
            <Label>Colección</Label>
            <select id="bookmark-collection" value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)} className="input-base">
              <option value="">Sin colección</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div className="relative">
            <Label>Tags</Label>
            <div className="input-base flex flex-wrap gap-1.5 min-h-[44px] cursor-text"
              onClick={() => tagRef.current?.focus()}>
              {selectedTags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{ backgroundColor: 'var(--app-accent-2)', color: 'var(--app-accent)' }}>
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:opacity-70">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input ref={tagRef} type="text" value={tagInput}
                onChange={(e) => { setTagInput(e.target.value); setShowSuggest(true); }}
                onKeyDown={handleTagKeyDown}
                onFocus={() => setShowSuggest(true)}
                placeholder={selectedTags.length === 0 ? 'Escribe y pulsa Enter…' : ''}
                className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
                style={{ color: 'var(--app-text)' }} />
            </div>
            {showSuggest && tagInput && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-10"
                style={{ backgroundColor: 'var(--app-surface)', border: '1px solid var(--app-border)', boxShadow: 'var(--app-shadow-lg)' }}>
                {suggestions.map((t) => (
                  <button key={t.id} type="button" onMouseDown={() => addTag(t.name)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
                    style={{ color: 'var(--app-text-2)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Tag className="w-3.5 h-3.5" style={{ color: 'var(--app-faint)' }} />
                    {t.name}
                    <span className="ml-auto text-xs" style={{ color: 'var(--app-faint)' }}>
                      {t.usage_count} usos
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !url} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
