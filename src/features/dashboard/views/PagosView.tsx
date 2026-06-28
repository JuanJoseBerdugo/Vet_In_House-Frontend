import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { useToast } from "../components/ToastProvider";
import { listHistorialServicios } from "../../services/api/serviciosApi";
import { listMisOrdenes } from "../../shop/api/pedidosApi";
import { listMisPagos, procesarPago } from "../../payments/api/pagosApi";
import { ApiError } from "../../../lib/api/apiClient";
import type { MetodoPago, Pago, Pedido, Servicio } from "../../../types/domain";

type PagosViewProps = {
  token: string;
};

type Movement = {
  id: string;
  kind: "servicio" | "pedido";
  refId: string;
  title: string;
  amount: number;
  date: string;
  estado: string;
  paid: boolean;
  pago: Pago | null;
};

const METODOS: { value: MetodoPago; label: string }[] = [
  { value: "tarjeta", label: "Tarjeta" },
  { value: "pse", label: "PSE" },
  { value: "nequi", label: "Nequi" },
  { value: "daviplata", label: "Daviplata" },
];

export function PagosView({ token }: PagosViewProps) {
  const showToast = useToast();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [metodoByItem, setMetodoByItem] = useState<Record<string, MetodoPago>>({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      listHistorialServicios(token),
      listMisOrdenes(token),
      listMisPagos(token),
    ]);
    const [s, p, pg] = results;
    if (s.status === "fulfilled") setServicios(s.value);
    else if (s.reason instanceof ApiError) showToast(s.reason.message, "error");
    if (p.status === "fulfilled") setPedidos(p.value);
    else if (p.reason instanceof ApiError) showToast(p.reason.message, "error");
    if (pg.status === "fulfilled") setPagos(pg.value);
    else if (pg.reason instanceof ApiError) showToast(pg.reason.message, "error");
    setLoading(false);
  }, [token, showToast]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const movimientos = useMemo<Movement[]>(() => {
    const pagoPorServicio = new Map<string, Pago>();
    const pagoPorPedido = new Map<string, Pago>();
    for (const pago of pagos) {
      if (pago.estado === "completado" || pago.estado === "pendiente") {
        if (pago.servicioId) {
          pagoPorServicio.set(
            pago.servicioId,
            selectVisiblePago(pagoPorServicio.get(pago.servicioId), pago),
          );
        }
        if (pago.pedidoId) {
          pagoPorPedido.set(
            pago.pedidoId,
            selectVisiblePago(pagoPorPedido.get(pago.pedidoId), pago),
          );
        }
      }
    }

    const sMov: Movement[] = servicios.map((s) => {
      const pago = pagoPorServicio.get(s.id) ?? null;
      return {
        id: `servicio-${s.id}`,
        kind: "servicio",
        refId: s.id,
        title: titleTipo(s.tipoServicio),
        amount: s.tarifaTotal,
        date: s.createdAt,
        estado: s.estado,
        paid: pago?.estado === "completado",
        pago,
      };
    });

    const pMov: Movement[] = pedidos.map((p) => {
      const pago = pagoPorPedido.get(p.id) ?? null;
      return {
        id: `pedido-${p.id}`,
        kind: "pedido",
        refId: p.id,
        title: `Compra #${p.id.slice(0, 8).toUpperCase()}`,
        amount: p.total,
        date: p.createdAt,
        estado: p.estado,
        paid: pago?.estado === "completado" || ["pagado", "enviado", "entregado"].includes(p.estado),
        pago,
      };
    });

    return [...sMov, ...pMov].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      const safeA = Number.isNaN(da) ? 0 : da;
      const safeB = Number.isNaN(db) ? 0 : db;
      return safeB - safeA;
    });
  }, [servicios, pedidos, pagos]);

  const pagados = movimientos.filter((m) => m.paid);
  const pendientes = movimientos.filter(
    (m) => !m.paid && m.estado !== "cancelado" && m.estado !== "rechazado",
  );

  const totalPagado = pagados.reduce((sum, m) => sum + m.amount, 0);
  const totalPendiente = pendientes.reduce((sum, m) => sum + m.amount, 0);

  async function handlePay(mov: Movement) {
    const metodo = metodoByItem[mov.id] ?? "tarjeta";
    setPaying(mov.id);
    try {
      const pago = await procesarPago(
        mov.kind === "servicio"
          ? { Metodo: metodo, ServicioId: mov.refId }
          : { Metodo: metodo, PedidoId: mov.refId },
        token,
      );
      setPagos((prev) => [
        {
          id: pago.id,
          servicioId: mov.kind === "servicio" ? mov.refId : null,
          pedidoId: mov.kind === "pedido" ? mov.refId : null,
          clienteId: "",
          monto: pago.monto,
          metodo: pago.metodo,
          estado: pago.estado,
          referenciaExterna: pago.referenciaExterna,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      showToast(`Pago registrado con ${metodo}`, "success");
      await fetchAll();
    } catch (caught) {
      const message =
        caught instanceof ApiError ? caught.message : "No pude procesar el pago";
      showToast(message, "error");
    } finally {
      setPaying(null);
    }
  }

  return (
    <section className="vih-view">
      <header className="vih-view-header">
        <div>
          <h1>Pagos</h1>
          <p>Resumen de movimientos y pagos pendientes.</p>
        </div>
        <button
          type="button"
          className="vih-ghost"
          onClick={() => void fetchAll()}
          disabled={loading}
        >
          <Icon name="RotateCcw" size={16} /> Actualizar
        </button>
      </header>

      <div className="vih-stats-row">
        <div className="vih-stat-card vih-stat-success">
          <Icon name="ShieldCheck" size={22} color="var(--green-cta)" />
          <p className="vih-stat-label">Pagado total</p>
          <strong>{formatMoney(totalPagado)}</strong>
        </div>
        <div className="vih-stat-card vih-stat-warn">
          <Icon name="Receipt" size={22} color="var(--gold-600)" />
          <p className="vih-stat-label">Pendiente</p>
          <strong>{formatMoney(totalPendiente)}</strong>
        </div>
        <div className="vih-stat-card">
          <Icon name="CreditCard" size={22} color="var(--ink-soft)" />
          <p className="vih-stat-label">Movimientos</p>
          <strong>{movimientos.length}</strong>
        </div>
      </div>

      {loading && <p className="vih-loading">Cargando pagos...</p>}

      {!loading && pendientes.length > 0 && (
        <>
          <h2 className="vih-section-title">Por pagar</h2>
          <div className="vih-card vih-list">
            {pendientes.map((mov) => (
              <div key={mov.id} className="vih-list-row vih-list-row-stack">
                <div className="vih-list-main">
                  <span className={`vih-status vih-status-${mov.estado}`}>
                    {mov.estado.replace("_", " ")}
                  </span>
                  <div className="vih-list-body">
                    <p className="vih-list-title">{mov.title}</p>
                    <p className="vih-list-meta">{formatDateTime(mov.date)}</p>
                  </div>
                  <p className="vih-list-amount">{formatMoney(mov.amount)}</p>
                </div>
                <div className="vih-list-pay">
                  <select
                    value={metodoByItem[mov.id] ?? "tarjeta"}
                    onChange={(event) =>
                      setMetodoByItem((prev) => ({
                        ...prev,
                        [mov.id]: event.target.value as MetodoPago,
                      }))
                    }
                  >
                    {METODOS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="vih-primary"
                    onClick={() => void handlePay(mov)}
                    disabled={paying === mov.id}
                  >
                    <Icon name="CreditCard" size={16} />
                    {paying === mov.id ? "Procesando..." : "Pagar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="vih-section-title">Historial</h2>
      <div className="vih-card vih-list">
        {pagados.length === 0 && (
          <p className="vih-muted vih-list-empty">Aún no tienes pagos registrados.</p>
        )}
        {pagados.map((mov) => (
          <div key={mov.id} className="vih-list-row">
            <span className="vih-status vih-status-pagado">pagado</span>
            <div className="vih-list-body">
              <p className="vih-list-title">{mov.title}</p>
              <p className="vih-list-meta">
                {formatDateTime(mov.date)} ·{" "}
                {mov.kind === "servicio" ? "Servicio" : "Compra"}
                {mov.pago?.metodo ? ` · ${labelMetodo(mov.pago.metodo)}` : ""}
              </p>
            </div>
            <p className="vih-list-amount">{formatMoney(mov.amount)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function selectVisiblePago(current: Pago | undefined, candidate: Pago) {
  if (!current) return candidate;
  if (candidate.estado === "completado" && current.estado !== "completado") return candidate;
  if (candidate.estado !== "completado" && current.estado === "completado") return current;

  const currentDate = new Date(current.createdAt).getTime();
  const candidateDate = new Date(candidate.createdAt).getTime();
  const safeCurrent = Number.isNaN(currentDate) ? 0 : currentDate;
  const safeCandidate = Number.isNaN(candidateDate) ? 0 : candidateDate;
  return safeCandidate >= safeCurrent ? candidate : current;
}

function titleTipo(tipo: string) {
  switch (tipo) {
    case "paseo":
      return "Paseo";
    case "veterinaria":
      return "Consulta veterinaria";
    case "peluqueria":
      return "Peluquería";
    default:
      return "Servicio";
  }
}

function labelMetodo(metodo: string) {
  switch (metodo) {
    case "tarjeta":
      return "Tarjeta";
    case "pse":
      return "PSE";
    case "nequi":
      return "Nequi";
    case "daviplata":
      return "Daviplata";
    default:
      return metodo;
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
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
