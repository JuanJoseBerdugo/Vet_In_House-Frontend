import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Provider } from "../data/providers";
import type { Mascota } from "../../../types/domain";

export type WalkPhase =
  | "buscando"
  | "en_camino"
  | "paseando"
  | "regresando"
  | "completado";

export type SimulatedWalk = {
  id: string;
  provider: Provider;
  mascota: Mascota;
  phase: WalkPhase;
  progress: number;
  startedAt: number;
  estimatedMinutes: number;
  totalCop: number;
  messages: { from: "provider" | "you"; text: string; ts: number }[];
};

type SimulatedWalkContextValue = {
  walk: SimulatedWalk | null;
  start: (input: { provider: Provider; mascota: Mascota; totalCop: number; estimatedMinutes?: number }) => void;
  advancePhase: () => void;
  complete: () => void;
  cancel: () => void;
  sendMessage: (text: string) => void;
};

const SimulatedWalkContext = createContext<SimulatedWalkContextValue | null>(null);

const PHASE_DURATIONS_SEC: Record<WalkPhase, number> = {
  buscando: 6,
  en_camino: 10,
  paseando: 18,
  regresando: 8,
  completado: 0,
};

const PHASE_ORDER: WalkPhase[] = [
  "buscando",
  "en_camino",
  "paseando",
  "regresando",
  "completado",
];

function nextPhase(current: WalkPhase): WalkPhase {
  const idx = PHASE_ORDER.indexOf(current);
  if (idx === -1 || idx === PHASE_ORDER.length - 1) return "completado";
  return PHASE_ORDER[idx + 1]!;
}

export function SimulatedWalkProvider({ children }: { children: ReactNode }) {
  const [walk, setWalk] = useState<SimulatedWalk | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  // Tick that advances progress and transitions phases.
  useEffect(() => {
    if (!walk || walk.phase === "completado") {
      clearTimer();
      return;
    }

    clearTimer();
    const startPhase = walk.phase;
    const phaseStart = Date.now();
    const phaseDurationMs = PHASE_DURATIONS_SEC[startPhase] * 1000;

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - phaseStart;
      const phaseProgress = Math.min(1, elapsed / phaseDurationMs);

      setWalk((prev) => {
        if (!prev || prev.phase !== startPhase) return prev;

        const totalPhases = PHASE_ORDER.length - 1;
        const phaseIdx = PHASE_ORDER.indexOf(startPhase);
        const overall = (phaseIdx + phaseProgress) / totalPhases;

        if (phaseProgress >= 1) {
          const next = nextPhase(startPhase);
          const greeting = pickPhaseMessage(next, prev.provider.name);
          const messages = greeting
            ? [...prev.messages, { from: "provider" as const, text: greeting, ts: Date.now() }]
            : prev.messages;
          return { ...prev, phase: next, progress: overall, messages };
        }

        return { ...prev, progress: overall };
      });
    }, 600);

    return clearTimer;
  }, [walk?.id, walk?.phase, clearTimer]);

  const start = useCallback<SimulatedWalkContextValue["start"]>((input) => {
    const id = `walk-${Date.now()}`;
    setWalk({
      id,
      provider: input.provider,
      mascota: input.mascota,
      phase: "buscando",
      progress: 0,
      startedAt: Date.now(),
      estimatedMinutes: input.estimatedMinutes ?? 30,
      totalCop: input.totalCop,
      messages: [
        {
          from: "provider",
          text: `Hola! Soy ${input.provider.name.split(" ")[0]}, voy a buscar a ${input.mascota.nombre}.`,
          ts: Date.now(),
        },
      ],
    });
  }, []);

  const advancePhase = useCallback(() => {
    setWalk((prev) => {
      if (!prev) return prev;
      const next = nextPhase(prev.phase);
      const phaseIdx = PHASE_ORDER.indexOf(next);
      const overall = phaseIdx / (PHASE_ORDER.length - 1);
      const greeting = pickPhaseMessage(next, prev.provider.name);
      const messages = greeting
        ? [...prev.messages, { from: "provider" as const, text: greeting, ts: Date.now() }]
        : prev.messages;
      return { ...prev, phase: next, progress: overall, messages };
    });
  }, []);

  const complete = useCallback(() => {
    setWalk((prev) => (prev ? { ...prev, phase: "completado", progress: 1 } : prev));
  }, []);

  const cancel = useCallback(() => {
    clearTimer();
    setWalk(null);
  }, [clearTimer]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    setWalk((prev) => {
      if (!prev) return prev;
      const youMessage = { from: "you" as const, text: text.trim(), ts: Date.now() };
      const auto = {
        from: "provider" as const,
        text: pickReply(prev.phase, prev.provider.name),
        ts: Date.now() + 1,
      };
      return { ...prev, messages: [...prev.messages, youMessage, auto] };
    });
  }, []);

  const value = useMemo<SimulatedWalkContextValue>(
    () => ({ walk, start, advancePhase, complete, cancel, sendMessage }),
    [walk, start, advancePhase, complete, cancel, sendMessage],
  );

  return <SimulatedWalkContext.Provider value={value}>{children}</SimulatedWalkContext.Provider>;
}

export function useSimulatedWalk() {
  const ctx = useContext(SimulatedWalkContext);
  if (!ctx) throw new Error("useSimulatedWalk debe usarse dentro de SimulatedWalkProvider");
  return ctx;
}

export function phaseLabel(phase: WalkPhase) {
  switch (phase) {
    case "buscando":
      return "Buscando aliado";
    case "en_camino":
      return "En camino a tu casa";
    case "paseando":
      return "Paseando";
    case "regresando":
      return "Regresando a casa";
    case "completado":
      return "Servicio completado";
  }
}

export function phaseTag(phase: WalkPhase) {
  switch (phase) {
    case "buscando":
      return "BUSCANDO ALIADO";
    case "en_camino":
      return "EN CAMINO";
    case "paseando":
      return "PASEO EN VIVO";
    case "regresando":
      return "REGRESANDO";
    case "completado":
      return "FINALIZADO";
  }
}

function pickPhaseMessage(phase: WalkPhase, providerName: string): string | null {
  const first = providerName.split(" ")[0] ?? providerName;
  switch (phase) {
    case "en_camino":
      return `${first}: ya voy en camino, llego en pocos minutos.`;
    case "paseando":
      return `${first}: empezamos a pasear, todo bien.`;
    case "regresando":
      return `${first}: vamos de regreso, casi llegamos.`;
    case "completado":
      return `${first}: ¡listo! Te dejo a tu peludo sano y salvo. ¡Gracias!`;
    default:
      return null;
  }
}

function pickReply(phase: WalkPhase, providerName: string): string {
  const first = providerName.split(" ")[0] ?? providerName;
  switch (phase) {
    case "buscando":
      return `${first}: confirmo, en seguida me organizo.`;
    case "en_camino":
      return `${first}: perfecto, voy a llegar pronto.`;
    case "paseando":
      return `${first}: vamos por el parque, está feliz.`;
    case "regresando":
      return `${first}: ya casi llego de vuelta.`;
    default:
      return `${first}: con gusto, hablamos al rato.`;
  }
}
