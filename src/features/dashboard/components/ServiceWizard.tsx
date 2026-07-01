import { useMemo, useState } from "react";
import { DialogPortal } from "./DialogPortal";
import { Icon } from "./Icon";
import { PetAvatar } from "./PetAvatar";
import { ProviderCard } from "./ProviderCard";
import { useToast } from "./ToastProvider";
import { usePets } from "../state/PetContext";
import { useSimulatedWalk } from "../state/SimulatedWalkContext";
import {
  ADDONS,
  PAYMENT_METHODS,
  providersFor,
} from "../data/providers";
import type { PaymentMethodOption, Provider, ProviderKind, ServiceAddon } from "../data/providers";
import { TONE } from "../data/catalog";
import type { ServiceEntry } from "../data/catalog";
import { solicitarServicio } from "../../services/api/serviciosApi";
import { procesarPago } from "../../payments/api/pagosApi";
import { ApiError } from "../../../lib/api/apiClient";
import type { Mascota, TipoServicio } from "../../../types/domain";
import "./ServiceWizard.css";

type ServiceWizardProps = {
  service: ServiceEntry;
  token: string;
  onClose: () => void;
  onCompleted: (info: { totalCop: number; method: string; provider: Provider; mascota: Mascota }) => void;
};

type Step = 1 | 2 | 3 | 4;

const SERVICE_TIERS: Record<ProviderKind, { id: string; label: string; multiplier: number; subtitle: string }[]> = {
  walker: [
    { id: "express", label: "Express", subtitle: "30 min, cerca a casa", multiplier: 0.6 },
    { id: "standard", label: "Estándar", subtitle: "1 hora, paseo completo", multiplier: 1 },
    { id: "premium", label: "Premium", subtitle: "90 min + parque", multiplier: 1.6 },
  ],
  vet: [
    { id: "consulta", label: "Consulta general", subtitle: "Revisión básica", multiplier: 1 },
    { id: "vacunas", label: "Vacunación", subtitle: "Aplicación + certificado", multiplier: 1.2 },
    { id: "urgencia", label: "Urgencia", subtitle: "Atención prioritaria", multiplier: 1.8 },
  ],
  groomer: [
    { id: "bano", label: "Solo baño", subtitle: "Baño + secado", multiplier: 0.7 },
    { id: "bano-corte", label: "Baño + corte", subtitle: "Servicio completo", multiplier: 1 },
    { id: "spa", label: "Spa premium", subtitle: "Tratamiento integral", multiplier: 1.5 },
  ],
};

const KIND_BY_SERVICE: Record<"paseo" | "vet" | "pelu", ProviderKind> = {
  paseo: "walker",
  vet: "vet",
  pelu: "groomer",
};

const TIPO_BY_KIND: Record<ProviderKind, TipoServicio> = {
  walker: "paseo",
  vet: "veterinaria",
  groomer: "peluqueria",
};

