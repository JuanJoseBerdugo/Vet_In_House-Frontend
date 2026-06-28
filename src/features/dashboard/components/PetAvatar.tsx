import { Icon } from "./Icon";
import { profileForPet } from "../data/catalog";
import type { Mascota } from "../../../types/domain";

type PetAvatarProps = {
  pet: Mascota;
  size?: number;
  ring?: boolean;
  active?: boolean;
};

export function PetAvatar({ pet, size = 44, ring = false, active = false }: PetAvatarProps) {
  const profile = profileForPet(pet.id);
  const fill = `oklch(0.88 0.08 ${profile.hue})`;
  const ink = `oklch(0.38 0.12 ${profile.hue})`;
  const ringShadow = active
    ? "0 0 0 3px #ffffff, 0 0 0 5px var(--green-cta)"
    : ring
      ? "0 0 0 3px #ffffff, 0 0 0 5px var(--line)"
      : "none";

  if (pet.fotoUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `url(${pet.fotoUrl}) center/cover no-repeat, ${fill}`,
          boxShadow: ringShadow,
          flexShrink: 0,
        }}
        aria-label={pet.nombre}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: fill,
        color: ink,
        display: "grid",
        placeItems: "center",
        boxShadow: ringShadow,
        flexShrink: 0,
      }}
      aria-label={pet.nombre}
    >
      <Icon name={profile.glyph} size={Math.round(size * 0.55)} stroke={2.2} />
    </div>
  );
}
