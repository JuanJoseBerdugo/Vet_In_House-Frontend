import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";
import type { WalkPhase } from "../state/SimulatedWalkContext";

type WalkMapProps = {
  phase: WalkPhase;
  progress: number;
  providerInitials: string;
  petName: string;
  petHue: number;
  height?: number;
};

const ROUTE_PATH =
  "M 30 220 C 110 180, 180 250, 250 200 S 360 130, 440 160 S 580 230, 660 180 S 760 110, 820 130";

export function WalkMap({
  phase,
  progress,
  providerInitials,
  petName,
  petHue,
  height = 320,
}: WalkMapProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(900);

  useEffect(() => {
    if (pathRef.current) setLength(pathRef.current.getTotalLength());
  }, []);

  const routeState = useMemo(() => getRouteState(phase, progress), [phase, progress]);

  const { walkerPoint, petPoint } = useMemo(() => {
    if (!pathRef.current) {
      return { walkerPoint: { x: 30, y: 220 }, petPoint: { x: 30, y: 220 } };
    }
    const walkerDist = Math.max(0.01, routeState.walker) * length;
    const petDist = Math.max(0.01, routeState.pet) * length;
    const w = pathRef.current.getPointAtLength(walkerDist);
    const p = pathRef.current.getPointAtLength(petDist);
    return { walkerPoint: { x: w.x, y: w.y }, petPoint: { x: p.x, y: p.y } };
  }, [routeState.walker, routeState.pet, length]);

  const drawn = Math.max(8, routeState.route * length);
  const remaining = Math.max(0, length - drawn);

  return (
    <div
      className="walk-map"
      style={{ height, position: "relative", borderRadius: 22, overflow: "hidden" }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 880 320"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: "block" }}
      >
        <defs>
          <pattern id="walk-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <circle cx="22" cy="22" r="1.6" fill="oklch(0.74 0.12 150 / 0.16)" />
          </pattern>
          <linearGradient id="walk-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.97 0.03 145)" />
            <stop offset="100%" stopColor="oklch(0.94 0.04 150)" />
          </linearGradient>
          <radialGradient id="walk-park-a" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0%" stopColor="oklch(0.86 0.1 150 / 0.55)" />
            <stop offset="100%" stopColor="oklch(0.86 0.1 150 / 0)" />
          </radialGradient>
          <radialGradient id="walk-park-b" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0%" stopColor="oklch(0.84 0.11 100 / 0.45)" />
            <stop offset="100%" stopColor="oklch(0.84 0.11 100 / 0)" />
          </radialGradient>
        </defs>

        <rect width="880" height="320" fill="url(#walk-bg)" />
        <rect width="880" height="320" fill="url(#walk-grid)" />

        {/* Parques */}
        <ellipse cx="190" cy="80" rx="120" ry="50" fill="url(#walk-park-a)" />
        <ellipse cx="690" cy="260" rx="160" ry="60" fill="url(#walk-park-b)" />

        {/* Edificios decorativos */}
        {[
          { x: 80, y: 30, w: 36, h: 22 },
          { x: 340, y: 36, w: 30, h: 18 },
          { x: 540, y: 24, w: 44, h: 28 },
          { x: 720, y: 38, w: 32, h: 20 },
          { x: 460, y: 280, w: 38, h: 22 },
          { x: 60, y: 290, w: 28, h: 18 },
        ].map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="3"
            fill="oklch(0.93 0.02 150 / 0.85)"
            stroke="oklch(0.86 0.03 150)"
            strokeWidth="0.8"
          />
        ))}

        {/* Ruta base (sin recorrer) */}
        <path
          ref={pathRef}
          d={ROUTE_PATH}
          stroke="oklch(0.92 0.01 150)"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />

        {/* Ruta recorrida (verde) */}
        <path
          d={ROUTE_PATH}
          stroke="var(--green-cta)"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={remaining}
          style={{ transition: "stroke-dashoffset 600ms linear" }}
        />

        {/* Linea blanca punteada sobre la ruta */}
        <path
          d={ROUTE_PATH}
          stroke="#fff"
          strokeWidth="2"
          strokeDasharray="6 9"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Origen */}
        <circle cx="30" cy="220" r="11" fill="#fff" stroke="var(--green-cta)" strokeWidth="3.5" />
        <circle cx="30" cy="220" r="3.5" fill="var(--green-cta)" />

        {/* Destino (casa de regreso) */}
        <g transform="translate(820 130)">
          <line x1="0" y1="0" x2="0" y2="26" stroke="var(--gold-ink)" strokeWidth="2.4" />
          <path d="M0 0 L18 5 L0 10 Z" fill="var(--gold-600)" />
        </g>

        {/* Marcador del paseador */}
        <g
          transform={`translate(${walkerPoint.x} ${walkerPoint.y})`}
          style={{ transition: "transform 600ms linear" }}
        >
          <circle r="24" fill="oklch(1 0 0 / 0.5)">
            <animate
              attributeName="r"
              from="20"
              to="32"
              dur="1.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="0.55"
              to="0"
              dur="1.6s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="18" fill="var(--green-cta)" stroke="#fff" strokeWidth="3" />
          <text
            x="0"
            y="5"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="13"
            fontWeight="700"
            fill="#fff"
          >
            {providerInitials}
          </text>
        </g>

        {/* Marcador de la mascota (sigue al paseador) */}
        <g
          transform={`translate(${petPoint.x} ${petPoint.y})`}
          style={{ transition: "transform 600ms linear" }}
        >
          <circle r="14" fill={`oklch(0.92 0.08 ${petHue})`} stroke="#fff" strokeWidth="2.5" />
          <g transform="translate(-8 -8)" color={`oklch(0.4 0.14 ${petHue})`}>
            <Icon name="PawPrint" size={16} stroke={2.4} />
          </g>
        </g>
      </svg>

      {/* Etiqueta superior */}
      <div className="walk-map-tag">
        <span className="walk-map-tag-dot" />
        {phase === "buscando"
          ? "Esperando aliado"
          : phase === "en_camino"
            ? "Aliado llegando"
            : phase === "paseando"
              ? "Paseando juntos"
              : phase === "regresando"
                ? "Volviendo a casa"
          : phase === "completado"
            ? "Servicio finalizado"
            : "En movimiento"}
      </div>

      {/* Etiqueta inferior pequeña */}
      <div className="walk-map-foot">
        <span>
          <strong>Inicio</strong> Tu casa
        </span>
        <span>
          <strong>Con</strong> {petName}
        </span>
      </div>
    </div>
  );
}

