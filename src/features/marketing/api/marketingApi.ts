import { apiRequest } from "../../../lib/api/apiClient";
import type {
  AliadoServicio,
  DisponibilidadAliado,
  PlanPremium,
  PromocionPetshop,
  ResenaServicio,
  ServicioExtra,
  TipoServicio,
} from "../../../types/domain";

export function listPromociones() {
  return apiRequest<PromocionPetshop[]>("/api/marketing/promociones", { method: "GET" });
}

export function listAliadosServicio(tipoServicio?: TipoServicio) {
  const query = tipoServicio ? `?tipoServicio=${encodeURIComponent(tipoServicio)}` : "";
  return apiRequest<AliadoServicio[]>(`/api/marketing/aliados${query}`, { method: "GET" });
}

export function listServicioExtras(tipoServicio?: TipoServicio) {
  const query = tipoServicio ? `?tipoServicio=${encodeURIComponent(tipoServicio)}` : "";
  return apiRequest<ServicioExtra[]>(`/api/marketing/extras${query}`, { method: "GET" });
}

export function listPlanesPremium() {
  return apiRequest<PlanPremium[]>("/api/marketing/premium/planes", { method: "GET" });
}

export function listResenasAliado(aliadoId: string) {
  return apiRequest<ResenaServicio[]>(
    `/api/marketing/aliados/${aliadoId}/resenas`,
    { method: "GET" },
  );
}

export function listDisponibilidadAliado(aliadoId: string) {
  return apiRequest<DisponibilidadAliado[]>(
    `/api/marketing/aliados/${aliadoId}/disponibilidad`,
    { method: "GET" },
  );
}
