import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { PetAvatar } from "../components/PetAvatar";
import { PersonAvatar } from "../components/PersonAvatar";
import { WalkMap } from "../components/WalkMap";
import { SERVICES, TONE, profileForPet } from "../data/catalog";
import type { ServiceEntry } from "../data/catalog";
import { usePets } from "../state/PetContext";
import {
  phaseLabel,
  phaseTag,
  useSimulatedWalk,
} from "../state/SimulatedWalkContext";
import { WALKERS } from "../data/providers";
import { useToast } from "../components/ToastProvider";
import { listHistorialServicios } from "../../services/api/serviciosApi";
import { ApiError } from "../../../lib/api/apiClient";
import type { Servicio } from "../../../types/domain";
import type { NavKey } from "../navigation";
import "./InicioView.css";

type InicioViewProps = {
  token: string;
  onNavigate: (key: NavKey) => void;
  onServiceRequest: (service: ServiceEntry) => void;
  onOpenLive: () => void;
};

export function InicioView({
  token,
  onNavigate,
  onServiceRequest,
  onOpenLive,
}: InicioViewProps) {
  const { selected, mascotas, loading } = usePets();
  const { walk, start } = useSimulatedWalk();
  const showToast = useToast();
  const [servicios, setServicios] = useState<Servicio[]>([]);

  useEffect(() => {
    listHistorialServicios(token)
      .then((data) => setServicios(data))
      .catch((caught) => {
        if (caught instanceof ApiError && caught.status !== 401) {
          showToast(caught.message, "error");
        }
      });
  }, [token, showToast]);

  const lastTwo = useMemo(
    () =>
      servicios.filter((s) => s.estado === "finalizado").slice(0, 2),
    [servicios],
  );

  if (loading) {
    return <p className="vih-loading">Cargando tu información...</p>;
  }

  if (mascotas.length === 0) {
    return (
      <section className="vih-empty">
        <Icon name="PawPrint" size={42} color="var(--green-cta)" />
        <h2>Empecemos por tu mascota</h2>
        <p>Agrega tu primer perfil para solicitar servicios.</p>
        <button
          type="button"
          className="vih-primary"
          onClick={() => onNavigate("pets")}
        >
          Agregar mascota <Icon name="ArrowRight" size={18} />
        </button>
      </section>
    );
  }

  function handleSimulate() {
    if (!selected) {
      showToast("Selecciona una mascota", "error");
      return;
    }
    const provider = WALKERS[0]!;
    start({
      provider,
      mascota: selected,
      totalCop: provider.pricePerHour,
      estimatedMinutes: 45,
    });
    showToast("Paseo demo iniciado", "success");
    onOpenLive();
  }

  return (
    <div className="vih-grid">
      <div className="vih-col">
        {walk ? (
          <ActiveWalkSnapshot onOpen={onOpenLive} />
        ) : (
          <DemoWalkBanner onSimulate={handleSimulate} />
        )}

        <section>
          <div className="vih-section-head">
            <h2 className="vih-section-title">Pide un servicio</h2>
            <span className="vih-muted">Aliados verificados a domicilio</span>
          </div>
          <div className="vih-services-grid">
            {SERVICES.map((service, idx) => {
              const tone = TONE[service.tone];
              return (
                <button
                  key={service.key}
                  type="button"
                  className="vih-service-card vih-press"
                  style={{ animationDelay: `${0.06 + idx * 0.05}s` }}
                  onClick={() => {
                    if (service.key === "shop") onNavigate("shop");
                    else onNavigate(navForService(service.key));
                  }}
                >
                  <span className="vih-service-icon" style={{ background: tone.fill }}>
                    <Icon name={service.icon} size={27} color={tone.ic} stroke={2.1} />
                  </span>
                  <span className="vih-service-text">
                    <span className="vih-service-label">{service.label}</span>
                    <span className="vih-service-desc">{service.desc}</span>
                  </span>
                  <Icon name="ArrowRight" size={19} color="var(--ink-mute)" />
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="vih-col">
        {selected && <PetCard pet={selected} onNavigate={onNavigate} />}

        <section
          className="vih-card vih-card-padded vih-reorder"
          style={{ animationDelay: "0.16s" }}
        >
          <h2 className="vih-section-title compact">Reservar de nuevo</h2>
          {lastTwo.length === 0 && (
            <p className="vih-muted">Cuando completes un servicio aparecerá aquí.</p>
          )}
          {lastTwo.map((servicio, idx) => {
            const meta = metaForTipo(servicio.tipoServicio);
            return (
              <button
                key={servicio.id}
                type="button"
                className="vih-reorder-row vih-press"
                style={{ borderTop: idx === 0 ? "none" : "1px solid var(--line)" }}
                onClick={() => {
                  const service = serviceForTipo(servicio.tipoServicio);
                  if (service) onServiceRequest(service);
                  else showToast(`Reservar de nuevo: ${meta.title}`);
                }}
              >
                <span
                  className="vih-reorder-icon"
                  style={{ background: TONE[meta.tone].fill }}
                >
                  <Icon
                    name={meta.icon}
                    size={21}
                    color={TONE[meta.tone].ic}
                    stroke={2.1}
                  />
                </span>
                <span className="vih-reorder-body">
                  <span className="vih-reorder-title">{meta.title}</span>
                  <span className="vih-reorder-sub">
                    {formatDate(servicio.createdAt)}
                  </span>
                </span>
                <Icon name="RotateCcw" size={18} color="var(--ink-mute)" />
              </button>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function navForService(key: ServiceEntry["key"]): NavKey {
  switch (key) {
    case "paseo":
      return "walks";
    case "vet":
      return "veterinary";
    case "pelu":
      return "grooming";
    case "shop":
      return "shop";
  }
}

function serviceForTipo(tipo: string) {
  switch (tipo) {
    case "paseo":
      return SERVICES.find((service) => service.key === "paseo");
    case "veterinaria":
      return SERVICES.find((service) => service.key === "vet");
    case "peluqueria":
      return SERVICES.find((service) => service.key === "pelu");
    default:
      return undefined;
  }
}

function ActiveWalkSnapshot({ onOpen }: { onOpen: () => void }) {
  const { walk, advancePhase, cancel } = useSimulatedWalk();
  if (!walk) return null;
  const profile = profileForPet(walk.mascota.id);
  const initials = walk.provider.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  return (
    <section className="vih-card vih-card-padded vih-active-walk">
      <div className="vih-active-walk-tag">
        <span className="vih-pulse-dot" />
        {phaseTag(walk.phase)}
      </div>
      <div className="vih-active-walk-body">
        <div className="vih-active-walk-map">
          <WalkMap
            phase={walk.phase}
            progress={walk.progress}
            providerInitials={initials}
            petName={walk.mascota.nombre}
            petHue={profile.hue}
            height={220}
          />
        </div>
        <div className="vih-active-walk-side">
          <div className="vih-active-walk-person">
            <PersonAvatar
              size={50}
              hue={walk.provider.hue}
              label={walk.provider.name}
              photoUrl={walk.provider.photoUrl}
            />
            <div>
              <p className="vih-person-name">{walk.provider.name}</p>
              <p className="vih-person-rating">
                <Icon name="Star" size={12} color="var(--gold-600)" />{" "}
                {walk.provider.rating} · {walk.provider.distanceKm} km
              </p>
            </div>
          </div>
          <div className="vih-eta">
            <p>{phaseLabel(walk.phase)}</p>
            <p className="vih-eta-time">{Math.round((1 - walk.progress) * walk.estimatedMinutes)} min</p>
          </div>
          <div className="vih-active-walk-actions">
            <button
              type="button"
              className="vih-icon-btn vih-press"
              onClick={() => cancel()}
              aria-label="Cancelar simulación"
            >
              <Icon name="X" size={18} />
            </button>
            <button
              type="button"
              className="vih-ghost vih-press"
              onClick={advancePhase}
            >
              Avanzar
            </button>
            <button
              type="button"
              className="vih-primary vih-press"
              onClick={onOpen}
            >
              <Icon name="MapPin" size={16} /> Ver en vivo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoWalkBanner({ onSimulate }: { onSimulate: () => void }) {
  return (
    <section className="vih-card vih-demo-banner">
      <div className="vih-demo-banner-text">
        <span className="vih-demo-banner-tag">DEMO INTERACTIVO</span>
        <h2>Mira cómo funciona un paseo en vivo</h2>
        <p>
          Simula el flujo completo: el aliado va a tu casa, sale a pasear con tu peludo y
          regresa. Sigue todo en el mapa con animaciones reales.
        </p>
      </div>
      <button type="button" className="vih-primary" onClick={onSimulate}>
        <Icon name="PawPrint" size={18} /> Iniciar paseo demo
      </button>
    </section>
  );
}

function PetCard({
  pet,
  onNavigate,
}: {
  pet: ReturnType<typeof usePets>["selected"];
  onNavigate: (key: NavKey) => void;
}) {
  if (!pet) return null;
  const profile = profileForPet(pet.id);
  return (
    <section className="vih-card vih-pet-card" style={{ animationDelay: "0.1s" }}>
      <div
        className="vih-pet-card-hero"
        style={{
          backgroundColor: `oklch(0.93 0.06 ${profile.hue})`,
          backgroundImage: `repeating-linear-gradient(-45deg, oklch(0.5 0.1 ${profile.hue} / 0.12) 0 10px, transparent 10px 20px)`,
        }}
      >
        {pet.fotoUrl && (
          <img src={pet.fotoUrl} alt={pet.nombre} className="vih-pet-card-hero-img" />
        )}
        {!pet.fotoUrl && (
          <Icon name="PawPrint" size={42} color={`oklch(0.45 0.12 ${profile.hue})`} />
        )}
      </div>
      <div className="vih-pet-card-body">
        <div className="vih-pet-card-profile">
          <PetAvatar pet={pet} size={56} ring />
          <div>
            <p className="vih-pet-name">{pet.nombre}</p>
            <p className="vih-pet-kind">
              {pet.raza || "Mascota"}
              {pet.edad ? ` · ${pet.edad} ${pet.edad === 1 ? "año" : "años"}` : ""}
              {pet.peso ? ` · ${pet.peso} kg` : ""}
            </p>
          </div>
        </div>
        <div className="vih-pet-badges">
          <div className="vih-pet-badge">
            <span className="vih-pet-badge-icon">
              <Icon name="Syringe" size={16} color="var(--green-cta)" />
            </span>
            <p>
              <strong>Vacunas</strong>
              <span>Al día</span>
            </p>
          </div>
          <div className="vih-pet-badge">
            <span className="vih-pet-badge-icon">
              <Icon name="HeartPulse" size={16} color="var(--green-cta)" />
            </span>
            <p>
              <strong>Control</strong>
              <span>En 12 días</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          className="vih-pet-card-link"
          onClick={() => onNavigate("pets")}
        >
          Ver perfil completo <Icon name="ArrowRight" size={14} />
        </button>
      </div>
    </section>
  );
}

function metaForTipo(tipo: string): {
  title: string;
  icon: import("../components/Icon").IconName;
  tone: keyof typeof TONE;
} {
  switch (tipo) {
    case "veterinaria":
      return { title: "Control veterinario", icon: "Stethoscope", tone: "gold" };
    case "peluqueria":
      return { title: "Baño y corte", icon: "Bath", tone: "mint" };
    case "paseo":
      return { title: "Paseo programado", icon: "PawPrint", tone: "green" };
    default:
      return { title: "Servicio", icon: "CalendarCheck", tone: "plain" };
  }
}

function formatDate(iso: string) {
  if (!iso || iso.startsWith("0001")) return "Reciente";
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Reciente";
    return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  } catch {
    return "Reciente";
  }
}
