import { apiRequest } from "../../../lib/api/apiClient";
import type { Pago, PagoConfirmacion, ProcesarPagoPayload } from "../../../types/domain";

export function procesarPago(payload: ProcesarPagoPayload, token: string) {
  return apiRequest<PagoConfirmacion>(
    "/api/pagos/procesar",
    { method: "POST", body: JSON.stringify(payload) },
    { token },
  );
}

export function listMisPagos(token: string) {
  return apiRequest<Pago[]>("/api/pagos/mios", { method: "GET" }, { token });
}