export function ServiceWizard({ service, token, onClose, onCompleted }: ServiceWizardProps) {
  const showToast = useToast();
  const { mascotas, selected } = usePets();
  const { start } = useSimulatedWalk();

  const kind = KIND_BY_SERVICE[service.key as "paseo" | "vet" | "pelu"];
  const providers = useMemo(() => providersFor(kind), [kind]);
  const addons = ADDONS[kind];
  const tiers = SERVICE_TIERS[kind];

  const [step, setStep] = useState<Step>(1);
  const [mascotaId, setMascotaId] = useState<string>(selected?.id ?? mascotas[0]?.id ?? "");
  const [tierId, setTierId] = useState<string>(tiers[1]?.id ?? tiers[0]!.id);
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [providerId, setProviderId] = useState<string>(providers[0]!.id);
  const [addonIds, setAddonIds] = useState<Set<string>>(new Set());
  const [method, setMethod] = useState<PaymentMethodOption["value"]>("tarjeta");
  const [simulate, setSimulate] = useState<boolean>(kind === "walker");
  const [submitting, setSubmitting] = useState(false);

  const mascota = mascotas.find((m) => m.id === mascotaId);
  const provider = providers.find((p) => p.id === providerId)!;
  const tier = tiers.find((t) => t.id === tierId)!;

  const baseCost = Math.round(provider.pricePerHour * tier.multiplier);
  const addonCost = addons
    .filter((addon) => addonIds.has(addon.id))
    .reduce((sum, addon) => sum + addon.price, 0);
  const total = baseCost + addonCost;

  function toggleAddon(addon: ServiceAddon) {
    setAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(addon.id)) next.delete(addon.id);
      else next.add(addon.id);
      return next;
    });
  }

  function canAdvance() {
    if (step === 1) return Boolean(mascotaId);
    if (step === 2) return Boolean(tier) && direccion.trim().length > 0;
    if (step === 3) return Boolean(providerId);
    return true;
  }

  async function handleConfirm() {
    if (!mascota) {
      showToast("Selecciona una mascota", "error");
      return;
    }
    setSubmitting(true);
    try {
      const servicio = await solicitarServicio(
        {
          MascotaId: mascota.id,
          Horas: tier.multiplier,
          UbicacionLat: 4.65,
          UbicacionLng: -74.05,
          TipoServicio: TIPO_BY_KIND[kind],
          Direccion: direccion,
          Notas: notas || `Aliado preferido: ${provider.name}. Addons: ${
            Array.from(addonIds).join(", ") || "ninguno"
          }`,
        },
        token,
      );

      await procesarPago(
        {
          Metodo: method,
          ServicioId: servicio.id,
        },
        token,
      );

      if (simulate && kind === "walker") {
        start({
          provider,
          mascota,
          totalCop: total,
          estimatedMinutes: Math.round(tier.multiplier * 50),
        });
      }

      onCompleted({ totalCop: total, method, provider, mascota });
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "No pude completar el flujo";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogPortal>
      <div className="vih-overlay" onClick={onClose}>
        <div
          className="vih-wizard"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wizard-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="vih-wizard-header">
            <div className="vih-wizard-title">
              <span
                className="vih-dialog-icon"
                style={{ background: TONE[service.tone].fill, color: TONE[service.tone].ic }}
              >
                <Icon name={service.icon} size={22} stroke={2.2} />
              </span>
              <div>
                <h2 id="wizard-title">{service.label}</h2>
                <p>{service.desc}</p>
              </div>
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

          <div className="vih-wizard-steps">
            {["Mascota", "Detalles", "Aliado", "Pago"].map((label, idx) => {
              const num = (idx + 1) as Step;
              const done = num < step;
              const current = num === step;
              return (
                <button
                  key={label}
                  type="button"
                  className={`vih-wizard-step ${done ? "is-done" : ""} ${
                    current ? "is-current" : ""
                  }`}
                  onClick={() => num < step && setStep(num)}
                  disabled={num >= step}
                >
                  <span className="vih-wizard-step-num">{done ? <Icon name="Check" size={12} /> : num}</span>
                  {label}
                </button>
              );
            })}
          </div>

          <div className="vih-wizard-body">
            {step === 1 && (
              <div className="vih-wizard-section">
                <h3>Elige a tu mascota</h3>
                <p className="vih-muted">El aliado conocerá sus indicaciones médicas.</p>
                <div className="vih-pet-picker">
                  {mascotas.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`vih-pet-pick vih-press ${
                        m.id === mascotaId ? "is-active" : ""
                      }`}
                      onClick={() => setMascotaId(m.id)}
                    >
                      <PetAvatar pet={m} size={48} ring={m.id === mascotaId} active={m.id === mascotaId} />
                      <div>
                        <p>{m.nombre}</p>
                        <span>{m.raza}</span>
                      </div>
                    </button>
                  ))}
                  {mascotas.length === 0 && (
                    <p className="vih-muted">Agrega una mascota antes de continuar.</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="vih-wizard-section">
                <h3>Configura el servicio</h3>
                <div className="vih-tier-grid">
                  {tiers.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`vih-tier-card vih-press ${
                        t.id === tierId ? "is-active" : ""
                      }`}
                      onClick={() => setTierId(t.id)}
                    >
                      <strong>{t.label}</strong>
                      <span>{t.subtitle}</span>
                      <em>x{t.multiplier}</em>
                    </button>
                  ))}
                </div>

                <label className="vih-input">
                  <span className="vih-label-text">Dirección<span className="vih-required" aria-hidden="true">*</span></span>
                  <input
                    value={direccion}
                    onChange={(event) => setDireccion(event.target.value)}
                    placeholder="Calle 123 # 45-67"
                    required
                  />
                </label>

                <label className="vih-input">
                  Notas para el aliado
                  <textarea
                    value={notas}
                    onChange={(event) => setNotas(event.target.value)}
                    rows={2}
                    placeholder="Comportamientos especiales, ubicación exacta..."
                  />
                </label>

                <div className="vih-addon-group">
                  <p className="vih-addon-title">Añade extras (opcional)</p>
                  {addons.map((addon) => {
                    const active = addonIds.has(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        className={`vih-addon-row vih-press ${active ? "is-active" : ""}`}
                        onClick={() => toggleAddon(addon)}
                      >
                        <span className="vih-addon-check" aria-hidden="true">
                          {active && <Icon name="Check" size={12} />}
                        </span>
                        <div className="vih-addon-meta">
                          <p>{addon.label}</p>
                          <span>{addon.description}</span>
                        </div>
                        <strong>+{formatMoney(addon.price)}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="vih-wizard-section">
                <h3>Elige a tu aliado</h3>
                <p className="vih-muted">
                  Todos verificados, con seguro de servicio y reseña visible.
                </p>
                <div className="vih-provider-list">
                  {providers.map((p) => (
                    <ProviderCard
                      key={p.id}
                      provider={p}
                      selected={p.id === providerId}
                      onSelect={() => setProviderId(p.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="vih-wizard-section">
                <h3>Confirma y paga</h3>

                <div className="vih-summary">
                  <div className="vih-summary-row">
                    <span>{service.label} ({tier.label})</span>
                    <strong>{formatMoney(baseCost)}</strong>
                  </div>
                  {addons
                    .filter((a) => addonIds.has(a.id))
                    .map((a) => (
                      <div key={a.id} className="vih-summary-row vih-summary-sub">
                        <span>+ {a.label}</span>
                        <span>{formatMoney(a.price)}</span>
                      </div>
                    ))}
                  <div className="vih-summary-row vih-summary-total">
                    <span>Total</span>
                    <strong>{formatMoney(total)}</strong>
                  </div>
                </div>

                <div className="vih-summary-meta">
                  <div>
                    <span>Para</span>
                    <p>{mascota?.nombre}</p>
                  </div>
                  <div>
                    <span>Con</span>
                    <p>{provider.name}</p>
                  </div>
                  <div>
                    <span>ETA</span>
                    <p>{provider.etaMin} min</p>
                  </div>
                </div>

                <div className="vih-method-group">
                  <p className="vih-addon-title">Método de pago<span className="vih-required" aria-hidden="true">*</span></p>
                  <div className="vih-method-grid">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        className={`vih-method-card vih-press ${
                          method === m.value ? "is-active" : ""
                        }`}
                        onClick={() => setMethod(m.value)}
                      >
                        <Icon name={m.icon} size={18} />
                        <div>
                          <strong>{m.label}</strong>
                          <span>{m.hint}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {kind === "walker" && (
                  <label className="vih-toggle">
                    <input
                      type="checkbox"
                      checked={simulate}
                      onChange={(event) => setSimulate(event.target.checked)}
                    />
                    <span>
                      <strong>Iniciar simulación de paseo en vivo</strong>
                      Mapa animado con el paseador y {mascota?.nombre} en tiempo real.
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          <footer className="vih-wizard-footer">
            <button
              type="button"
              className="vih-ghost"
              onClick={() => (step > 1 ? setStep((step - 1) as Step) : onClose())}
              disabled={submitting}
            >
              {step > 1 ? "Atrás" : "Cancelar"}
            </button>
            {step < 4 ? (
              <button
                type="button"
                className="vih-primary"
                onClick={() => canAdvance() && setStep((step + 1) as Step)}
                disabled={!canAdvance()}
              >
                Continuar <Icon name="ArrowRight" size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="vih-primary"
                onClick={() => void handleConfirm()}
                disabled={submitting}
              >
                <Icon name="CreditCard" size={16} />
                {submitting ? "Procesando..." : `Pagar ${formatMoney(total)}`}
              </button>
            )}
          </footer>
        </div>
      </div>
    </DialogPortal>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
