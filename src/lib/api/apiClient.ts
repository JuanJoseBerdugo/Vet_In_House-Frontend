import { env } from "../../config/env";
import type { ApiResponse } from "../../types/api";

type ApiClientOptions = {
  token?: string;
};

export const UNAUTHORIZED_EVENT = "vet-in-house:unauthorized";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiClientOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(
      "No pude conectar con el backend. Revisa que el API esté corriendo.",
      0,
    );
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || payload?.success === false) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(payload?.message ?? "No se pudo completar la solicitud", response.status);
  }

  if (!payload || payload.data === null) {
    throw new ApiError("Respuesta vacía del servidor", response.status);
  }

  return payload.data;
}
