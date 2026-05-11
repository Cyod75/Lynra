import { Activity, Sparkles } from 'lucide-react';
import StatsPanel from '../components/StatsPanel';

export default function Stats() {
  return (
    <div>
      <div className="page-hero mb-6">
        <div className="relative z-[1] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--app-accent-gradient)', boxShadow: '0 18px 46px var(--app-glow)' }}>
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="quick-chip mb-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--app-accent)' }} />
              Observatorio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--app-text)' }}>
              Estadísticas
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--app-muted)' }}>
              Un panel vivo para ver cómo crece y se mueve tu biblioteca.
            </p>
          </div>
        </div>
      </div>
      <StatsPanel />
    </div>
  );
}
