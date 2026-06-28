import { apiRequest } from "../../../lib/api/apiClient";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../../../types/auth";

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/api/auth/registro", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
