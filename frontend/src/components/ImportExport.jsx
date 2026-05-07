import { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { importHtml, exportJson } from '../api/client';
import useStore from '../store/useStore';

export default function ImportExport() {
  const { fetchBookmarks, fetchTags } = useStore();
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);
  const fileRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.html?$/i)) {
      setError('El archivo debe ser un .html exportado de Chrome o Firefox.');
      return;
    }
    setUploading(true); setResult(null); setError(null);
    try {
      const res = await importHtml(file);
      setResult(res);
      await fetchBookmarks();
      await fetchTags();
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Export */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'color-mix(in srgb, var(--app-accent) 12%, transparent)' }}>
            <Download className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--app-text)' }}>Exportar bookmarks</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--app-muted)' }}>
              Descarga todos tus bookmarks y sus tags en formato JSON.
            </p>
            <button id="export-btn" onClick={exportJson} className="btn-primary">
              <Download className="w-4 h-4" /> Exportar JSON
            </button>
          </div>
        </div>
      </div>

      {/* Import */}
      <div className="card p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'color-mix(in srgb, #ec4899 12%, transparent)' }}>
            <Upload className="w-5 h-5" style={{ color: '#ec4899' }} />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--app-text)' }}>Importar desde navegador</h3>
            <p className="text-xs" style={{ color: 'var(--app-muted)' }}>
              <span className="font-medium" style={{ color: 'var(--app-text-2)' }}>Chrome:</span>{' '}
              chrome://bookmarks → ⋮ → Exportar marcadores
              <br />
              <span className="font-medium" style={{ color: 'var(--app-text-2)' }}>Firefox:</span>{' '}
              Marcadores → Gestionar → Importar y respaldar → Exportar a HTML
            </p>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className="rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200"
          style={{
            borderColor: dragging ? 'var(--app-accent)' : 'var(--app-border)',
            backgroundColor: dragging ? 'color-mix(in srgb, var(--app-accent) 6%, transparent)'
              : uploading ? 'var(--app-surface-2)' : 'transparent',
            pointerEvents: uploading ? 'none' : 'auto',
          }}>
          {uploading
            ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--app-accent)' }} />
            : <FileText className="w-8 h-8" style={{ color: dragging ? 'var(--app-accent)' : 'var(--app-faint)' }} />
          }
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: uploading ? 'var(--app-accent)' : 'var(--app-text-2)' }}>
              {uploading ? 'Importando enlaces…' : 'Arrastra el archivo HTML aquí'}
            </p>
            {!uploading && (
              <p className="text-xs mt-1" style={{ color: 'var(--app-faint)' }}>
                o haz clic para seleccionar el archivo
              </p>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".html,.htm" className="hidden"
            onChange={(e) => { processFile(e.target.files[0]); e.target.value = ''; }} />
        </div>

        {/* Result */}
        {result && (
          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl animate-fade-in"
            style={{ backgroundColor: 'color-mix(in srgb, #22c55e 10%, transparent)', border: '1px solid color-mix(in srgb, #22c55e 25%, transparent)' }}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>Importación completada</p>
              <p className="text-xs mt-0.5" style={{ color: '#16a34a' }}>
                {result.imported} de {result.total} enlaces importados
                {result.total - result.imported > 0 && ` · ${result.total - result.imported} duplicados omitidos`}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl animate-fade-in"
            style={{ backgroundColor: 'color-mix(in srgb, var(--app-danger) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--app-danger) 25%, transparent)' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--app-danger)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--app-danger)' }}>Error de importación</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--app-danger)', opacity: 0.8 }}>{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
