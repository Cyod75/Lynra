import { useState } from 'react';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { loginUser } from '../api/client';
import useStore from '../store/useStore';
import lynraLogo from '../assets/icons/lynra_logo.png';

export default function Login({ onSuccess, onGoRegister }) {
  const setUser = useStore((s) => s.setUser);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await loginUser({ email: email.trim(), password });
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
      {/* Ambient gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--app-accent) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={lynraLogo} alt="Lynra Logo" className="w-16 h-16 object-contain mb-4 drop-shadow-xl" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text)' }}>Bienvenido a Lynra</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--app-muted)' }}>Inicia sesión en tu bóveda de enlaces</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{
          backgroundColor: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          boxShadow: 'var(--app-shadow-lg)',
        }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--app-muted)' }}>Email</label>
              <input
                id="login-email"
                type="email"
                required
                autoFocus
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
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--app-faint)' }}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm flex items-center gap-2 animate-fade-in"
                style={{ backgroundColor: 'color-mix(in srgb, var(--app-danger) 10%, transparent)', color: 'var(--app-danger)', border: '1px solid color-mix(in srgb, var(--app-danger) 25%, transparent)' }}>
                <span className="text-base">⚠</span> {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
              {!loading && <ArrowRight className="w-4 h-4 ml-auto" />}
            </button>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--app-border)' }}>
            <p className="text-sm text-center" style={{ color: 'var(--app-muted)' }}>
              ¿No tienes cuenta?{' '}
              <button
                onClick={onGoRegister}
                className="font-semibold transition-colors"
                style={{ color: 'var(--app-accent)' }}
              >
                Crear cuenta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
