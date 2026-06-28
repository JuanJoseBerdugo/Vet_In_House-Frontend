import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { PersonAvatar } from "../components/PersonAvatar";
import { WalkMap } from "../components/WalkMap";
import { SERVICES, TONE, profileForPet } from "../data/catalog";
import type { ServiceEntry } from "../data/catalog";
import { ADDONS, providersFor } from "../data/providers";
import type { Provider, ProviderKind } from "../data/providers";
import { usePets } from "../state/PetContext";
import {
  phaseLabel,
  useSimulatedWalk,
} from "../state/SimulatedWalkContext";
import { useToast } from "../components/ToastProvider";
import {
  listAliadosServicio,
  listServicioExtras,
} from "../../marketing/api/marketingApi";
import type {
  AliadoServicio,
  ServicioExtra,
  TipoServicio,
} from "../../../types/domain";

export type ServiceFeatureKey = "paseo" | "vet" | "pelu";

type ServiceFeatureViewProps = {
  serviceKey: ServiceFeatureKey;
  onServiceRequest: (service: ServiceEntry) => void;
  onOpenLive?: () => void;
};

type ToneKey = keyof typeof TONE;

type FeatureStat = {
  label: string;
  value: string;
  note: string;
  icon: IconName;
  tone: ToneKey;
};

type FeatureStep = {
  title: string;
  body: string;
  icon: IconName;
};

type FeaturePackage = {
  title: string;
  price: string;
  description: string;
  points: string[];
};

type DisplayProvider = Provider;

type DisplayAddon = {
  id: string;
  label: string;
  description: string;
  price: number;
};

type FeatureConfig = {
  eyebrow: string;
  title: string;
  intro: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryToast: string;
  heroBullets: string[];
  stats: FeatureStat[];
  steps: FeatureStep[];
  packages: FeaturePackage[];
  careNotes: FeatureStep[];
};

const KIND_BY_SERVICE: Record<ServiceFeatureKey, ProviderKind> = {
  paseo: "walker",
  vet: "vet",
  pelu: "groomer",
};

const TIPO_BY_SERVICE: Record<ServiceFeatureKey, TipoServicio> = {
  paseo: "paseo",
  vet: "veterinaria",
  pelu: "peluqueria",
};

