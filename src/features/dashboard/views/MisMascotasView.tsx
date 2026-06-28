import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { PetAvatar } from "../components/PetAvatar";
import { DialogPortal } from "../components/DialogPortal";
import { usePets } from "../state/PetContext";
import { useToast } from "../components/ToastProvider";
import {
  actualizarMascota,
  crearHistorial,
  crearMascota,
  crearVacuna,
  eliminarMascota,
  listHistorial,
  listVacunas,
  subirFotoMascota,
} from "../../pets/api/mascotasApi";
import { ApiError } from "../../../lib/api/apiClient";
import type {
  ActualizarMascotaPayload,
  CrearHistorialPayload,
  CrearMascotaPayload,
  CrearVacunaPayload,
  Historial,
  Mascota,
  Vacuna,
} from "../../../types/domain";

type MisMascotasViewProps = {
  token: string;
};

type EditingState =
  | { mode: "create" }
  | { mode: "edit"; mascota: Mascota }
  | null;

const MAX_PET_PHOTO_SIZE = 5 * 1024 * 1024;

export function MisMascotasView({ token }: MisMascotasViewProps) {
  const { mascotas, loading, error, refresh, selectById, selectedId } = usePets();
  const showToast = useToast();
  const [editing, setEditing] = useState<EditingState>(null);
  const [healthPet, setHealthPet] = useState<Mascota | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(mascota: Mascota) {
    if (!window.confirm(`Eliminar a ${mascota.nombre}?`)) return;
    setBusyId(mascota.id);
    try {
      await eliminarMascota(mascota.id, token);
      showToast(`${mascota.nombre} eliminado`, "success");
      await refresh();
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "No pude eliminar";
      showToast(message, "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="vih-view">
      <header className="vih-view-header">
        <div>
          <h1>Mis mascotas</h1>
          <p>Administra los perfiles de tus peluditos.</p>
        </div>
        <button
          type="button"
          className="vih-primary"
          onClick={() => setEditing({ mode: "create" })}
        >
          <Icon name="Plus" size={18} /> Agregar mascota
        </button>
      </header>

      {loading && <p className="vih-loading">Cargando...</p>}
      {error && (
        <p className="vih-inline-error">
          <Icon name="AlertCircle" size={16} /> {error}
        </p>
      )}

      <div className="vih-pets-grid">
        {mascotas.map((mascota, idx) => {
          const isSelected = mascota.id === selectedId;
          return (
            <article
              key={mascota.id}
              className={`vih-card vih-card-padded vih-pet-row ${
                isSelected ? "is-selected" : ""
              }`}
              style={{ animationDelay: `${0.05 + idx * 0.04}s` }}
            >
              <PetAvatar pet={mascota} size={60} ring={isSelected} active={isSelected} />
              <div className="vih-pet-row-body">
                <p className="vih-pet-name">{mascota.nombre}</p>
                <p className="vih-pet-meta">
                  {mascota.raza}
                  {mascota.edad ? ` · ${mascota.edad} ${mascota.edad === 1 ? "año" : "años"}` : ""}
                  {mascota.peso ? ` · ${mascota.peso} kg` : ""}
                </p>
                {mascota.indicacionesMedicas && (
                  <p className="vih-pet-note">
                    <Icon name="HeartPulse" size={14} color="var(--green-cta)" />{" "}
                    {mascota.indicacionesMedicas}
                  </p>
                )}
              </div>
              <div className="vih-pet-row-actions">
                {!isSelected && (
                  <button
                    type="button"
                    className="vih-ghost vih-press"
                    onClick={() => selectById(mascota.id)}
                  >
                    Seleccionar
                  </button>
                )}
                <button
                  type="button"
                  className="vih-icon-btn vih-press"
                  onClick={() => setHealthPet(mascota)}
                  aria-label={`Carnet de ${mascota.nombre}`}
                >
                  <Icon name="Syringe" size={17} />
                </button>
                <button
                  type="button"
                  className="vih-icon-btn vih-press"
                  onClick={() => setEditing({ mode: "edit", mascota })}
                  aria-label={`Editar ${mascota.nombre}`}
                >
                  <Icon name="Pencil" size={17} />
                </button>
                <button
                  type="button"
                  className="vih-icon-btn vih-icon-btn-danger vih-press"
                  onClick={() => void handleDelete(mascota)}
                  disabled={busyId === mascota.id}
                  aria-label={`Eliminar ${mascota.nombre}`}
                >
                  <Icon name="Trash" size={17} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && mascotas.length === 0 && !error && (
        <div className="vih-empty">
          <Icon name="PawPrint" size={42} color="var(--green-cta)" />
          <h2>Aún no tienes mascotas</h2>
          <p>Agrega la primera para empezar a usar los servicios.</p>
        </div>
      )}

      {editing && (
        <PetFormDialog
          token={token}
          initial={editing.mode === "edit" ? editing.mascota : null}
          onClose={() => setEditing(null)}
          onSaved={async (mascota, mode) => {
            setEditing(null);
            await refresh();
            if (mode === "create") selectById(mascota.id);
            showToast(mode === "create" ? "Mascota creada" : "Mascota actualizada", "success");
          }}
          onError={(message) => showToast(message, "error")}
        />
      )}

      {healthPet && (
        <PetHealthDialog
          token={token}
          mascota={healthPet}
          onClose={() => setHealthPet(null)}
          onError={(message) => showToast(message, "error")}
          onSaved={(message) => showToast(message, "success")}
        />
      )}
    </section>
  );
}

function PetFormDialog({
  token,
  initial,
  onClose,
  onSaved,
  onError,
}: {
  token: string;
  initial: Mascota | null;
  onClose: () => void;
  onSaved: (mascota: Mascota, mode: "create" | "edit") => void;
  onError: (message: string) => void;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [raza, setRaza] = useState(initial?.raza ?? "");
  const [edad, setEdad] = useState(initial?.edad?.toString() ?? "");
  const [peso, setPeso] = useState(initial?.peso?.toString() ?? "");
  const [indicaciones, setIndicaciones] = useState(initial?.indicacionesMedicas ?? "");
  const [fotoUrl, setFotoUrl] = useState(initial?.fotoUrl ?? "");
  const [fotoPreview, setFotoPreview] = useState(initial?.fotoUrl ?? "");
  const [fotoFileName, setFotoFileName] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = initial !== null;
  const hasPhoto = fotoPreview.trim().length > 0;

  useEffect(() => {
    return () => {
      if (fotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("Selecciona un archivo de imagen");
      return;
    }

    if (file.size > MAX_PET_PHOTO_SIZE) {
      onError("La foto no puede pesar más de 5 MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFotoPreview(previewUrl);
    setFotoFileName(file.name);
    setUploadingPhoto(true);

    try {
      const uploadedUrl = await subirFotoMascota(file, token);
      setFotoUrl(uploadedUrl);
      setFotoPreview(uploadedUrl);
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "No pude subir la foto";
      setFotoUrl(initial?.fotoUrl ?? "");
      setFotoPreview(initial?.fotoUrl ?? "");
      setFotoFileName("");
      onError(message);
    } finally {
      setUploadingPhoto(false);
    }
  }

  function clearPhoto() {
    setFotoUrl("");
    setFotoPreview("");
    setFotoFileName("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploadingPhoto) {
      onError("Espera a que termine de subir la foto");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const payload: ActualizarMascotaPayload = {
          Nombre: nombre,
          Raza: raza,
          Edad: edad ? Number(edad) : null,
          Peso: peso ? Number(peso) : null,
          IndicacionesMedicas: indicaciones || null,
          FotoUrl: fotoUrl || null,
        };
        const data = await actualizarMascota(initial!.id, payload, token);
        onSaved(data, "edit");
      } else {
        const payload: CrearMascotaPayload = {
          Nombre: nombre,
          Raza: raza,
          Edad: edad ? Number(edad) : null,
          Peso: peso ? Number(peso) : null,
          IndicacionesMedicas: indicaciones || null,
          FotoUrl: fotoUrl || null,
        };
        const data = await crearMascota(payload, token);
        onSaved(data, "create");
      }
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "No pude guardar";
      onError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogPortal>
      <div className="vih-overlay" onClick={onClose}>
        <form
          className="vih-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pet-dialog-title"
          onClick={(event) => event.stopPropagation()}
          onSubmit={handleSubmit}
        >
          <header className="vih-dialog-header">
            <h2 id="pet-dialog-title">{isEdit ? "Editar mascota" : "Nueva mascota"}</h2>
            <button
              type="button"
              className="vih-icon-btn vih-press"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <Icon name="X" size={18} />
            </button>
          </header>

          <div className="vih-dialog-body">
            <label className="vih-input">
              <span className="vih-label-text">Nombre<span className="vih-required" aria-hidden="true">*</span></span>
              <input
                required
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Max"
                autoFocus
              />
            </label>
            <label className="vih-input">
              <span className="vih-label-text">Raza o especie<span className="vih-required" aria-hidden="true">*</span></span>
              <input
                required
                value={raza}
                onChange={(event) => setRaza(event.target.value)}
                placeholder="Golden Retriever"
              />
            </label>
            <div className="vih-dialog-row">
              <label className="vih-input">
                Edad (años)
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={edad}
                  onChange={(event) => setEdad(event.target.value)}
                  placeholder="3"
                />
              </label>
              <label className="vih-input">
                Peso (kg)
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={300}
                  value={peso}
                  onChange={(event) => setPeso(event.target.value)}
                  placeholder="12"
                />
              </label>
            </div>
            <label className="vih-input">
              Indicaciones médicas
              <textarea
                value={indicaciones}
                onChange={(event) => setIndicaciones(event.target.value)}
                placeholder="Alergias, medicamentos..."
                rows={3}
              />
            </label>
            <div className={`vih-photo-upload ${hasPhoto ? "has-photo" : ""}`}>
              <div
                className="vih-photo-upload-preview"
                style={hasPhoto ? { backgroundImage: `url(${fotoPreview})` } : undefined}
                aria-hidden="true"
              >
                {!hasPhoto && <Icon name="PawPrint" size={28} />}
              </div>
              <div className="vih-photo-upload-copy">
                <span>Foto de la mascota</span>
                <strong>
                  {uploadingPhoto
                    ? "Subiendo foto..."
                    : hasPhoto
                      ? "Foto lista para guardar"
                      : "Agrega una foto desde tu dispositivo"}
                </strong>
                <p>{fotoFileName || "JPG, PNG o WEBP. Maximo 5 MB."}</p>
              </div>
              <div className="vih-photo-upload-actions">
                <label className="vih-photo-upload-button vih-press">
                  {hasPhoto ? "Cambiar" : "Cargar foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => void handlePhotoChange(event)}
                    disabled={uploadingPhoto || submitting}
                  />
                </label>
                {hasPhoto && (
                  <button
                    type="button"
                    className="vih-photo-remove"
                    onClick={clearPhoto}
                    disabled={uploadingPhoto || submitting}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>

          <footer className="vih-dialog-footer">
            <button type="button" className="vih-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="vih-primary" disabled={submitting || uploadingPhoto}>
              {uploadingPhoto ? "Subiendo foto..." : submitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear mascota"}
            </button>
          </footer>
        </form>
      </div>
    </DialogPortal>
  );
}

function PetHealthDialog({
  token,
  mascota,
  onClose,
  onError,
  onSaved,
}: {
  token: string;
  mascota: Mascota;
  onClose: () => void;
  onError: (message: string) => void;
  onSaved: (message: string) => void;
}) {
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<"vacuna" | "historial">("vacuna");
  const [submitting, setSubmitting] = useState(false);

  const [vacunaNombre, setVacunaNombre] = useState("");
  const [vacunaFecha, setVacunaFecha] = useState(todayInput());
  const [vacunaProxima, setVacunaProxima] = useState("");
  const [vacunaVeterinario, setVacunaVeterinario] = useState("");
  const [vacunaNotas, setVacunaNotas] = useState("");

  const [historialTipo, setHistorialTipo] = useState("consulta");
  const [historialTitulo, setHistorialTitulo] = useState("");
  const [historialDescripcion, setHistorialDescripcion] = useState("");
  const [historialFecha, setHistorialFecha] = useState(todayInput());
  const [historialProfesional, setHistorialProfesional] = useState("");

  async function refreshHealth() {
    setLoading(true);
    const [vacunasResult, historialResult] = await Promise.allSettled([
      listVacunas(mascota.id, token),
      listHistorial(mascota.id, token),
    ]);

    if (vacunasResult.status === "fulfilled") setVacunas(vacunasResult.value);
    else if (vacunasResult.reason instanceof ApiError) onError(vacunasResult.reason.message);

    if (historialResult.status === "fulfilled") setHistorial(historialResult.value);
    else if (historialResult.reason instanceof ApiError) onError(historialResult.reason.message);

    setLoading(false);
  }

  useEffect(() => {
    void refreshHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mascota.id, token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (formMode === "vacuna") {
        const payload: CrearVacunaPayload = {
          Nombre: vacunaNombre.trim(),
          FechaAplicacion: vacunaFecha,
          FechaProxima: vacunaProxima || null,
          Veterinario: vacunaVeterinario.trim() || null,
          Lote: null,
          Notas: vacunaNotas.trim() || null,
          DocumentoUrl: null,
        };
        const created = await crearVacuna(mascota.id, payload, token);
        setVacunas((prev) => [created, ...prev]);
        setVacunaNombre("");
        setVacunaProxima("");
        setVacunaVeterinario("");
        setVacunaNotas("");
        onSaved("Vacuna agregada al carnet");
      } else {
        const payload: CrearHistorialPayload = {
          Tipo: historialTipo.trim() || "consulta",
          Titulo: historialTitulo.trim(),
          Descripcion: historialDescripcion.trim(),
          Fecha: historialFecha || null,
          Profesional: historialProfesional.trim() || null,
          DocumentoUrl: null,
        };
        const created = await crearHistorial(mascota.id, payload, token);
        setHistorial((prev) => [created, ...prev]);
        setHistorialTitulo("");
        setHistorialDescripcion("");
        setHistorialProfesional("");
        onSaved("Registro clínico agregado");
      }
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "No pude guardar salud";
      onError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogPortal>
      <div className="vih-overlay" onClick={onClose}>
        <section
          className="vih-dialog vih-health-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="health-dialog-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="vih-dialog-header">
            <div className="vih-dialog-title">
              <PetAvatar pet={mascota} size={48} ring />
              <div>
                <h2 id="health-dialog-title">Carnet de {mascota.nombre}</h2>
                <p>Vacunas, controles e historial clínico.</p>
              </div>
            </div>
            <button
              type="button"
              className="vih-icon-btn vih-press"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <Icon name="X" size={18} />
            </button>
          </header>

          <div className="vih-dialog-body vih-health-body">
            <div className="vih-health-summary">
              <article>
                <Icon name="Syringe" size={18} color="var(--green-cta)" />
                <span>Vacunas</span>
                <strong>{vacunas.length}</strong>
              </article>
              <article>
                <Icon name="HeartPulse" size={18} color="var(--green-cta)" />
                <span>Registros</span>
                <strong>{historial.length}</strong>
              </article>
              <article>
                <Icon name="Calendar" size={18} color="var(--gold-600)" />
                <span>Próxima</span>
                <strong>{nextVaccineDate(vacunas)}</strong>
              </article>
            </div>

            {loading ? (
              <p className="vih-loading">Cargando salud...</p>
            ) : (
              <div className="vih-health-grid">
                <section className="vih-health-card">
                  <h3>
                    <Icon name="Syringe" size={17} /> Carnet de vacunas
                  </h3>
                  {vacunas.length === 0 && (
                    <p className="vih-muted">Aún no hay vacunas registradas.</p>
                  )}
                  {vacunas.map((vacuna) => (
                    <article key={vacuna.id} className="vih-health-item">
                      <strong>{vacuna.nombre}</strong>
                      <span>
                        Aplicada {formatDateOnly(vacuna.fechaAplicacion)}
                        {vacuna.fechaProxima
                          ? ` · próxima ${formatDateOnly(vacuna.fechaProxima)}`
                          : ""}
                      </span>
                      {vacuna.veterinario && <p>{vacuna.veterinario}</p>}
                    </article>
                  ))}
                </section>

                <section className="vih-health-card">
                  <h3>
                    <Icon name="HeartPulse" size={17} /> Historial clínico
                  </h3>
                  {historial.length === 0 && (
                    <p className="vih-muted">Aún no hay registros clínicos.</p>
                  )}
                  {historial.map((record) => (
                    <article key={record.id} className="vih-health-item">
                      <strong>{record.titulo}</strong>
                      <span>
                        {record.tipo} · {formatDateOnly(record.fecha)}
                      </span>
                      <p>{record.descripcion}</p>
                      {record.profesional && <small>{record.profesional}</small>}
                    </article>
                  ))}
                </section>
              </div>
            )}

            <form className="vih-health-form" onSubmit={handleSubmit}>
              <div className="vih-tabs">
                <button
                  type="button"
                  className={`vih-tab ${formMode === "vacuna" ? "is-active" : ""}`}
                  onClick={() => setFormMode("vacuna")}
                >
                  <Icon name="Syringe" size={15} /> Nueva vacuna
                </button>
                <button
                  type="button"
                  className={`vih-tab ${formMode === "historial" ? "is-active" : ""}`}
                  onClick={() => setFormMode("historial")}
                >
                  <Icon name="HeartPulse" size={15} /> Registro clínico
                </button>
              </div>

              {formMode === "vacuna" ? (
                <div className="vih-health-form-grid">
                  <label className="vih-input">
                    <span className="vih-label-text">Vacuna<span className="vih-required" aria-hidden="true">*</span></span>
                    <input
                      required
                      value={vacunaNombre}
                      onChange={(event) => setVacunaNombre(event.target.value)}
                      placeholder="Rabia, triple felina..."
                    />
                  </label>
                  <label className="vih-input">
                    <span className="vih-label-text">Fecha aplicada<span className="vih-required" aria-hidden="true">*</span></span>
                    <input
                      type="date"
                      required
                      value={vacunaFecha}
                      onChange={(event) => setVacunaFecha(event.target.value)}
                    />
                  </label>
                  <label className="vih-input">
                    Próxima dosis
                    <input
                      type="date"
                      value={vacunaProxima}
                      onChange={(event) => setVacunaProxima(event.target.value)}
                    />
                  </label>
                  <label className="vih-input">
                    Veterinario
                    <input
                      value={vacunaVeterinario}
                      onChange={(event) => setVacunaVeterinario(event.target.value)}
                      placeholder="Dra. Ana"
                    />
                  </label>
                  <label className="vih-input vih-health-form-wide">
                    Notas
                    <textarea
                      rows={2}
                      value={vacunaNotas}
                      onChange={(event) => setVacunaNotas(event.target.value)}
                      placeholder="Lote, reacción, observaciones..."
                    />
                  </label>
                </div>
              ) : (
                <div className="vih-health-form-grid">
                  <label className="vih-input">
                    Tipo
                    <select
                      value={historialTipo}
                      onChange={(event) => setHistorialTipo(event.target.value)}
                    >
                      <option value="consulta">Consulta</option>
                      <option value="control">Control</option>
                      <option value="urgencia">Urgencia</option>
                      <option value="tratamiento">Tratamiento</option>
                    </select>
                  </label>
                  <label className="vih-input">
                    Fecha
                    <input
                      type="date"
                      value={historialFecha}
                      onChange={(event) => setHistorialFecha(event.target.value)}
                    />
                  </label>
                  <label className="vih-input vih-health-form-wide">
                    <span className="vih-label-text">Título<span className="vih-required" aria-hidden="true">*</span></span>
                    <input
                      required
                      value={historialTitulo}
                      onChange={(event) => setHistorialTitulo(event.target.value)}
                      placeholder="Control general"
                    />
                  </label>
                  <label className="vih-input vih-health-form-wide">
                    <span className="vih-label-text">Descripción<span className="vih-required" aria-hidden="true">*</span></span>
                    <textarea
                      required
                      rows={3}
                      value={historialDescripcion}
                      onChange={(event) => setHistorialDescripcion(event.target.value)}
                      placeholder="Síntomas, diagnóstico, tratamiento..."
                    />
                  </label>
                  <label className="vih-input vih-health-form-wide">
                    Profesional
                    <input
                      value={historialProfesional}
                      onChange={(event) => setHistorialProfesional(event.target.value)}
                      placeholder="Dr. Carlos"
                    />
                  </label>
                </div>
              )}

              <button type="submit" className="vih-primary vih-health-submit" disabled={submitting}>
                <Icon name="Plus" size={16} />
                {submitting ? "Guardando..." : "Agregar registro"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </DialogPortal>
  );
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateOnly(value: string | null) {
  if (!value || value.startsWith("0001")) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nextVaccineDate(vacunas: Vacuna[]) {
  const upcoming = vacunas
    .map((vacuna) => vacuna.fechaProxima)
    .filter((fecha): fecha is string => Boolean(fecha))
    .map((fecha) => new Date(fecha))
    .filter((date) => !Number.isNaN(date.getTime()) && date.getTime() >= Date.now())
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return upcoming ? formatDateOnly(upcoming.toISOString()) : "Sin fecha";
}
