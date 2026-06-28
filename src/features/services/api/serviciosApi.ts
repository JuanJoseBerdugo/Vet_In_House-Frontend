import { apiRequest } from "../../../lib/api/apiClient";
import type { Servicio, SolicitarServicioPayload } from "../../../types/domain";

export function solicitarServicio(payload: SolicitarServicioPayload, token: string) {
  return apiRequest<Servicio>(
    "/api/servicios/solicitar",
    { method: "POST", body: JSON.stringify(payload) },
    { token },
  );
}

export function listHistorialServicios(token: string) {
  return apiRequest<Servicio[]>(
    "/api/servicios/historial",
    { method: "GET" },
    { token },
  );
}

export function cambiarEstadoServicio(id: string, estado: string, token: string) {
  return apiRequest<Servicio>(
    `/api/servicios/${id}/estado`,
    { method: "PATCH", body: JSON.stringify({ Estado: estado }) },
    { token },
  );
}
