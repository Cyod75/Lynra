import { Command, Focus, Plus, Sparkles } from 'lucide-react';

export default function ExperienceDock() {
  const openCommands = () => window.dispatchEvent(new CustomEvent('lynra:open-command'));
  const newBookmark = () => window.dispatchEvent(new CustomEvent('lynra:new-bookmark'));

  return (
    <div className="experience-dock">
      <button className="dock-button dock-primary" onClick={openCommands} title="Abrir comandos">
        <Command className="w-4 h-4" />
        <span>Control + K</span>
      </button>
      <button className="dock-button" onClick={newBookmark} title="Añadir enlace">
        <Plus className="w-4 h-4" />
      </button>
      <button
        className="dock-button"
        onClick={() => document.body.classList.toggle('lynra-cinema')}
        title="Modo visual"
      >
        <Focus className="w-4 h-4" />
      </button>
      <span className="dock-spark">
        <Sparkles className="w-3.5 h-3.5" />
      </span>
    </div>
  );
}
