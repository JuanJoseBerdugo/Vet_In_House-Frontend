import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { useToast } from "../components/ToastProvider";
import { listHistorialServicios } from "../../services/api/serviciosApi";
import { listMisOrdenes } from "../../shop/api/pedidosApi";
import { ApiError } from "../../../lib/api/apiClient";
import type { Pedido, Servicio } from "../../../types/domain";

type MisPedidosViewProps = {
  token: string;
};

type Tab = "servicios" | "pedidos";

export function MisPedidosView({ token }: MisPedidosViewProps) {
  const showToast = useToast();
  const [tab, setTab] = useState<Tab>("servicios");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([listHistorialServicios(token), listMisOrdenes(token)]).then(
      ([s, p]) => {
        if (cancelled) return;
        if (s.status === "fulfilled") setServicios(s.value);
        else if (s.reason instanceof ApiError) showToast(s.reason.message, "error");
        if (p.status === "fulfilled") setPedidos(p.value);
        else if (p.reason instanceof ApiError) showToast(p.reason.message, "error");
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [token, showToast]);

  return (
    <section className="vih-view">
      <header className="vih-view-header">
        <div>
          <h1>Mis pedidos</h1>
          <p>Tu historial de servicios y pedidos.</p>
        </div>
      </header>

      <div className="vih-tabs">
        <button
          type="button"
          className={`vih-tab ${tab === "servicios" ? "is-active" : ""}`}
          onClick={() => setTab("servicios")}
        >
          <Icon name="CalendarCheck" size={16} /> Servicios ({servicios.length})
        </button>
        <button
          type="button"
          className={`vih-tab ${tab === "pedidos" ? "is-active" : ""}`}
          onClick={() => setTab("pedidos")}
        >
          <Icon name="ShoppingBag" size={16} /> Compras ({pedidos.length})
        </button>
      </div>

      {loading && <p className="vih-loading">Cargando historial...</p>}

      {!loading && tab === "servicios" && (
        <div className="vih-card vih-list">
          {servicios.length === 0 && (
            <p className="vih-muted vih-list-empty">Aún no has solicitado servicios.</p>
          )}
          {servicios.map((servicio) => (
            <div key={servicio.id} className="vih-list-row">
              <span className={`vih-status vih-status-${servicio.estado}`}>
                {labelEstado(servicio.estado)}
              </span>
              <div className="vih-list-body">
                <p className="vih-list-title">{labelTipo(servicio.tipoServicio)}</p>
                <p className="vih-list-meta">
                  {formatDateTime(servicio.createdAt)} · {servicio.horas} h
                  {servicio.direccion ? ` · ${servicio.direccion}` : ""}
                </p>
              </div>
              <p className="vih-list-amount">{formatMoney(servicio.tarifaTotal)}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "pedidos" && (
        <div className="vih-card vih-list">
          {pedidos.length === 0 && (
            <p className="vih-muted vih-list-empty">Aún no has hecho compras.</p>
          )}
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="vih-list-row">
              <span className={`vih-status vih-status-${pedido.estado}`}>
                {labelEstado(pedido.estado)}
              </span>
              <div className="vih-list-body">
                <p className="vih-list-title">Compra #{shortId(pedido.id)}</p>
                <p className="vih-list-meta">
                  {formatDateTime(pedido.createdAt)} · {pedido.direccionEnvio}
                </p>
              </div>
              <p className="vih-list-amount">{formatMoney(pedido.total)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function labelTipo(tipo: string) {
  switch (tipo) {
    case "paseo":
      return "Paseo";
    case "veterinaria":
      return "Consulta veterinaria";
    case "peluqueria":
      return "Peluquería";
    default:
      return tipo;
  }
}

function labelEstado(estado: string) {
  return estado.replace("_", " ");
}

function formatDateTime(iso: string) {
  if (!iso || iso.startsWith("0001")) return "Sin fecha";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Sin fecha";
    return d.toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Sin fecha";
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}
