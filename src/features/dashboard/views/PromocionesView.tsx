import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import {
  listPlanesPremium,
  listPromociones,
} from "../../marketing/api/marketingApi";
import type { NavKey } from "../navigation";
import type { PlanPremium, PromocionPetshop } from "../../../types/domain";

type PromocionesViewProps = {
  onNavigate: (key: NavKey) => void;
  onOpenClub: () => void;
};

const FALLBACK_PROMOS: PromocionPetshop[] = [
  {
    id: "fallback-wellness",
    titulo: "Semana de bienestar animal",
    descripcion: "Promociones para alimento, snacks y cuidado diario.",
    imagenUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Comprar ahora",
    tipo: "temporada",
    descuentoPorcentaje: 18,
    productoId: null,
    fechaInicio: null,
    fechaFin: null,
    orden: 1,
  },
  {
    id: "fallback-spa",
    titulo: "Spa en casa",
    descripcion: "Beneficios en productos de cuidado y peluquería domiciliaria.",
    imagenUrl: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Agendar spa",
    tipo: "servicio",
    descuentoPorcentaje: 12,
    productoId: null,
    fechaInicio: null,
    fechaFin: null,
    orden: 2,
  },
];

export function PromocionesView({ onNavigate, onOpenClub }: PromocionesViewProps) {
  const [promociones, setPromociones] = useState<PromocionPetshop[]>([]);
  const [planes, setPlanes] = useState<PlanPremium[]>([]);

  useEffect(() => {
    let cancelled = false;

    listPromociones()
      .then((data) => {
        if (!cancelled) setPromociones(data);
      })
      .catch(() => {
        if (!cancelled) setPromociones([]);
      });

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

  const items = promociones.length > 0 ? promociones : FALLBACK_PROMOS;
  const hero = items[0]!;
  const plan = planes[0];

  const steps = useMemo(
    () => [
      {
        icon: "ShoppingBag" as const,
        title: "Elige una promo",
        body: "Las campañas activas salen desde Supabase y se ordenan por prioridad.",
      },
      {
        icon: "CreditCard" as const,
        title: "Compra o agenda",
        body: "Puedes ir a tienda, reservar servicio o revisar el club premium.",
      },
      {
        icon: "Receipt" as const,
        title: "Paga en plataforma",
        body: "El flujo mantiene pagos y pedidos vinculados al historial.",
      },
    ],
    [],
  );

  return (
    <section className="vih-view vih-promos-page">
      <header className="vih-view-header">
        <div>
          <h1>Promociones</h1>
          <p>Campañas, descuentos y beneficios activos para Vet-In-House.</p>
        </div>
        <button type="button" className="vih-primary vih-press" onClick={() => onNavigate("shop")}>
          <Icon name="ShoppingBag" size={18} />
          Ir a tienda
        </button>
      </header>

      <section className="vih-promos-hero">
        <div className="vih-promos-hero-copy">
          <span className="vih-demo-banner-tag">PROMO ACTIVA</span>
          <h2>{hero.titulo}</h2>
          <p>{hero.descripcion}</p>
          <div className="vih-promos-hero-actions">
            <button type="button" className="vih-primary vih-press" onClick={() => routePromo(hero, onNavigate, onOpenClub)}>
              {hero.ctaLabel}
              <Icon name="ArrowRight" size={16} />
            </button>
            <button type="button" className="vih-ghost vih-press" onClick={onOpenClub}>
              <Icon name="Crown" size={16} />
              Club premium
            </button>
          </div>
        </div>
        <div
          className="vih-promos-hero-media"
          style={{ backgroundImage: hero.imagenUrl ? `url(${hero.imagenUrl})` : undefined }}
        >
          <span>{hero.descuentoPorcentaje ? `${hero.descuentoPorcentaje}% OFF` : hero.tipo}</span>
        </div>
      </section>

      <div className="vih-promos-layout">
        <section className="vih-feature-section">
          <div className="vih-section-head">
            <h2 className="vih-section-title">Promociones disponibles</h2>
            <span className="vih-muted">{items.length} campañas activas</span>
          </div>
          <div className="vih-promos-grid">
            {items.map((promo) => (
              <button
                key={promo.id}
                type="button"
                className="vih-promo-real-card vih-press"
                onClick={() => routePromo(promo, onNavigate, onOpenClub)}
              >
                <div
                  className="vih-promo-real-media"
                  style={{ backgroundImage: promo.imagenUrl ? `url(${promo.imagenUrl})` : undefined }}
                >
                  <span>{promo.descuentoPorcentaje ? `${promo.descuentoPorcentaje}% OFF` : promo.tipo}</span>
                </div>
                <div className="vih-promo-real-body">
                  <strong>{promo.titulo}</strong>
                  <p>{promo.descripcion}</p>
                  <em>{promo.ctaLabel}</em>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="vih-promos-side">
          <article className="vih-promos-premium">
            <span>
              <Icon name="Crown" size={22} />
            </span>
            <h2>{plan?.nombre ?? "Club Premium"}</h2>
            <p>
              {plan?.descripcion ??
                "Beneficios para hogares con varias mascotas, servicios recurrentes y petshop."}
            </p>
            <strong>{formatMoney(plan?.precioMensual ?? 29900)} / mes</strong>
            <button type="button" className="vih-primary vih-press" onClick={onOpenClub}>
              Ver ventajas
            </button>
          </article>

          <div className="vih-promos-steps">
            {steps.map((step) => (
              <article key={step.title}>
                <Icon name={step.icon} size={19} color="var(--green-cta)" />
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function routePromo(
  promo: PromocionPetshop,
  onNavigate: (key: NavKey) => void,
  onOpenClub: () => void,
) {
  if (promo.tipo === "premium") {
    onOpenClub();
    return;
  }

  if (promo.tipo === "servicio") {
    onNavigate("grooming");
    return;
  }

  onNavigate("shop");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
