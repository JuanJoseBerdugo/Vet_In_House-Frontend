export type Mascota = {
  id: string;
  nombre: string;
  raza: string;
  peso: number | null;
  edad: number | null;
  fotoUrl: string | null;
  indicacionesMedicas: string | null;
};

export type CrearMascotaPayload = {
  Nombre: string;
  Raza: string;
  Peso?: number | null;
  Edad?: number | null;
  FotoUrl?: string | null;
  IndicacionesMedicas?: string | null;
};

export type ActualizarMascotaPayload = Partial<CrearMascotaPayload>;

export type TipoServicio = "paseo" | "veterinaria" | "peluqueria";

export type EstadoServicio =
  | "buscando"
  | "aceptado"
  | "en_progreso"
  | "finalizado"
  | "cancelado";

export type Servicio = {
  id: string;
  clienteId: string;
  paseadorId: string | null;
  mascotaId: string;
  tipoServicio: string;
  horas: number;
  tarifaPorHora: number;
  tarifaTotal: number;
  estado: string;
  ubicacionLat: number | null;
  ubicacionLng: number | null;
  direccion: string | null;
  notas: string | null;
  createdAt: string;
};

export type SolicitarServicioPayload = {
  MascotaId: string;
  Horas: number;
  UbicacionLat: number;
  UbicacionLng: number;
  Notas?: string | null;
  TipoServicio?: TipoServicio;
  Direccion?: string | null;
};

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string;
  fotoUrl: string | null;
  stock: number;
};

export type Pedido = {
  id: string;
  total: number;
  estado: string;
  direccionEnvio: string;
  createdAt: string;
};

export type CrearPedidoPayload = {
  DireccionEnvio: string;
  Items: { ProductoId: string; Cantidad: number }[];
};

export type MetodoPago = "tarjeta" | "pse" | "nequi" | "daviplata";

export type ProcesarPagoPayload = {
  Metodo: MetodoPago;
  ServicioId?: string | null;
  PedidoId?: string | null;
};

export type PagoConfirmacion = {
  id: string;
  estado: string;
  metodo: string;
  monto: number;
  referenciaExterna: string;
  mensaje?: string;
};

export type Pago = {
  id: string;
  servicioId: string | null;
  pedidoId: string | null;
  clienteId: string;
  monto: number;
  metodo: string;
  estado: string;
  referenciaExterna: string | null;
  createdAt: string;
};

export type Vacuna = {
  id: string;
  mascotaId: string;
  nombre: string;
  fechaAplicacion: string;
  fechaProxima: string | null;
  veterinario: string | null;
  lote: string | null;
  notas: string | null;
  documentoUrl: string | null;
};

export type CrearVacunaPayload = {
  Nombre: string;
  FechaAplicacion: string;
  FechaProxima?: string | null;
  Veterinario?: string | null;
  Lote?: string | null;
  Notas?: string | null;
  DocumentoUrl?: string | null;
};

export type Historial = {
  id: string;
  mascotaId: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  profesional: string | null;
  documentoUrl: string | null;
};

export type CrearHistorialPayload = {
  Tipo: string;
  Titulo: string;
  Descripcion: string;
  Fecha?: string | null;
  Profesional?: string | null;
  DocumentoUrl?: string | null;
};

export type Perfil = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  fotoUrl: string | null;
  rol: string;
};

export type AliadoServicio = {
  id: string;
  tipoServicio: TipoServicio;
  nombre: string;
  fotoUrl: string | null;
  bio: string;
  rating: number;
  reviews: number;
  distanciaKm: number;
  etaMin: number;
  hue: number;
  badge: string | null;
  especialidades: string[];
  precioBase: number;
  experienciaAnios: number;
};

export type ServicioExtra = {
  id: string;
  tipoServicio: TipoServicio;
  nombre: string;
  descripcion: string;
  precio: number;
  orden: number;
};

export type PlanPremium = {
  id: string;
  nombre: string;
  descripcion: string;
  precioMensual: number;
  etiqueta: string | null;
  beneficios: string[];
  orden: number;
};

export type PromocionPetshop = {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string | null;
  ctaLabel: string;
  tipo: "petshop" | "premium" | "servicio" | "temporada";
  descuentoPorcentaje: number | null;
  productoId: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  orden: number;
};

export type ResenaServicio = {
  id: string;
  aliadoId: string;
  clienteNombre: string;
  rating: number;
  comentario: string;
  createdAt: string;
};

export type DisponibilidadAliado = {
  id: string;
  aliadoId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
};
