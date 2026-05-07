import StatsPanel from '../components/StatsPanel';

export default function Stats() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>Estadísticas</h1>
      <StatsPanel />
    </div>
  );
}
