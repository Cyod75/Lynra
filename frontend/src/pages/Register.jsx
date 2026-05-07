import { useState } from 'react';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { registerUser } from '../api/client';
import useStore from '../store/useStore';
import lynraLogo from '../assets/icons/lynra_logo.png';

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const colors = ['', '#ef4444', '#f97316', '#3b82f6', '#22c55e'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : 'var(--app-border)' }} />
        ))}
      </div>
      <p className="text-xs mt-1" style={{ color: colors[score] || 'var(--app-faint)' }}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function Register({ onSuccess, onGoLogin }) {
  const setUser = useStore((s) => s.setUser);
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      const { token, user } = await registerUser({ username: username.trim(), email: email.trim(), password });
      localStorage.setItem('lv_token', token);
      setUser(user);
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--app-bg)' }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--app-accent) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={lynraLogo} alt="Lynra Logo" className="w-16 h-16 object-contain mb-4 drop-shadow-xl" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text)' }}>Crear cuenta en Lynra</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--app-muted)' }}>Tu bóveda personal de enlaces</p>
        </div>

        <div className="rounded-2xl p-8" style={{
          backgroundColor: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          boxShadow: 'var(--app-shadow-lg)',
        }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--app-muted)' }}>Nombre de usuario</label>
              <input
                id="reg-username"
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tu_nombre"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--app-muted)' }}>Email</label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--app-muted)' }}>Contraseña</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="input-base pr-11"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--app-faint)' }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--app-muted)' }}>Confirmar contraseña</label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="input-base pr-11"
                />
                {confirm && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {confirm === password
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} />
                      : <span style={{ color: 'var(--app-danger)', fontSize: '1rem' }}>✕</span>}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm animate-fade-in"
                style={{ backgroundColor: 'color-mix(in srgb, var(--app-danger) 10%, transparent)', color: 'var(--app-danger)', border: '1px solid color-mix(in srgb, var(--app-danger) 25%, transparent)' }}>
                ⚠ {error}
              </div>
            )}

            <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
              {!loading && <ArrowRight className="w-4 h-4 ml-auto" />}
            </button>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--app-border)' }}>
            <p className="text-sm text-center" style={{ color: 'var(--app-muted)' }}>
              ¿Ya tienes cuenta?{' '}
              <button onClick={onGoLogin} className="font-semibold" style={{ color: 'var(--app-accent)' }}>
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
