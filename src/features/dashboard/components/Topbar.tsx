import { useState } from "react";
import { Icon } from "./Icon";
import { PetAvatar } from "./PetAvatar";
import { usePets } from "../state/PetContext";
import { phaseLabel, useSimulatedWalk } from "../state/SimulatedWalkContext";

type TopbarProps = {
  userName: string;
  onSearch?: (query: string) => void;
  onBell?: () => void;
  onOpenLive?: () => void;
};

export function Topbar({ userName, onSearch, onBell, onOpenLive }: TopbarProps) {
  const { selected, selectNext, mascotas } = usePets();
  const { walk } = useSimulatedWalk();
  const [query, setQuery] = useState("");

  return (
    <header className="vih-topbar">
      <div className="vih-topbar-greeting">
        <h1>
          Hola, {userName.split(" ")[0]} <span className="vih-wave">🐾</span>
        </h1>
        <p>
          {selected
            ? `¿Qué necesita ${selected.nombre} hoy?`
            : "Agrega tu primera mascota para empezar"}
        </p>
      </div>

      <form
        className="vih-topbar-search"
        onSubmit={(event) => {
          event.preventDefault();
          if (onSearch) onSearch(query);
        }}
      >
        <Icon name="Search" size={18} color="var(--ink-mute)" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar servicios, productos..."
        />
      </form>

      {walk && onOpenLive && (
        <button
          type="button"
          className="vih-topbar-live vih-press"
          onClick={onOpenLive}
        >
          <span className="vih-topbar-live-dot" />
          {phaseLabel(walk.phase)}
        </button>
      )}

      <button
        type="button"
        className="vih-topbar-bell vih-press"
        onClick={onBell}
        aria-label="Notificaciones"
      >
        <Icon name="Bell" size={20} color="var(--ink-soft)" />
        <span className="vih-topbar-bell-dot" />
      </button>

      {selected && (
        <button
          type="button"
          className="vih-topbar-pet vih-press"
          onClick={selectNext}
          aria-label="Cambiar mascota"
          disabled={mascotas.length <= 1}
        >
          <PetAvatar pet={selected} size={36} />
          <span>{selected.nombre}</span>
          <Icon name="ChevronsUpDown" size={16} color="var(--ink-mute)" />
        </button>
      )}
    </header>
  );
}
