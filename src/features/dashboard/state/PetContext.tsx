import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { listMascotas } from "../../pets/api/mascotasApi";
import { ApiError } from "../../../lib/api/apiClient";
import type { Mascota } from "../../../types/domain";

type PetContextValue = {
  mascotas: Mascota[];
  loading: boolean;
  error: string | null;
  selected: Mascota | null;
  selectedId: string | null;
  selectById: (id: string) => void;
  selectNext: () => void;
  refresh: () => Promise<void>;
};

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ token, children }: { token: string; children: ReactNode }) {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMascotas(token);
      setMascotas(data);
      setSelectedId((previous) => {
        if (previous && data.some((mascota) => mascota.id === previous)) return previous;
        return data[0]?.id ?? null;
      });
    } catch (caught) {
      const message =
        caught instanceof ApiError ? caught.message : "No pude cargar tus mascotas";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectById = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const selectNext = useCallback(() => {
    setSelectedId((previous) => {
      if (mascotas.length === 0) return null;
      const idx = mascotas.findIndex((mascota) => mascota.id === previous);
      const next = mascotas[(idx + 1) % mascotas.length]!;
      return next.id;
    });
  }, [mascotas]);

  const value = useMemo<PetContextValue>(() => {
    const selected = mascotas.find((m) => m.id === selectedId) ?? null;
    return {
      mascotas,
      loading,
      error,
      selected,
      selectedId,
      selectById,
      selectNext,
      refresh,
    };
  }, [mascotas, loading, error, selectedId, selectById, selectNext, refresh]);

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePets() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePets debe usarse dentro de PetProvider");
  return ctx;
}
