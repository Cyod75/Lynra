import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { BookMarked, Folder, Tag, TrendingUp } from 'lucide-react';
import { getStats, visitBookmark } from '../api/client';

function StatCard({ icon, label, value, accentColor }) {
  return (
    <div className="card stat-card p-5 flex items-center gap-4" style={{ '--card-accent': accentColor }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accentColor}18` }}>
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: 'var(--app-text)' }}>{value ?? '—'}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--app-muted)' }}>{label}</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs"
      style={{ backgroundColor: 'var(--app-surface)', border: '1px solid var(--app-border)', boxShadow: 'var(--app-shadow-md)' }}>
      <p style={{ color: 'var(--app-muted)' }}>{label}</p>
      <p className="font-semibold mt-0.5" style={{ color: 'var(--app-accent)' }}>
        {payload[0].value} bookmarks
      </p>
    </div>
  );
}

export default function StatsPanel() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--app-accent)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!stats) return (
    <p className="text-center py-16 text-sm" style={{ color: 'var(--app-muted)' }}>
      No se pudieron cargar las estadísticas.
    </p>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookMarked className="w-5 h-5" />} label="Total bookmarks"
          value={stats.totalBookmarks} accentColor="#7c3aed" />
        <StatCard icon={<Folder className="w-5 h-5" />} label="Colecciones"
          value={stats.totalCollections} accentColor="#8b5cf6" />
        <StatCard icon={<Tag className="w-5 h-5" />} label="Tags únicos"
          value={stats.totalTags} accentColor="#ec4899" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Visitas (top link)"
          value={stats.topVisited[0]?.visits ?? 0} accentColor="#22c55e" />
      </div>

      {/* Bar chart */}
      <div className="card stat-card p-6" style={{ '--card-accent': 'var(--app-accent)' }}>
        <h3 className="text-sm font-semibold mb-6" style={{ color: 'var(--app-text-2)' }}>
          Bookmarks por día — últimos 30 días
        </h3>
        {stats.bookmarksByDay.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: 'var(--app-faint)' }}>
            Sin datos suficientes todavía.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.bookmarksByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--app-faint)', fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--app-faint)', fontSize: 11 }}
                allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--app-hover)' }} />
              <Bar dataKey="count" fill="var(--app-accent)" radius={[5, 5, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top visited */}
        <div className="card stat-card p-5" style={{ '--card-accent': '#22c55e' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--app-text-2)' }}>
            Top 5 más visitados
          </h3>
          {stats.topVisited.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--app-faint)' }}>Sin visitas aún.</p>
          ) : (
            <ol className="space-y-3">
              {stats.topVisited.map((b, i) => (
                <li key={b.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--app-surface-2)', color: 'var(--app-muted)' }}>
                    {i + 1}
                  </span>
                  {b.favicon && (
                    <img src={b.favicon} alt="" className="w-4 h-4 rounded flex-shrink-0"
                      onError={(e) => e.target.style.display = 'none'} />
                  )}
                  <a href={b.url} target="_blank" rel="noopener noreferrer"
                    onClick={() => visitBookmark(b.id).catch(() => {})}
                    className="flex-1 text-sm truncate transition-colors"
                    style={{ color: 'var(--app-text-2)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--app-accent)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--app-text-2)'}>
                    {b.title || b.url}
                  </a>
                  <span className="flex items-center gap-1 text-xs flex-shrink-0"
                    style={{ color: 'var(--app-faint)' }}>
                    <TrendingUp className="w-3 h-3" />{b.visits}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Top tags */}
        <div className="card stat-card p-5" style={{ '--card-accent': '#ec4899' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--app-text-2)' }}>
            Top 5 tags más usados
          </h3>
          {stats.topTags.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--app-faint)' }}>Sin tags aún.</p>
          ) : (
            <ol className="space-y-3">
              {stats.topTags.map((t, i) => (
                <li key={t.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--app-surface-2)', color: 'var(--app-muted)' }}>
                    {i + 1}
                  </span>
                  <span className="tag-chip text-xs">{t.name}</span>
                  <span className="flex-1" />
                  <span className="text-xs" style={{ color: 'var(--app-faint)' }}>
                    {t.usage_count} uso{t.usage_count !== 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
