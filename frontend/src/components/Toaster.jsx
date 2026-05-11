import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export function toast({ title, message, type = 'info' }) {
  window.dispatchEvent(new CustomEvent('lynra:toast', {
    detail: { title, message, type },
  }));

  if (type === 'success') {
    const burst = document.createElement('div');
    burst.className = 'confetti-burst';
    const colors = ['#3b82f6', '#8b5cf6', '#14b8a6', '#facc15', '#ec4899'];
    Array.from({ length: 28 }).forEach((_, index) => {
      const piece = document.createElement('span');
      piece.style.setProperty('--x', `${Math.cos(index) * (80 + (index % 4) * 18)}px`);
      piece.style.setProperty('--y', `${Math.sin(index * 1.7) * (62 + (index % 5) * 12)}px`);
      piece.style.setProperty('--r', `${index * 27}deg`);
      piece.style.backgroundColor = colors[index % colors.length];
      burst.appendChild(piece);
    });
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 1200);
  }
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'var(--app-success)',
  error: 'var(--app-danger)',
  info: 'var(--app-accent)',
};

export default function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const onToast = (event) => {
      const item = {
        id: crypto.randomUUID(),
        ...event.detail,
      };
      setItems((current) => [item, ...current].slice(0, 4));
      setTimeout(() => {
        setItems((current) => current.filter((toastItem) => toastItem.id !== item.id));
      }, 3600);
    };

    window.addEventListener('lynra:toast', onToast);
    return () => window.removeEventListener('lynra:toast', onToast);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[90] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {items.map((item) => {
        const Icon = icons[item.type] || Info;
        const color = colors[item.type] || colors.info;

        return (
          <div key={item.id} className="toast-card">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--app-text)' }}>
                {item.title}
              </p>
              {item.message && (
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--app-muted)' }}>
                  {item.message}
                </p>
              )}
            </div>
            <button
              className="btn-ghost p-1.5 rounded-lg flex-shrink-0"
              onClick={() => setItems((current) => current.filter((toastItem) => toastItem.id !== item.id))}
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
