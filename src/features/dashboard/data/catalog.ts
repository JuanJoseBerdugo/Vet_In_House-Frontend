import type { IconName } from "../components/Icon";

export type ServiceKey = "paseo" | "vet" | "pelu" | "shop";
export type Tone = "green" | "gold" | "mint" | "plain";

export type ServiceEntry = {
  key: ServiceKey;
  label: string;
  desc: string;
  icon: IconName;
  tone: Tone;
  tipo?: "paseo" | "veterinaria" | "peluqueria";
};

export const SERVICES: ServiceEntry[] = [
  {
    key: "paseo",
    label: "Paseo",
    desc: "Aliados verificados cerca de ti",
    icon: "PawPrint",
    tone: "green",
    tipo: "paseo",
  },
  {
    key: "vet",
    label: "Veterinaria a casa",
    desc: "Consulta domiciliaria",
    icon: "Stethoscope",
    tone: "gold",
    tipo: "veterinaria",
  },
  {
    key: "pelu",
    label: "Peluquería",
    desc: "Baño y corte sin estrés",
    icon: "Bath",
    tone: "mint",
    tipo: "peluqueria",
  },
  {
    key: "shop",
    label: "Tienda",
    desc: "Comida, juguetes y más",
    icon: "ShoppingBag",
    tone: "plain",
  },
];

export const TONE: Record<Tone, { fill: string; ic: string }> = {
  green: { fill: "var(--mint-100)", ic: "var(--green-deep)" },
  gold: { fill: "var(--gold-100)", ic: "var(--gold-ink)" },
  mint: { fill: "var(--mint-50)", ic: "var(--green-cta)" },
  plain: { fill: "var(--surface-2)", ic: "var(--ink-soft)" },
};

export type PetHueProfile = { hue: number; glyph: IconName };

const HUE_PROFILES: PetHueProfile[] = [
  { hue: 88, glyph: "Dog" },
  { hue: 152, glyph: "PawPrint" },
  { hue: 30, glyph: "Cat" },
  { hue: 200, glyph: "Dog" },
  { hue: 270, glyph: "PawPrint" },
];

export function profileForPet(id: string): PetHueProfile {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  const idx = Math.abs(hash) % HUE_PROFILES.length;
  return HUE_PROFILES[idx]!;
}
