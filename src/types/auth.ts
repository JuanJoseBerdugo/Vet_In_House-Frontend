export type AuthResponse = {
  accessToken: string;
  email: string;
  rol: string;
  userId: string;
};

export type AuthSession = AuthResponse;

export type LoginPayload = {
  Email: string;
  Password: string;
};

export type RegisterPayload = {
  Nombre: string;
  Email: string;
  Password: string;
  Telefono?: string;
  Rol: string;
};
