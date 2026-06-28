import { apiRequest } from "../../../lib/api/apiClient";
import type { Perfil } from "../../../types/domain";

export function getPerfil(token: string) {
  return apiRequest<Perfil>("/api/usuarios/perfil", { method: "GET" }, { token });
}
