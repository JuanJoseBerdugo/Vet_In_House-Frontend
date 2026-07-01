import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { PetVideoShowcase } from "../../media/components/PetVideoShowcase";
import { login, register } from "../api/authApi";
import type { AuthSession } from "../../../types/auth";
import "./AuthPage.css";
import "./AuthPage.responsive.css";

type AuthMode = "login" | "register";

type AuthPageProps = {
  onAuthenticated: (session: AuthSession) => void;
};

type PasswordRule = {
  label: string;
  isValid: boolean;
};

const roleOptions = [
  { value: "cliente", label: "Cliente" },
  { value: "paseador", label: "Paseador" },
  { value: "veterinario", label: "Veterinario" },
  { value: "peluquero", label: "Peluquero" },
];

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("cliente");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const passwordRules = useMemo(() => getPasswordRules(password), [password]);
  const passwordScore = passwordRules.filter((rule) => rule.isValid).length;
  const passwordStrength = getPasswordStrength(passwordScore);
  const canRegister = mode === "login" || passwordScore >= 4;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === "register" && !canRegister) {
      setError("Tu contraseña debe cumplir al menos 4 reglas de seguridad.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session =
        mode === "login"
          ? await login({ Email: email, Password: password })
          : await register({
              Nombre: nombre,
              Email: email,
              Password: password,
              Telefono: telefono || undefined,
              Rol: rol,
            });

      onAuthenticated(session);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Algo salió mal";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setShowPassword(false);
  }

  return (
    <main className="vih auth-shell">
      {/* ── FORM PANEL (left) ── */}
      <section className="auth-form-panel" aria-labelledby="auth-title">
        <div className="auth-form-inner" key={mode}>
          <h2 id="auth-title" className="auth-title">
            {mode === "login" ? (
              <>
                Bienvenid@ de vuelta <span className="auth-title-paw">🐾</span>
              </>
            ) : (
              <>
                Crea tu cuenta <span className="auth-title-paw">🐾</span>
              </>
            )}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Inicia sesión para seguir cuidando a tus mascotas."
              : "Une a tu familia peluda a la plataforma de cuidado integral."}
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-fields">
              {mode === "register" && (
                <div className="register-fields">
                  <AuthField
                    fieldKey="nombre"
                    label="Nombre completo"
                    required
                    icon={<UserIcon />}
                    focused={focused === "nombre"}
                    onFocus={() => setFocused("nombre")}
                    onBlur={() => setFocused(null)}
                  >
                    <input
                      value={nombre}
                      onChange={(event) => setNombre(event.target.value)}
                      autoComplete="name"
                      required
                      minLength={2}
                      placeholder="Sofia Berdugo"
                      onFocus={() => setFocused("nombre")}
                      onBlur={() => setFocused(null)}
                    />
                  </AuthField>

                  <AuthField
                    fieldKey="telefono"
                    label="Teléfono"
                    icon={<PhoneIcon />}
                    focused={focused === "telefono"}
                    onFocus={() => setFocused("telefono")}
                    onBlur={() => setFocused(null)}
                  >
                    <input
                      value={telefono}
                      onChange={(event) => setTelefono(event.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="3153954300"
                      onFocus={() => setFocused("telefono")}
                      onBlur={() => setFocused(null)}
                    />
                  </AuthField>

                  <AuthField
                    fieldKey="rol"
                    label="Tipo de cuenta"
                    required
                    icon={<BadgeIcon />}
                    focused={focused === "rol"}
                    onFocus={() => setFocused("rol")}
                    onBlur={() => setFocused(null)}
                    trailing={
                      <span className="select-caret" aria-hidden="true">
                        <CaretIcon />
                      </span>
                    }
                  >
                    <select
                      value={rol}
                      onChange={(event) => setRol(event.target.value)}
                      onFocus={() => setFocused("rol")}
                      onBlur={() => setFocused(null)}
                      required
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </AuthField>
                </div>
              )}

              <AuthField
                fieldKey="email"
                label="Correo electrónico"
                required
                icon={<MailIcon />}
                focused={focused === "email"}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  placeholder="sofia@correo.com"
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                />
              </AuthField>

              <AuthField
                fieldKey="password"
                label="Contraseña"
                required
                icon={<LockIcon />}
                focused={focused === "password"}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                trailing={
                  <button
                    type="button"
                    className="field-toggle vih-press"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={showPassword}
                    tabIndex={password.length === 0 ? -1 : 0}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={mode === "register" ? 8 : 6}
                  placeholder={mode === "login" ? "Tu contraseña" : "Mínimo 8 caracteres"}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                />
              </AuthField>

              {mode === "register" && (
                <PasswordStrength
                  score={passwordScore}
                  label={passwordStrength}
                  rules={passwordRules}
                />
              )}
            </div>

            {mode === "login" && (
              <div className="auth-utility-row">
                <button
                  type="button"
                  className="checkbox-button"
                  onClick={() => setRemember((value) => !value)}
                  aria-pressed={remember}
                >
                  <span className={`checkbox-square ${remember ? "is-checked" : ""}`} aria-hidden="true">
                    {remember && <CheckIcon />}
                  </span>
                  <span>Recordarme</span>
                </button>
                <a className="link-action" href="#">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}

            {error && (
              <p className="form-error" role="alert">
                <span className="form-error-icon" aria-hidden="true">
                  <AlertIcon />
                </span>
                {error}
              </p>
            )}

            <button
              type="submit"
              className={`primary-action vih-press ${isSubmitting ? "is-loading" : ""}`}
              disabled={isSubmitting || !canRegister}
            >
              <span className="primary-action-label">
                {isSubmitting
                  ? "Procesando..."
                  : mode === "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
              </span>
              {isSubmitting ? (
                <span className="primary-action-spinner" aria-hidden="true">
                  <span />
                </span>
              ) : (
                <span className="primary-action-arrow" aria-hidden="true">
                  <ArrowRightIcon />
                </span>
              )}
            </button>

            <div className="auth-divider">
              <span className="divider-line" />
              <span className="divider-label">o continúa con</span>
              <span className="divider-line" />
            </div>

            <div className="social-row">
              <button type="button" className="social-action vih-press">
                <GoogleIcon /> Google
              </button>
              <button type="button" className="social-action vih-press">
                <AppleIcon /> Apple
              </button>
            </div>

            <p className="auth-switch">
              {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </form>
        </div>
      </section>

      {/* ── BRAND PANEL with video and story (right) ── */}
      <section className="auth-brand-panel" aria-hidden="true">
        <div className="auth-brand-video">
          <PetVideoShowcase />
          <div className="brand-gradient" />
          <div className="brand-logo">
            <span className="brand-logo-mark">
              <PawIcon size={26} />
            </span>
            <span className="brand-logo-text">
              Vet<span className="brand-logo-dot">.</span>In<span className="brand-logo-dot">.</span>House
            </span>
          </div>
        </div>

        <div className="brand-story">
          <span className="brand-story-kicker">Cuidado integral a domicilio</span>
          <h1>
            El cuidado de tu mascota,
            <br />a un toque de distancia.
          </h1>
          <p>
            Paseos, veterinaria, peluquería y tienda. Aliados verificados que llegan hasta tu casa.
          </p>
        </div>
      </section>
    </main>
  );
}

function AuthField({
  fieldKey: _fieldKey,
  label,
  icon,
  focused,
  onFocus,
  onBlur,
  required = false,
  trailing,
  children,
}: {
  fieldKey: string;
  label: string;
  icon: ReactNode;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  required?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="auth-field">
      <span className="auth-field-label">
        {label}
        {required && <span className="vih-required" aria-hidden="true">*</span>}
      </span>
      <span
        className={`auth-field-control ${focused ? "is-focused" : ""}`}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <span className="auth-field-icon" aria-hidden="true">
          {icon}
        </span>
        {children}
        {trailing}
      </span>
    </label>
  );
}

function PasswordStrength({
  score,
  label,
  rules,
}: {
  score: number;
  label: string;
  rules: PasswordRule[];
}) {
  const percent = (score / 5) * 100;
  const tone = score <= 1 ? "low" : score <= 3 ? "mid" : "high";

  return (
    <div className={`password-strength tone-${tone}`} aria-live="polite">
      <div className="strength-header">
        <span>Seguridad de contraseña</span>
        <strong>{label}</strong>
      </div>
      <div className="strength-bar" aria-hidden="true">
        <span className="strength-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <ul>
        {rules.map((rule) => (
          <li key={rule.label} className={rule.isValid ? "valid" : ""}>
            <span className="rule-icon" aria-hidden="true">
              {rule.isValid ? <CheckIcon /> : <DotIcon />}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getPasswordRules(password: string): PasswordRule[] {
  return [
    { label: "8 caracteres o más", isValid: password.length >= 8 },
    { label: "Una mayúscula", isValid: /[A-Z]/.test(password) },
    { label: "Una minúscula", isValid: /[a-z]/.test(password) },
    { label: "Un número", isValid: /\d/.test(password) },
    { label: "Un símbolo", isValid: /[^A-Za-z0-9]/.test(password) },
  ];
}

function getPasswordStrength(score: number) {
  if (score <= 1) return "Baja";
  if (score <= 3) return "Media";
  return "Alta";
}

function PawIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.6"
    >
      <ellipse cx="5.6" cy="9.4" rx="1.7" ry="2.3" />
      <ellipse cx="9.4" cy="5.4" rx="1.9" ry="2.5" />
      <ellipse cx="14.6" cy="5.4" rx="1.9" ry="2.5" />
      <ellipse cx="18.4" cy="9.4" rx="1.7" ry="2.3" />
      <path d="M12 11.2c-3 0-5.7 2.7-5.7 5.5 0 1.7 1.3 3 3 3 1 0 1.9-.4 2.7-.7.4-.1.7-.1 1 0 .8.3 1.7.7 2.7.7 1.7 0 3-1.3 3-3 0-2.8-2.7-5.5-5.7-5.5Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6.3 6.3l1-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <circle cx="12" cy="11" r="2.4" />
      <path d="M8.5 16.5c.8-1.4 2.1-2.2 3.5-2.2s2.7.8 3.5 2.2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.3 3.9" />
      <path d="M6.1 7.5C3.6 9.1 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.3 4.2-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function CaretIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16.2v.1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6C4.8 19.9 8.1 22 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.2 1.1 4.6L6.4 14Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2 8.1 2 4.8 4.1 3.1 7.4L6.4 10C7.2 7.6 9.4 5.9 12 5.9Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.2-.9-1.6 0-3.2.9-4 2.4-1.7 3-.4 7.4 1.3 9.8.8 1.2 1.7 2.5 3 2.5s1.7-.8 3.2-.8 1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.6-.9 1.1-1.9 1.4-3-2.4-1-2.9-3.4-2.9-3.8ZM14 5.4c.7-.8 1.1-1.9 1-3-1 .1-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 2.8-1.4Z" />
    </svg>
  );
}
