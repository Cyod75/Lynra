import { useState } from 'react';
import {
  Bookmark, Star, BarChart2, Upload, Plus, X,
  Sun, Moon, Hash, LogOut, ChevronRight, User,
} from 'lucide-react';
import useStore from '../store/useStore';
import lynraLogo from '../assets/icons/lynra_logo.png';

const PALETTE = [
  '#7c3aed','#8b5cf6','#ec4899','#f43f5e',
  '#f97316','#eab308','#22c55e','#06b6d4',
  '#3b82f6','#14b8a6',
];

function Avatar({ username }) {
  const initials = (username || '?').slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, var(--app-accent) 0%, #4f46e5 100%)' }}>
      {initials}
    </div>
  );
}

export default function Sidebar({ onNavigate, currentPage, onClose, mobileOpen, onLogout }) {
  const {
    collections, tags, activeCollection, activeTag,
    showFavoritesOnly, setActiveCollection, setActiveTag,
    setShowFavoritesOnly, addCollection, darkMode, toggleDarkMode, user,
  } = useStore();

  const [newColName,  setNewColName]  = useState('');
  const [newColColor, setNewColColor] = useState('#7c3aed');
  const [showNewCol,  setShowNewCol]  = useState(false);
  const [creating,    setCreating]    = useState(false);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    setCreating(true);
    try {
      await addCollection({ name: newColName.trim(), color: newColColor });
      setNewColName(''); setNewColColor('#7c3aed'); setShowNewCol(false);
    } catch (err) { alert(err.message); }
    finally { setCreating(false); }
  };

  const NavItem = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`nav-item ${active ? 'active' : ''}`}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
    </button>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        transition-transform duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `} style={{
        width: '240px',
        backgroundColor: 'var(--app-sidebar)',
        borderRight: '1px solid var(--app-sidebar-border)',
      }}>

        {/* ── Logo ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--app-sidebar-border)' }}>
          <div className="flex items-center gap-2.5">
            <img src={lynraLogo} alt="Lynra" className="w-8 h-8 object-contain drop-shadow-md" />
            <span className="font-bold tracking-tight text-lg" style={{ color: 'var(--app-text)' }}>Lynra</span>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────── */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">

          {/* Main nav */}
          <div className="space-y-0.5">
            <NavItem
              icon={<Bookmark className="w-4 h-4" />}
              label="Todos los enlaces"
              active={currentPage === 'home' && !activeCollection && !activeTag && !showFavoritesOnly}
              onClick={() => { setActiveCollection(null); setActiveTag(null); setShowFavoritesOnly(false); onNavigate('home'); }}
            />
            <NavItem
              icon={<Star className="w-4 h-4" />}
              label="Favoritos"
              active={currentPage === 'home' && showFavoritesOnly}
              onClick={() => { setShowFavoritesOnly(true); onNavigate('home'); }}
            />
            <NavItem
              icon={<BarChart2 className="w-4 h-4" />}
              label="Estadísticas"
              active={currentPage === 'stats'}
              onClick={() => onNavigate('stats')}
            />
            <NavItem
              icon={<Upload className="w-4 h-4" />}
              label="Importar / Exportar"
              active={currentPage === 'import'}
              onClick={() => onNavigate('import')}
            />
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Collections */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--app-faint)' }}>Colecciones</span>
              <button onClick={() => setShowNewCol(!showNewCol)}
                className="btn-ghost p-1 rounded-md text-xs" title="Nueva colección">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {showNewCol && (
              <form onSubmit={handleCreateCollection}
                className="mb-3 p-3 rounded-xl space-y-2.5"
                style={{ backgroundColor: 'var(--app-surface-2)', border: '1px solid var(--app-border)' }}>
                <input
                  className="input-base text-xs py-1.5"
                  placeholder="Nombre de la colección"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  autoFocus
                />
                <div className="flex flex-wrap gap-1.5">
                  {PALETTE.map((c) => (
                    <button key={c} type="button" onClick={() => setNewColColor(c)}
                      title={c}
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        ring: newColColor === c ? '2px' : 'none',
                        transform: newColColor === c ? 'scale(1.3)' : undefined,
                        boxShadow: newColColor === c ? `0 0 0 2px var(--app-surface), 0 0 0 4px ${c}` : 'none',
                      }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={creating} className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center">
                    {creating ? 'Creando…' : 'Crear'}
                  </button>
                  <button type="button" onClick={() => setShowNewCol(false)} className="btn-ghost py-1.5 px-2">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-0.5">
              {collections.length === 0 && (
                <p className="text-xs px-3 py-2" style={{ color: 'var(--app-faint)' }}>Sin colecciones</p>
              )}
              {collections.map((col) => (
                <button key={col.id}
                  onClick={() => { setActiveCollection(col.id); onNavigate('home'); }}
                  className={`nav-item ${currentPage === 'home' && activeCollection === col.id ? 'active' : ''}`}>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: col.color || '#7c3aed' }} />
                  <span className="flex-1 truncate text-sm">{col.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md"
                    style={{ backgroundColor: 'var(--app-surface-2)', color: 'var(--app-faint)' }}>
                    {col.bookmark_count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <div className="px-1 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--app-faint)' }}>Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5 px-1">
                {tags.slice(0, 18).map((tag) => (
                  <button key={tag.id}
                    onClick={() => { setActiveTag(tag.name); onNavigate('home'); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                    style={{
                      backgroundColor: currentPage === 'home' && activeTag === tag.name ? 'var(--app-accent)' : 'var(--app-surface-2)',
                      color: currentPage === 'home' && activeTag === tag.name ? '#fff' : 'var(--app-muted)',
                      border: '1px solid var(--app-border)',
                    }}>
                    <Hash className="w-2.5 h-2.5" />{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────── */}
        <div className="flex-shrink-0 p-3 space-y-1"
          style={{ borderTop: '1px solid var(--app-sidebar-border)' }}>
          {/* User info */}
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-2"
              style={{ backgroundColor: 'var(--app-surface-2)' }}>
              <Avatar username={user.username} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--app-text)' }}>{user.username}</p>
                <p className="text-xs truncate" style={{ color: 'var(--app-faint)' }}>{user.email}</p>
              </div>
            </div>
          )}

          <button onClick={toggleDarkMode} className="nav-item w-full">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button onClick={onLogout} className="nav-item w-full" style={{ color: 'var(--app-danger)' }}>
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
