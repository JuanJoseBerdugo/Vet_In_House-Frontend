export type ProviderKind = "walker" | "vet" | "groomer";

export type Provider = {
  id: string;
  kind: ProviderKind;
  name: string;
  photoUrl?: string | null;
  rating: number;
  reviews: number;
  distanceKm: number;
  etaMin: number;
  hue: number;
  badge?: string;
  bio: string;
  specialties: string[];
  pricePerHour: number;
  experienceYears: number;
};

export const WALKERS: Provider[] = [
  {
    id: "w-carlos",
    kind: "walker",
    name: "Carlos Rodríguez",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&q=80",
    rating: 4.9,
    reviews: 184,
    distanceKm: 0.6,
    etaMin: 6,
    hue: 150,
    badge: "Más pedido",
    bio: "Estudiante de veterinaria con 3 años paseando perros. Especialista en razas grandes.",
    specialties: ["Razas grandes", "Cachorros", "Adiestramiento básico"],
    pricePerHour: 25000,
    experienceYears: 3,
  },
  {
    id: "w-maria",
    kind: "walker",
    name: "María González",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&q=80",
    rating: 4.8,
    reviews: 142,
    distanceKm: 1.1,
    etaMin: 11,
    hue: 320,
    badge: "Premium",
    bio: "Bióloga y apasionada por los perros. Ofrezco paseos seguros y llenos de diversión.",
    specialties: ["Senior", "Perros nerviosos", "Rutas largas"],
    pricePerHour: 28000,
    experienceYears: 5,
  },
  {
    id: "w-andres",
    kind: "walker",
    name: "Andrés López",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&q=80",
    rating: 4.7,
    reviews: 96,
    distanceKm: 1.8,
    etaMin: 14,
    hue: 200,
    bio: "Entrenador canino certificado. Especialista en perros con ansiedad o necesidades especiales.",
    specialties: ["Ansiedad", "Necesidades especiales", "Multiperros"],
    pricePerHour: 30000,
    experienceYears: 7,
  },
  {
    id: "w-laura",
    kind: "walker",
    name: "Laura Castro",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=80",
    rating: 4.95,
    reviews: 67,
    distanceKm: 2.4,
    etaMin: 18,
    hue: 80,
    bio: "Amante de los animales. Disponible fines de semana y días festivos.",
    specialties: ["Fines de semana", "Razas pequeñas"],
    pricePerHour: 22000,
    experienceYears: 2,
  },
];

export const VETS: Provider[] = [
  {
    id: "v-ramirez",
    kind: "vet",
    name: "Dra. Valentina Ramírez",
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=480&q=80",
    rating: 4.95,
    reviews: 312,
    distanceKm: 1.4,
    etaMin: 35,
    hue: 240,
    badge: "Especialista",
    bio: "Médica veterinaria con maestría en medicina interna. 8 años atendiendo a domicilio.",
    specialties: ["Medicina interna", "Vacunas", "Geriatría"],
    pricePerHour: 80000,
    experienceYears: 8,
  },
  {
    id: "v-mendez",
    kind: "vet",
    name: "Dr. Felipe Méndez",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=480&q=80",
    rating: 4.85,
    reviews: 198,
    distanceKm: 2.2,
    etaMin: 45,
    hue: 30,
    bio: "Especialista en dermatología y nutrición canina/felina. Atención empática y profesional.",
    specialties: ["Dermatologia", "Nutricion", "Felinos"],
    pricePerHour: 90000,
    experienceYears: 12,
  },
  {
    id: "v-soto",
    kind: "vet",
    name: "Dra. Camila Soto",
    photoUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=480&q=80",
    rating: 4.78,
    reviews: 144,
    distanceKm: 3.0,
    etaMin: 55,
    hue: 350,
    badge: "Urgencias 24/7",
    bio: "Disponible 24/7 para urgencias. Ambulancia veterinaria propia.",
    specialties: ["Urgencias", "Cirugia menor", "Trauma"],
    pricePerHour: 120000,
    experienceYears: 10,
  },
];

export const GROOMERS: Provider[] = [
  {
    id: "g-pelusa",
    kind: "groomer",
    name: "Spa Pelusa",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=480&q=80",
    rating: 4.9,
    reviews: 278,
    distanceKm: 1.0,
    etaMin: 25,
    hue: 320,
    badge: "Más pedido",
    bio: "Spa móvil con todo el equipo profesional. Baño, corte, oídos, uñas y aromaterapia.",
    specialties: ["Baño completo", "Corte de raza", "Razas pequeñas"],
    pricePerHour: 55000,
    experienceYears: 6,
  },
  {
    id: "g-glamour",
    kind: "groomer",
    name: "Glamour Pets",
    photoUrl: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=480&q=80",
    rating: 4.82,
    reviews: 193,
    distanceKm: 1.7,
    etaMin: 30,
    hue: 280,
    bio: "Corte tijera de raza, productos hipoalergénicos. Especialistas en razas difíciles.",
    specialties: ["Corte tijera", "Hipoalergenico", "Razas grandes"],
    pricePerHour: 65000,
    experienceYears: 9,
  },
  {
    id: "g-soft",
    kind: "groomer",
    name: "Soft Paws Express",
    photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=480&q=80",
    rating: 4.74,
    reviews: 121,
    distanceKm: 2.6,
    etaMin: 40,
    hue: 200,
    bio: "Servicio rápido y cariñoso. Ideal para perros nerviosos o cachorros.",
    specialties: ["Express 1h", "Cachorros", "Perros nerviosos"],
    pricePerHour: 45000,
    experienceYears: 4,
  },
];

export function providersFor(kind: ProviderKind): Provider[] {
  if (kind === "walker") return WALKERS;
  if (kind === "vet") return VETS;
  return GROOMERS;
}

export type ServiceAddon = {
  id: string;
  label: string;
  description: string;
  price: number;
};

export const ADDONS: Record<ProviderKind, ServiceAddon[]> = {
  walker: [
    { id: "report", label: "Reporte fotográfico", description: "Fotos y resumen al final", price: 5000 },
    { id: "treats", label: "Snacks premium", description: "Recompensas durante el paseo", price: 8000 },
    { id: "extra-time", label: "30 min adicionales", description: "Más tiempo al aire libre", price: 12000 },
  ],
  vet: [
    { id: "vacuna", label: "Vacuna antirrábica", description: "Incluye certificado", price: 35000 },
    { id: "desparasitar", label: "Desparasitación", description: "Interna + externa", price: 25000 },
    { id: "examen", label: "Hemograma express", description: "Resultados en 24h", price: 60000 },
  ],
  groomer: [
    { id: "perfume", label: "Perfume hipoalergénico", description: "Aroma duradero", price: 8000 },
    { id: "uñas", label: "Limado de uñas", description: "Sin cortes", price: 12000 },
    { id: "spa", label: "Mascarilla spa", description: "Hidratacion profunda", price: 20000 },
  ],
};

export type PaymentMethodOption = {
  value: "tarjeta" | "pse" | "nequi" | "daviplata";
  label: string;
  hint: string;
  icon: "CreditCard" | "Wallet" | "Receipt";
};

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { value: "tarjeta", label: "Tarjeta", hint: "Crédito o débito", icon: "CreditCard" },
  { value: "nequi", label: "Nequi", hint: "Pago inmediato", icon: "Wallet" },
  { value: "daviplata", label: "Daviplata", hint: "Pago inmediato", icon: "Wallet" },
  { value: "pse", label: "PSE", hint: "Transferencia bancaria", icon: "Receipt" },
];
