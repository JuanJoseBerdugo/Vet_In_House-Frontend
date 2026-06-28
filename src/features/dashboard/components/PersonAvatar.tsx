type PersonAvatarProps = {
  size?: number;
  hue?: number;
  label?: string;
  photoUrl?: string | null;
};

export function PersonAvatar({ size = 46, hue = 150, label, photoUrl }: PersonAvatarProps) {
  const initials = (label ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={label ?? "Colaborador"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
          background: `oklch(0.9 0.05 ${hue})`,
          boxShadow: "0 0 0 3px #fff, 0 0 0 4px var(--line)",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `oklch(0.9 0.05 ${hue})`,
        color: `oklch(0.38 0.12 ${hue})`,
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: Math.round(size * 0.36),
        fontFamily: "var(--font-display)",
        flexShrink: 0,
      }}
      aria-label={label}
    >
      {initials || "?"}
    </div>
  );
}
