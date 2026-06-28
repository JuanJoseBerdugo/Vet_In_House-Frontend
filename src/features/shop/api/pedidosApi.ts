import { apiRequest } from "../../../lib/api/apiClient";
import type { CrearPedidoPayload, Pedido } from "../../../types/domain";

export function crearPedido(payload: CrearPedidoPayload, token: string) {
  return apiRequest<Pedido>(
    "/api/pedidos",
    { method: "POST", body: JSON.stringify(payload) },
    { token },
  );
}

export function listMisOrdenes(token: string) {
  return apiRequest<Pedido[]>(
    "/api/pedidos/mis-ordenes",
    { method: "GET" },
    { token },
  );
}