const FEATURE_CONFIG: Record<ServiceFeatureKey, FeatureConfig> = {
  paseo: {
    eyebrow: "PASEOS CON SEGUIMIENTO",
    title: "Rutas cuidadas para gastar energía sin salir de tu rutina",
    intro:
      "Agenda paseos por duración, distancia y energía de tu mascota. Vet-In-House muestra aliados cercanos, seguimiento en vivo y reporte al finalizar.",
    primaryLabel: "Reservar paseo",
    secondaryLabel: "Ver demo en vivo",
    secondaryToast: "Demo de paseo iniciada",
    heroBullets: ["GPS en vivo", "Paseadores verificados", "Reporte fotográfico"],
    stats: [
      { label: "ETA aliado", value: "6-18 min", note: "según cercanía", icon: "MapPin", tone: "green" },
      { label: "Rutas", value: "3 modos", note: "express, estándar, premium", icon: "PawPrint", tone: "mint" },
      { label: "Control", value: "Chat + mapa", note: "durante todo el paseo", icon: "MessageCircle", tone: "plain" },
      { label: "Desde", value: "$22k", note: "por servicio", icon: "Wallet", tone: "gold" },
    ],
    steps: [
      { title: "Elige mascota y energía", body: "Usamos su perfil para adaptar ritmo, duración y notas de manejo.", icon: "Dog" },
      { title: "Compara aliados", body: "Filtra por cercanía, calificación, experiencia y especialidad.", icon: "Star" },
      { title: "Sigue el recorrido", body: "La simulación muestra fases claras: aliado en camino, paseo y regreso.", icon: "MapPin" },
      { title: "Recibe el cierre", body: "El historial queda listo para consultar servicios anteriores.", icon: "CalendarCheck" },
    ],
    packages: [
      { title: "Express", price: "30 min", description: "Ideal para pausa corta y perros con rutina estable.", points: ["Cerca de casa", "Salida rápida", "Reporte básico"] },
      { title: "Estándar", price: "1 hora", description: "La opción balanceada para caminar, olfatear y socializar.", points: ["Ruta completa", "Chat activo", "Fotos al cierre"] },
      { title: "Premium", price: "90 min", description: "Más tiempo al aire libre, parque y actividad guiada.", points: ["Parque cercano", "Snacks opcionales", "Seguimiento extendido"] },
    ],
    careNotes: [
      { title: "Seguridad primero", body: "Notas de correa, temperamento y salud visibles para el aliado.", icon: "ShieldCheck" },
      { title: "Rutas flexibles", body: "Paseos cortos, largos o con paradas según lo que necesite tu mascota.", icon: "MapPin" },
      { title: "Confianza visible", body: "Distancia, rating y experiencia antes de confirmar el pago.", icon: "Star" },
    ],
  },
  vet: {
    eyebrow: "VETERINARIA A DOMICILIO",
    title: "Consulta, vacunación y seguimiento clínico sin mover a tu mascota",
    intro:
      "Centraliza la atención médica con veterinarios domiciliarios, historial clínico, carnet de vacunas y pagos desde la plataforma.",
    primaryLabel: "Solicitar consulta",
    secondaryLabel: "Ver historial",
    secondaryToast: "El historial clínico está en Mis mascotas",
    heroBullets: ["Carnet de vacunas", "Historia clínica", "Atención en casa"],
    stats: [
      { label: "Llegada", value: "35-55 min", note: "según agenda", icon: "Calendar", tone: "green" },
      { label: "Registro", value: "Clínico", note: "consultas y vacunas", icon: "HeartPulse", tone: "mint" },
      { label: "Servicios", value: "24/7", note: "urgencias simuladas", icon: "Stethoscope", tone: "plain" },
      { label: "Desde", value: "$80k", note: "consulta base", icon: "Wallet", tone: "gold" },
    ],
    steps: [
      { title: "Selecciona la mascota", body: "El veterinario recibe raza, edad, peso y notas médicas.", icon: "Dog" },
      { title: "Define el motivo", body: "Consulta general, vacunación o urgencia prioritaria.", icon: "Stethoscope" },
      { title: "Elige profesional", body: "Compara especialidades como dermatología, nutrición o geriatría.", icon: "Star" },
      { title: "Actualiza salud", body: "El carnet y la historia quedan como centro de control del perfil.", icon: "Syringe" },
    ],
    packages: [
      { title: "Consulta general", price: "Desde $80k", description: "Revisión básica, signos vitales y recomendaciones.", points: ["Examen físico", "Plan de cuidado", "Notas clínicas"] },
      { title: "Vacunación", price: "Desde $96k", description: "Aplicación con certificado y recordatorio futuro.", points: ["Carnet", "Lote y fecha", "Próxima dosis"] },
      { title: "Urgencia", price: "Prioritaria", description: "Atención rápida cuando necesitas una visita especial.", points: ["Prioridad alta", "Triage inicial", "Seguimiento"] },
    ],
    careNotes: [
      { title: "Historial completo", body: "Consultas, vacunas y alergias deberían vivir en una sola vista por mascota.", icon: "HeartPulse" },
      { title: "Recordatorios", body: "El dashboard puede avisar próximas vacunas o controles.", icon: "Bell" },
      { title: "Pagos asociados", body: "Cada atención queda ligada al pago y al pedido de servicio.", icon: "Receipt" },
    ],
  },
  pelu: {
    eyebrow: "PELUQUERÍA Y SPA MÓVIL",
    title: "Baño, corte y cuidado estético en casa, sin estresar a tu peludo",
    intro:
      "Agenda peluquería domiciliaria con aliados equipados, productos adecuados y extras de spa para razas pequeñas, grandes o mascotas nerviosas.",
    primaryLabel: "Agendar peluquería",
    secondaryLabel: "Ver extras",
    secondaryToast: "Revisa los extras disponibles en esta misma sección",
    heroBullets: ["Spa móvil", "Productos seguros", "Corte por raza"],
    stats: [
      { label: "Llegada", value: "25-40 min", note: "aliados cercanos", icon: "MapPin", tone: "green" },
      { label: "Planes", value: "3 niveles", note: "baño, corte, spa", icon: "Bath", tone: "mint" },
      { label: "Cuidado", value: "Hipoalergénico", note: "opcional", icon: "ShieldCheck", tone: "plain" },
      { label: "Desde", value: "$45k", note: "servicio base", icon: "Wallet", tone: "gold" },
    ],
    steps: [
      { title: "Prepara el perfil", body: "Raza, peso y notas ayudan a calcular equipo y tiempo.", icon: "Dog" },
      { title: "Selecciona el plan", body: "Baño, baño con corte o spa premium según necesidad.", icon: "Bath" },
      { title: "Elige especialista", body: "Compara experiencia, distancia y especialidades de cada aliado.", icon: "Star" },
      { title: "Paga y agenda", body: "El servicio queda en pedidos para repetirlo luego.", icon: "CreditCard" },
    ],
    packages: [
      { title: "Solo baño", price: "Desde $45k", description: "Baño, secado y limpieza general para rutina frecuente.", points: ["Secado", "Cepillado", "Oídos"] },
      { title: "Baño + corte", price: "Completo", description: "Corte funcional o de raza con acabado profesional.", points: ["Corte", "Uñas opcional", "Aromatización"] },
      { title: "Spa premium", price: "Tratamiento", description: "Mascarilla, hidratación y detalle para piel sensible.", points: ["Hidratación", "Perfume suave", "Reporte final"] },
    ],
    careNotes: [
      { title: "Menos estrés", body: "La atención en casa evita traslados y esperas largas.", icon: "HeartPulse" },
      { title: "Extras visibles", body: "Puedes sumar perfume, limado de uñas o mascarilla spa.", icon: "Plus" },
      { title: "Repetir fácil", body: "Los servicios finalizados quedan listos para reservar de nuevo.", icon: "RotateCcw" },
    ],
  },
};

