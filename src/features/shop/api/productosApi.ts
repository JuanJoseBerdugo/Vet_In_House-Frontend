import { apiRequest } from "../../../lib/api/apiClient";
import type { Producto } from "../../../types/domain";

export function listProductos() {
  return apiRequest<Producto[]>("/api/productos", { method: "GET" });
}
