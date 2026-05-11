import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Stats from './pages/Stats';
import ImportExport from './components/ImportExport';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import useStore from './store/useStore';
import CommandPalette from './components/CommandPalette';
import Toaster from './components/Toaster';
import VisualAtmosphere from './components/VisualAtmosphere';
import ExperienceDock from './components/ExperienceDock';
import InterstellarField from './components/InterstellarField';

// ── Spinner ────────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: 'var(--app-bg)' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--app-accent) 0%, #4f46e5 100%)' }}>
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--app-muted)' }}>Cargando Lynra…</p>
    </div>
  );
}

// ── Main App (authenticated) ───────────────────────────
function MainApp({ onLogout }) {
  const { fetchCollections, fetchTags, fetchBookmarks } = useStore();
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileOpen, setMobileOpen]   = useState(false);

  useEffect(() => {
    fetchCollections();
    fetchTags();
    fetchBookmarks();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'stats':  return <Stats />;
      case 'import': return (
        <div>
          <div className="page-hero mb-6">
            <div className="relative z-[1]">
              <div className="quick-chip mb-3">Migración visual</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--app-text)' }}>
                Importar / Exportar
              </h1>
              <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--app-muted)' }}>
                Trae tus marcadores a Lynra o guarda una copia de tu biblioteca.
              </p>
            </div>
          </div>
          <ImportExport />
        </div>
      );
      default: return <Home />;
    }
  };

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <InterstellarField />
      <VisualAtmosphere />
      <Sidebar
        onNavigate={(page) => { setCurrentPage(page); setMobileOpen(false); }}
        currentPage={currentPage}
        onClose={() => setMobileOpen(false)}
        mobileOpen={mobileOpen}
        onLogout={onLogout}
      />
      <CommandPalette onNavigate={(page) => { setCurrentPage(page); setMobileOpen(false); }} />
      <Toaster />
      <ExperienceDock />

      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Mobile header bar */}
        <div className="flex items-center gap-3 h-14 px-4 lg:hidden flex-shrink-0"
          style={{ borderBottom: '1px solid var(--app-border)', backgroundColor: 'var(--app-sidebar)' }}>
          <button id="mobile-menu-btn" onClick={() => setMobileOpen(true)} className="btn-ghost p-2"
            style={{ color: 'var(--app-muted)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold tracking-tight" style={{ color: 'var(--app-text)' }}>Lynra</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Root App with auth state machine ──────────────────
export default function App() {
  const { authStatus, checkAuth, user, logout } = useStore();
  // 'checking' | 'unauthenticated' | 'welcome' | 'app'
  const [screen, setScreen] = useState('checking');
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'
  const [welcomeUser, setWelcomeUser] = useState(null);

  useEffect(() => {
    checkAuth().then((ok) => {
      setScreen(ok ? 'app' : 'auth');
    });
  }, []);

  const handleLoginSuccess = (user) => {
    setWelcomeUser(user);
    setScreen('welcome');
  };

  const handleWelcomeDone = () => setScreen('app');

  const handleLogout = () => {
    logout();
    setScreen('auth');
    setAuthPage('login');
  };

  if (screen === 'checking') return <Spinner />;

  if (screen === 'welcome') return <Welcome user={welcomeUser} onContinue={handleWelcomeDone} />;

  if (screen === 'auth') {
    return authPage === 'login'
      ? <Login onSuccess={handleLoginSuccess} onGoRegister={() => setAuthPage('register')} />
      : <Register onSuccess={handleLoginSuccess} onGoLogin={() => setAuthPage('login')} />;
  }

  return <MainApp onLogout={handleLogout} />;
}
