export type NavKey =
  | "home"
  | "pets"
  | "walks"
  | "veterinary"
  | "grooming"
  | "promotions"
  | "orders"
  | "shop"
  | "wallet";

export const NAV_TITLES: Record<NavKey, string> = {
  home: "Inicio",
  pets: "Mis mascotas",
  walks: "Paseos",
  veterinary: "Veterinaria",
  grooming: "Peluquería",
  promotions: "Promociones",
  orders: "Mis pedidos",
  shop: "Tienda",
  wallet: "Pagos",
};