function getRouteState(phase: WalkPhase, progress: number) {
  const local = phaseLocalProgress(phase, progress);

  switch (phase) {
    case "buscando":
      return { walker: 0.02, pet: 0.02, route: 0.02 };
    case "en_camino": {
      const walker = lerp(0.02, 0.2, local);
      return { walker, pet: 0.02, route: walker };
    }
    case "paseando": {
      const walker = lerp(0.2, 0.72, local);
      const pet = Math.max(0.2, walker - 0.025);
      return { walker, pet, route: walker };
    }
    case "regresando": {
      const walker = lerp(0.72, 0.98, local);
      const pet = Math.max(0.72, walker - 0.025);
      return { walker, pet, route: walker };
    }
    case "completado":
      return { walker: 0.98, pet: 0.98, route: 1 };
  }
}

function phaseLocalProgress(phase: WalkPhase, progress: number) {
  const phaseIndex = ["buscando", "en_camino", "paseando", "regresando", "completado"].indexOf(phase);
  if (phaseIndex < 0 || phase === "completado") return 1;
  const totalMovingPhases = 4;
  const start = phaseIndex / totalMovingPhases;
  const end = (phaseIndex + 1) / totalMovingPhases;
  return clamp((progress - start) / (end - start));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * clamp(amount);
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}
