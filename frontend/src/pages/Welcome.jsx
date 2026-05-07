import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import lynraLogo from '../assets/icons/lynra_logo.png';

export default function Welcome({ user, onContinue }) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    const redirect = setTimeout(onContinue, 3500);
    return () => { clearInterval(dotInterval); clearTimeout(redirect); };
  }, [onContinue]);

  const firstName = user?.username?.split(' ')[0] || 'Experto';

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative"
      style={{
        backgroundColor: '#05050a', // Ultra dark background so logo glows natively
      }}>

      {/* Modern subtle glowing grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 100%)'
      }} />

      {/* Dynamic light sources matching logo colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-full h-full rounded-full opacity-30 blur-[120px] mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 60%)', animation: 'pulseDot 4s infinite alternate' }} />
        <div className="absolute bottom-0 right-1/4 w-full h-full rounded-full opacity-30 blur-[120px] mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 60%)', animation: 'pulseDot 5s infinite alternate-reverse' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 animate-slide-up max-w-lg w-full flex flex-col items-center">
        {/* Glow behind Logo tightly matching the shape */}
        <div className="relative inline-block mb-10 group cursor-default">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }} />
          
          <img src={lynraLogo} alt="Lynra Logo" className="relative w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl z-10 transition-transform duration-700 hover:scale-105" />
          
          <div className="absolute -top-2 -right-4 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.6)] z-20 animate-bounce" style={{ animationDuration: '2s' }}>
            <Sparkles className="w-5 h-5 text-yellow-900" />
          </div>
        </div>

        {/* Greeting Text */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Hola, <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--app-accent-gradient)' }}>{firstName}</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-12 font-medium">
          Tu bóveda inteligente está lista.
        </p>

        {/* Enter Button */}
        <button
          onClick={onContinue}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-all duration-300 transform rounded-2xl hover:scale-105 active:scale-95"
        >
          {/* Button Background with gradient border illusion */}
          <div className="absolute inset-0 rounded-2xl p-[2px]" style={{ background: 'var(--app-accent-gradient)' }}>
            <div className="absolute inset-0 bg-[#0a0a0f] rounded-2xl transition-colors duration-300 group-hover:bg-opacity-0"></div>
          </div>
          
          {/* Button Content */}
          <span className="relative z-10 flex items-center gap-2">
            Entrar a Lynra
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </button>

        {/* Loading Indicator */}
        <div className="mt-10 flex items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i < dots ? '#3b82f6' : '#1e293b',
                  transform: i === dots ? 'scale(1.5)' : 'scale(1)'
                }} />
            ))}
          </div>
          <p className="text-slate-500 text-sm font-medium">Cargando tu espacio</p>
        </div>
      </div>
    </div>
  );
}
