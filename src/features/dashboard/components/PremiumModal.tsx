import { useEffect, useMemo, useState } from "react";
import { DialogPortal } from "./DialogPortal";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { listPlanesPremium } from "../../marketing/api/marketingApi";
import type { PlanPremium } from "../../../types/domain";

type PremiumModalProps = {
  onClose: () => void;
};

const BENEFITS: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "PawPrint",
    title: "Paseos con prioridad",
    desc: "Acceso preferente a aliados mejor calificados y rutas extendidas.",
  },
  {
    icon: "HeartPulse",
    title: "Salud con descuento",
    desc: "Ahorros en consultas, vacunas y controles preventivos a domicilio.",
  },
  {
    icon: "ShoppingBag",
    title: "Petshop especial",
    desc: "Promociones de alimentos, juguetes y productos de cuidado mensual.",
  },
  {
    icon: "ShieldCheck",
    title: "Soporte premium",
    desc: "Acompañamiento rápido en servicios activos y seguimiento de incidentes.",
  },
];

export function PremiumModal({ onClose }: PremiumModalProps) {
  const [planes, setPlanes] = useState<PlanPremium[]>([]);

  useEffect(() => {
    let cancelled = false;
    listPlanesPremium()
      .then((data) => {
        if (!cancelled) setPlanes(data);
      })
      .catch(() => {
        if (!cancelled) setPlanes([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const plan = planes[0];
  const benefits = useMemo(
    () =>
      plan
        ? plan.beneficios.map((beneficio, index) => ({
            icon: iconForBenefit(index),
            title: beneficio,
            desc: benefitDescription(beneficio),
          }))
        : BENEFITS,
    [plan],
  );

  return (
    <DialogPortal>
      <div className="vih-overlay" onClick={onClose}>
        <section
          className="vih-premium-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="premium-title"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="vih-icon-btn vih-press vih-premium-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <Icon name="X" size={18} />
          </button>

          <div className="vih-premium-hero">
            <span className="vih-premium-crown">
              <Icon name="Crown" size={28} color="var(--gold-600)" />
            </span>
            <span className="vih-demo-banner-tag">CLUB PREMIUM</span>
            <h2 id="premium-title">{plan?.nombre ?? "Más cuidado, menos fricción"}</h2>
            <p>
              {plan?.descripcion ??
                "Una membresía pensada para familias con rutinas activas y mascotas que necesitan acompañamiento constante."}
            </p>
            <div className="vih-premium-price">
              <strong>{formatMoney(plan?.precioMensual ?? 29900)}</strong>
              <span>/ mes</span>
            </div>
          </div>

          <div className="vih-premium-benefits">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="vih-premium-benefit">
                <span>
                  <Icon name={benefit.icon} size={19} />
                </span>
                <div>
                  <strong>{benefit.title}</strong>
                  <p>{benefit.desc}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="vih-premium-actions">
            <button type="button" className="vih-ghost" onClick={onClose}>
              Ver después
            </button>
            <button type="button" className="vih-primary" onClick={onClose}>
              Próximamente
            </button>
          </div>
        </section>
      </div>
    </DialogPortal>
  );
}

function iconForBenefit(index: number): IconName {
  const icons: IconName[] = ["PawPrint", "HeartPulse", "ShoppingBag", "ShieldCheck"];
  return icons[index % icons.length]!;
}

function benefitDescription(value: string) {
  if (value.toLowerCase().includes("paseo")) {
    return "Prioridad y mejores aliados para rutinas activas.";
  }
  if (value.toLowerCase().includes("salud") || value.toLowerCase().includes("vacuna")) {
    return "Ahorros y seguimiento preventivo para el historial clínico.";
  }
  if (value.toLowerCase().includes("petshop") || value.toLowerCase().includes("promoc")) {
    return "Beneficios especiales para productos seleccionados.";
  }
  return "Ventaja incluida dentro del club premium de Vet-In-House.";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