export function ServiceFeatureView({
  serviceKey,
  onServiceRequest,
  onOpenLive,
}: ServiceFeatureViewProps) {
  const showToast = useToast();
  const { selected } = usePets();
  const { walk, start } = useSimulatedWalk();
  const service = SERVICES.find((item) => item.key === serviceKey);
  const config = FEATURE_CONFIG[serviceKey];
  const kind = KIND_BY_SERVICE[serviceKey];
  const tipoServicio = TIPO_BY_SERVICE[serviceKey];
  const fallbackProviders = useMemo(
    () => providersFor(kind).map(providerToDisplay),
    [kind],
  );
  const fallbackAddons = useMemo(
    () => ADDONS[kind].map(addonToDisplay),
    [kind],
  );
  const [apiProviders, setApiProviders] = useState<DisplayProvider[]>([]);
  const [apiAddons, setApiAddons] = useState<DisplayAddon[]>([]);
  const selectedProfile = selected ? profileForPet(selected.id) : null;
  const providers = apiProviders.length > 0 ? apiProviders : fallbackProviders;
  const addons = apiAddons.length > 0 ? apiAddons : fallbackAddons;
  const leadProvider = providers[0];

  useEffect(() => {
    let cancelled = false;

    listAliadosServicio(tipoServicio)
      .then((data) => {
        if (!cancelled) setApiProviders(data.map(aliadoToDisplay));
      })
      .catch(() => {
        if (!cancelled) setApiProviders([]);
      });

    listServicioExtras(tipoServicio)
      .then((data) => {
        if (!cancelled) setApiAddons(data.map(extraToDisplay));
      })
      .catch(() => {
        if (!cancelled) setApiAddons([]);
      });

    return () => {
      cancelled = true;
    };
  }, [tipoServicio]);

  if (!service) return null;

  const currentService = service;

  function handlePrimary() {
    onServiceRequest(currentService);
  }

  function handleSecondary() {
    if (serviceKey === "paseo") {
      if (!selected || !leadProvider) {
        showToast("Agrega o selecciona una mascota para iniciar el demo", "error");
        return;
      }

      start({
        provider: leadProvider,
        mascota: selected,
        totalCop: leadProvider.pricePerHour,
        estimatedMinutes: 45,
      });
      showToast(config.secondaryToast, "success");
      onOpenLive?.();
      return;
    }

    showToast(config.secondaryToast);
  }

  return (
    <section className={`vih-view vih-feature-page vih-feature-page-${serviceKey}`}>
      <header className="vih-view-header">
        <div>
          <h1>{service.label}</h1>
          <p>{service.desc}</p>
        </div>
        <div className="vih-feature-header-actions">
          {serviceKey === "paseo" && walk && onOpenLive && (
            <button type="button" className="vih-ghost vih-press" onClick={onOpenLive}>
              <span className="vih-pulse-dot" />
              {phaseLabel(walk.phase)}
            </button>
          )}
          <button type="button" className="vih-primary vih-press" onClick={handlePrimary}>
            <Icon name={service.icon} size={18} />
            {config.primaryLabel}
          </button>
        </div>
      </header>

      <section className="vih-feature-hero">
        <div className="vih-feature-hero-copy">
          <span className="vih-demo-banner-tag">{config.eyebrow}</span>
          <h2>{config.title}</h2>
          <p>{config.intro}</p>
          <div className="vih-feature-bullet-row">
            {config.heroBullets.map((bullet) => (
              <span key={bullet}>
                <Icon name="Check" size={13} />
                {bullet}
              </span>
            ))}
          </div>
          <div className="vih-feature-actions">
            <button type="button" className="vih-primary vih-press" onClick={handlePrimary}>
              {config.primaryLabel}
              <Icon name="ArrowRight" size={16} />
            </button>
            <button type="button" className="vih-ghost vih-press" onClick={handleSecondary}>
              {config.secondaryLabel}
            </button>
          </div>
        </div>

        <div className="vih-feature-hero-visual">
          {serviceKey === "paseo" ? (
            <WalkMap
              phase={walk?.phase ?? "paseando"}
              progress={walk?.progress ?? 0.46}
              providerInitials={initialsFor(leadProvider?.name ?? "Aliado Vet")}
              petName={selected?.nombre ?? "Mascota"}
              petHue={selectedProfile?.hue ?? 150}
              height={300}
            />
          ) : (
            <div className="vih-feature-service-visual">
              <span
                className="vih-feature-service-icon"
                style={{ background: TONE[service.tone].fill, color: TONE[service.tone].ic }}
              >
                <Icon name={service.icon} size={42} stroke={2.1} />
              </span>
              <div>
                <strong>{selected ? `Listo para ${selected.nombre}` : "Prepara el perfil"}</strong>
                <p>
                  {selected
                    ? "Usaremos sus datos de salud, raza y peso para orientar el servicio."
                    : "Agrega una mascota para reservar con datos completos."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="vih-feature-stat-grid">
        {config.stats.map((stat) => (
          <article key={stat.label} className="vih-feature-stat">
            <span style={{ background: TONE[stat.tone].fill, color: TONE[stat.tone].ic }}>
              <Icon name={stat.icon} size={19} />
            </span>
            <div>
              <strong>{stat.value}</strong>
              <p>{stat.label}</p>
              <small>{stat.note}</small>
            </div>
          </article>
        ))}
      </div>

      <section className="vih-feature-section">
        <div className="vih-section-head">
          <h2 className="vih-section-title">Cómo se vive este servicio</h2>
          <span className="vih-muted">Flujo completo dentro de Vet-In-House</span>
        </div>
        <div className="vih-feature-step-grid">
          {config.steps.map((step, index) => (
            <article key={step.title} className="vih-feature-step">
              <span className="vih-feature-step-number">{index + 1}</span>
              <Icon name={step.icon} size={21} color="var(--green-cta)" />
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="vih-feature-two-col">
        <section className="vih-feature-section">
          <div className="vih-section-head">
            <h2 className="vih-section-title">Planes sugeridos</h2>
          </div>
          <div className="vih-feature-package-grid">
            {config.packages.map((item) => (
              <article key={item.title} className="vih-feature-package">
                <div className="vih-feature-package-head">
                  <strong>{item.title}</strong>
                  <span>{item.price}</span>
                </div>
                <p>{item.description}</p>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>
                      <Icon name="Check" size={13} />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="vih-feature-section">
          <div className="vih-section-head">
            <h2 className="vih-section-title">Extras útiles</h2>
          </div>
          <div className="vih-feature-addon-list">
            {addons.map((addon) => (
              <FeatureAddonRow key={addon.id} addon={addon} />
            ))}
          </div>
        </section>
      </div>

      <section className="vih-feature-section">
        <div className="vih-section-head">
          <h2 className="vih-section-title">Aliados destacados</h2>
          <button type="button" className="vih-ghost vih-press" onClick={handlePrimary}>
            Comparar todos <Icon name="ArrowRight" size={15} />
          </button>
        </div>
        <div className="vih-feature-provider-grid">
          {providers.map((provider) => (
            <FeatureProviderCard
              key={provider.id}
              provider={provider}
              onSelect={handlePrimary}
            />
          ))}
        </div>
      </section>

      <section className="vih-feature-section">
        <div className="vih-section-head">
          <h2 className="vih-section-title">Detalles que faltaría seguir potenciando</h2>
          <span className="vih-muted">No requiere SQL adicional para esta versión visual</span>
        </div>
        <div className="vih-feature-care-grid">
          {config.careNotes.map((note) => (
            <article key={note.title} className="vih-feature-care">
              <Icon name={note.icon} size={22} color="var(--green-cta)" />
              <strong>{note.title}</strong>
              <p>{note.body}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function FeatureProviderCard({
  provider,
  onSelect,
}: {
  provider: DisplayProvider;
  onSelect: () => void;
}) {
  return (
    <button type="button" className="vih-feature-provider-card vih-press" onClick={onSelect}>
      <div className="vih-feature-provider-head">
        <PersonAvatar
          size={52}
          hue={provider.hue}
          label={provider.name}
          photoUrl={provider.photoUrl}
        />
        <div>
          <strong>{provider.name}</strong>
          <span>
            <Icon name="Star" size={13} color="var(--gold-600)" />
            {provider.rating.toFixed(2)} ({provider.reviews})
          </span>
        </div>
      </div>
      {provider.badge && <span className="vih-provider-badge">{provider.badge}</span>}
      <p>{provider.bio}</p>
      <div className="vih-provider-card-tags">
        {provider.specialties.slice(0, 3).map((specialty) => (
          <span key={specialty} className="vih-provider-card-tag">
            {specialty}
          </span>
        ))}
      </div>
      <div className="vih-feature-provider-meta">
        <span>{provider.distanceKm.toFixed(1)} km</span>
        <span>{provider.etaMin} min</span>
        <span>{formatMoney(provider.pricePerHour)}</span>
      </div>
    </button>
  );
}

function FeatureAddonRow({ addon }: { addon: DisplayAddon }) {
  return (
    <article className="vih-feature-addon">
      <span>
        <Icon name="Plus" size={15} />
      </span>
      <div>
        <strong>{addon.label}</strong>
        <p>{addon.description}</p>
      </div>
      <em>+{formatMoney(addon.price)}</em>
    </article>
  );
}

function providerToDisplay(provider: ReturnType<typeof providersFor>[number]): DisplayProvider {
  return {
    id: provider.id,
    kind: provider.kind,
    name: provider.name,
    photoUrl: provider.photoUrl,
    rating: provider.rating,
    reviews: provider.reviews,
    distanceKm: provider.distanceKm,
    etaMin: provider.etaMin,
    hue: provider.hue,
    badge: provider.badge,
    bio: provider.bio,
    specialties: provider.specialties,
    pricePerHour: provider.pricePerHour,
    experienceYears: provider.experienceYears,
  };
}

function aliadoToDisplay(aliado: AliadoServicio): DisplayProvider {
  return {
    id: aliado.id,
    kind: kindForTipoServicio(aliado.tipoServicio),
    name: aliado.nombre,
    photoUrl: aliado.fotoUrl,
    rating: aliado.rating,
    reviews: aliado.reviews,
    distanceKm: aliado.distanciaKm,
    etaMin: aliado.etaMin,
    hue: aliado.hue,
    badge: aliado.badge ?? undefined,
    bio: aliado.bio,
    specialties: aliado.especialidades,
    pricePerHour: aliado.precioBase,
    experienceYears: aliado.experienciaAnios,
  };
}

function kindForTipoServicio(tipoServicio: TipoServicio): ProviderKind {
  switch (tipoServicio) {
    case "veterinaria":
      return "vet";
    case "peluqueria":
      return "groomer";
    case "paseo":
      return "walker";
  }
}

function addonToDisplay(addon: { id: string; label: string; description: string; price: number }): DisplayAddon {
  return {
    id: addon.id,
    label: addon.label,
    description: addon.description,
    price: addon.price,
  };
}

function extraToDisplay(extra: ServicioExtra): DisplayAddon {
  return {
    id: extra.id,
    label: extra.nombre,
    description: extra.descripcion,
    price: extra.precio,
  };
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
