type MiniMapProps = {
  height?: number;
  radius?: number;
};

export function MiniMap({ height = 210, radius = 22 }: MiniMapProps) {
  return (
    <div
      className="mini-map"
      style={{
        position: "relative",
        height,
        borderRadius: radius,
        overflow: "hidden",
        background: "linear-gradient(160deg, var(--mint-50), var(--surface-2))",
      }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" viewBox="0 0 400 210" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="parkGrid" width="44" height="44" patternUnits="userSpaceOnUse">
            <circle cx="22" cy="22" r="1.5" fill="oklch(0.74 0.12 150 / 0.18)" />
          </pattern>
        </defs>
        <rect width="400" height="210" fill="url(#parkGrid)" />

        {/* Parks */}
        <ellipse cx="80" cy="170" rx="50" ry="28" fill="oklch(0.86 0.1 150 / 0.5)" />
        <ellipse cx="320" cy="50" rx="60" ry="30" fill="oklch(0.86 0.1 150 / 0.45)" />

        {/* Roads */}
        <path
          d="M-10 130 C 80 100, 180 160, 260 110 S 380 80, 420 95"
          stroke="oklch(0.92 0.01 150)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M-10 130 C 80 100, 180 160, 260 110 S 380 80, 420 95"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeDasharray="6 8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Origin */}
        <circle cx="40" cy="125" r="9" fill="#ffffff" stroke="var(--green-cta)" strokeWidth="3" />

        {/* Destination flag */}
        <g transform="translate(360 88)">
          <line x1="0" y1="0" x2="0" y2="22" stroke="var(--gold-ink)" strokeWidth="2" />
          <path d="M0 0 L14 4 L0 8 Z" fill="var(--gold-600)" />
        </g>

        {/* Walker dot animated along the road */}
        <circle r="9" fill="var(--green-cta)" stroke="#ffffff" strokeWidth="3">
          <animateMotion
            dur="9s"
            repeatCount="indefinite"
            path="M-10 130 C 80 100, 180 160, 260 110 S 380 80, 420 95"
          />
        </circle>
      </svg>

      <span
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.92)",
          color: "var(--green-deep)",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--green-cta)",
            animation: "vih-pulse 1.8s infinite",
          }}
        />
        En vivo
      </span>
    </div>
  );
}
