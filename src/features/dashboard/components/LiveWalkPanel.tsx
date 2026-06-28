import { useEffect, useMemo, useRef, useState } from "react";
import { DialogPortal } from "./DialogPortal";
import { Icon } from "./Icon";
import { PersonAvatar } from "./PersonAvatar";
import { PetAvatar } from "./PetAvatar";
import { WalkMap } from "./WalkMap";
import { phaseLabel, useSimulatedWalk } from "../state/SimulatedWalkContext";
import { profileForPet } from "../data/catalog";

type LiveWalkPanelProps = {
  onClose: () => void;
  onCompleted?: () => void;
};

export function LiveWalkPanel({ onClose, onCompleted }: LiveWalkPanelProps) {
  const { walk, advancePhase, complete, cancel, sendMessage } = useSimulatedWalk();
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [walk?.messages.length]);

  const petProfile = useMemo(
    () => (walk ? profileForPet(walk.mascota.id) : { hue: 150, glyph: "PawPrint" as const }),
    [walk],
  );

  if (!walk) return null;

  const initials = walk.provider.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  const totalSec = Math.floor((Date.now() - walk.startedAt) / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = (totalSec % 60).toString().padStart(2, "0");

  const remainingPct = Math.max(0, 100 - walk.progress * 100);
  const remainingMin = Math.max(
    0,
    Math.round((walk.estimatedMinutes * remainingPct) / 100),
  );

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  }

  function handleFinish() {
    complete();
    onCompleted?.();
  }

  return (
    <DialogPortal>
      <div className="vih-live-overlay" onClick={onClose}>
        <div
          className="vih-live-panel"
          role="dialog"
          aria-modal="true"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="vih-live-header">
            <div>
              <span className="vih-live-tag">
                <span className="vih-live-tag-dot" />
                {phaseLabel(walk.phase).toUpperCase()}
              </span>
              <h2>Paseo en vivo</h2>
              <p>
                {walk.mascota.nombre} con {walk.provider.name}
              </p>
            </div>
            <button
              type="button"
              className="vih-icon-btn vih-press"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <Icon name="X" size={18} />
            </button>
          </header>

          <div className="vih-live-body">
            <div className="vih-live-map-col">
              <WalkMap
                phase={walk.phase}
                progress={walk.progress}
                providerInitials={initials}
                petName={walk.mascota.nombre}
                petHue={petProfile.hue}
                height={340}
              />

              <div className="vih-live-meta">
                <div className="vih-live-stat">
                  <span>Tiempo activo</span>
                  <strong>
                    {minutes}:{seconds}
                  </strong>
                </div>
                <div className="vih-live-stat">
                  <span>Restante estimado</span>
                  <strong>{remainingMin} min</strong>
                </div>
                <div className="vih-live-stat">
                  <span>Avance</span>
                  <strong>{Math.round(walk.progress * 100)}%</strong>
                </div>
                <div className="vih-live-stat">
                  <span>Tarifa</span>
                  <strong>{formatMoney(walk.totalCop)}</strong>
                </div>
              </div>

              <div className="vih-live-timeline" aria-hidden="true">
                {(
                  [
                    "buscando",
                    "en_camino",
                    "paseando",
                    "regresando",
                    "completado",
                  ] as const
                ).map((p) => {
                  const reached = phaseOrder(p) <= phaseOrder(walk.phase);
                  const current = walk.phase === p;
                  return (
                    <div
                      key={p}
                      className={`vih-live-step ${reached ? "is-done" : ""} ${
                        current ? "is-current" : ""
                      }`}
                    >
                      <span className="vih-live-step-dot">
                        {reached && <Icon name="Check" size={12} />}
                      </span>
                      <span className="vih-live-step-label">{phaseLabel(p)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="vih-live-side">
              <div className="vih-live-provider">
                <PersonAvatar
                  size={56}
                  hue={walk.provider.hue}
                  label={walk.provider.name}
                  photoUrl={walk.provider.photoUrl}
                />
                <div>
                  <p className="vih-live-provider-name">{walk.provider.name}</p>
                  <p className="vih-live-provider-meta">
                    <Icon name="Star" size={13} color="var(--gold-600)" />{" "}
                    {walk.provider.rating} · {walk.provider.experienceYears} años
                  </p>
                </div>
              </div>

              <div className="vih-live-pet">
                <PetAvatar pet={walk.mascota} size={42} ring />
                <div>
                  <p className="vih-live-pet-name">{walk.mascota.nombre}</p>
                  <p className="vih-live-pet-meta">{walk.mascota.raza}</p>
                </div>
              </div>

              <div className="vih-live-actions">
                {walk.phase !== "completado" ? (
                  <>
                    <button
                      type="button"
                      className="vih-ghost vih-press"
                      onClick={advancePhase}
                    >
                      Avanzar etapa
                    </button>
                    <button
                      type="button"
                      className="vih-primary vih-press"
                      onClick={handleFinish}
                    >
                      <Icon name="Check" size={16} /> Finalizar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="vih-primary vih-press"
                    onClick={() => {
                      cancel();
                      onClose();
                    }}
                  >
                    <Icon name="X" size={16} /> Cerrar paseo
                  </button>
                )}
              </div>

              <div className="vih-live-chat">
                <h3>Mensajes</h3>
                <div className="vih-live-messages">
                  {walk.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`vih-live-msg ${
                        msg.from === "you" ? "is-you" : "is-them"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form className="vih-live-chat-form" onSubmit={handleSend}>
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={
                      walk.phase === "completado"
                        ? "Servicio finalizado"
                        : "Escribe un mensaje..."
                    }
                    disabled={walk.phase === "completado"}
                  />
                  <button
                    type="submit"
                    className="vih-icon-btn vih-icon-btn-primary vih-press"
                    disabled={!draft.trim() || walk.phase === "completado"}
                    aria-label="Enviar"
                  >
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DialogPortal>
  );
}

function phaseOrder(p: string) {
  return ["buscando", "en_camino", "paseando", "regresando", "completado"].indexOf(p);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
