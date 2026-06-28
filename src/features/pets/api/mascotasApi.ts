import { apiRequest, ApiError, UNAUTHORIZED_EVENT } from "../../../lib/api/apiClient";
import { env } from "../../../config/env";
import type { ApiResponse } from "../../../types/api";
import type {
  ActualizarMascotaPayload,
  CrearHistorialPayload,
  CrearMascotaPayload,
  CrearVacunaPayload,
  Historial,
  Mascota,
  Vacuna,
} from "../../../types/domain";

export function listMascotas(token: string) {
  return apiRequest<Mascota[]>("/api/mascotas", { method: "GET" }, { token });
}

export function crearMascota(payload: CrearMascotaPayload, token: string) {
  return apiRequest<Mascota>(
    "/api/mascotas",
    { method: "POST", body: JSON.stringify(payload) },
    { token },
  );
}

export function actualizarMascota(
  id: string,
  payload: ActualizarMascotaPayload,
  token: string,
) {
  return apiRequest<Mascota>(
    `/api/mascotas/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    { token },
  );
}

export function eliminarMascota(id: string, token: string) {
  return apiRequest<string>(`/api/mascotas/${id}`, { method: "DELETE" }, { token });
}

export async function subirFotoMascota(file: File, token: string) {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch(`${env.apiBaseUrl}/api/mascotas/foto`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new ApiError(
      "No pude conectar con el backend. Revisa que el API esté corriendo.",
      0,
    );
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<{ fotoUrl: string }> | null;

  if (!response.ok || payload?.success === false) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(payload?.message ?? "No se pudo subir la foto", response.status);
  }

  if (!payload?.data?.fotoUrl) {
    throw new ApiError("El backend no devolvió la URL de la foto", response.status);
  }

  return payload.data.fotoUrl;
}

export function listVacunas(mascotaId: string, token: string) {
  return apiRequest<Vacuna[]>(
    `/api/mascotas/${mascotaId}/vacunas`,
    { method: "GET" },
    { token },
  );
}

export function crearVacuna(mascotaId: string, payload: CrearVacunaPayload, token: string) {
  return apiRequest<Vacuna>(
    `/api/mascotas/${mascotaId}/vacunas`,
    { method: "POST", body: JSON.stringify(payload) },
    { token },
  );
}

export function listHistorial(mascotaId: string, token: string) {
  return apiRequest<Historial[]>(
    `/api/mascotas/${mascotaId}/historial-medico`,
    { method: "GET" },
    { token },
  );
}

export function crearHistorial(
  mascotaId: string,
  payload: CrearHistorialPayload,
  token: string,
) {
  return apiRequest<Historial>(
    `/api/mascotas/${mascotaId}/historial-medico`,
    { method: "POST", body: JSON.stringify(payload) },
    { token },
  );
}
