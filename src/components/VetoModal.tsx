//cspell: ignore fechaiso Swal Confirmás Descripcion Matías anio mes gm-modal gm-hint gm-periodo gm-input gm-field gm-radios gm-btn gm-close bloqueante descripcion sweetalert2 Notiflix
import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import "../styles/GastoModal.css";
import Swal from "sweetalert2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../helpers/firebase";
import Notiflix from "notiflix";

export const invalidarCacheSugerencias = () => {
  cacheSugerencias = null;
};

export interface Gasto {
  id: string;
  fecha: string; // "YYYY-MM-DD"
  descripcion: string;
  monto: number; // guardado como number
}

export type GastoInput = Omit<Gasto, "id">;

type Mode = "create" | "edit";

interface Props {
  isOpen: boolean;
  mode: Mode; // "create" | "edit"
  periodoLabel?: string; // ej: "noviembre-2025" (para aviso)
  initial?: Partial<Gasto>; // si es edición, pasar gasto
  onClose: () => void; // cerrar sin guardar
  onSubmit: (data: { input: GastoInput; id?: string }) => Promise<void> | void;
}

function parsePeriodo(label?: string) {
  // "noviembre-2025" ⇒ {mes: 10, anio: 2025} (mes base 0)
  if (!label) return null;
  const [mesStr, anioStr] = label.split("-"); // ojo: mes en español
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const idx = meses.indexOf(mesStr?.toLowerCase().trim());
  const anio = Number(anioStr);
  return idx >= 0 && anio ? { mes: idx, anio } : null;
}

function fechaEnPeriodo(fechaISO: string, periodoLabel?: string) {
  const p = parsePeriodo(periodoLabel);
  if (!p) return true; // si no hay periodo aún, no advertimos
  const d = new Date(fechaISO);
  return d.getFullYear() === p.anio && d.getMonth() === p.mes;
}

let cacheSugerencias: string[] | null = null;

const cargarSugerencias = async (): Promise<string[]> => {
  if (cacheSugerencias) return cacheSugerencias;
  const snap = await getDocs(collection(db, "sugerenciasVetos"));
  cacheSugerencias = snap.docs
    .map((d) => (d.data().descripcion as string) ?? "")
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es"));
  return cacheSugerencias;
};

const VetoModal = ({
  isOpen,
  mode,
  periodoLabel,
  initial,
  onClose,
  onSubmit,
}: Props) => {
  const [fecha, setFecha] = useState<string>(
    () => initial?.fecha ?? new Date().toISOString().slice(0, 10),
  );
  const [descripcion, setDescripcion] = useState<string>(
    initial?.descripcion ?? "",
  );
  const [monto, setMonto] = useState<number>(
    typeof initial?.monto === "number" ? initial!.monto : 0,
  );

  const [sugerencias, setSugerencias] = useState<string[]>([]);

  useEffect(() => {
    // Carga una vez al montar el componente (o cuando el módulo carga)
    cargarSugerencias()
      .then(setSugerencias)
      .catch((e) => console.error("Error al cargar sugerencias:", e));
  }, []);

  const disabled = !fecha || !descripcion.trim() || (monto ?? 0) <= 0;

  const fueraDePeriodo = useMemo(
    () => !fechaEnPeriodo(fecha, periodoLabel),
    [fecha, periodoLabel],
  );

  useEffect(() => {
    if (!isOpen) return; // solo cuando se abre

    if (mode === "edit" && initial) {
      setFecha(initial.fecha ?? new Date().toISOString().slice(0, 10));
      setDescripcion(initial.descripcion ?? "");
      setMonto(typeof initial.monto === "number" ? initial.monto : 0);
    } else {
      // crear: limpio por defecto
      setFecha(new Date().toISOString().slice(0, 10));
      setDescripcion("");
      setMonto(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initial?.id]);

  const title = mode === "create" ? "Nuevo Vencimiento" : "Editar Vencimiento";
  const cta = mode === "create" ? "Guardar" : "Actualizar";

  const todayISO = () => new Date().toISOString().slice(0, 10);

  // reset suave del form (modo "crear")
  const resetToDefaults = () => {
    setFecha(todayISO());
    setDescripcion("");
    setMonto(0);
  };

  const handleSubmit = () => {
    // ✅ capturar todo ANTES de que Notiflix tome el control
    const input: GastoInput = {
      fecha,
      descripcion: descripcion.trim(),
      monto: monto ?? 0,
    };
    const id = initial?.id;

    Notiflix.Confirm.show(
      cta,
      mode === "create"
        ? "¿Confirmás guardar este vencimiento?"
        : "¿Confirmás actualizar este vencimiento?",
      cta,
      "Cancelar",
      async () => {
        await onSubmit({ input, id });  
        resetToDefaults();
        onClose();
      },
      () => {},
    );
  };

  if (!isOpen) return null;

  return (
    <div className="gm-modal__backdrop" onClick={onClose}>
      <div
        className="gm-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gm-modal__header">
          <h3>{title}</h3>
          <button className="gm-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="gm-modal__body">
          {periodoLabel && (
            <div className="gm-periodo">
              Período activo: <strong>{periodoLabel}</strong>
            </div>
          )}

          <div className="gm-field">
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            {fueraDePeriodo && (
              <div className="gm-hint">
                ⚠️ La fecha no coincide con el período. Se permitirá guardar de
                todas formas.
              </div>
            )}
          </div>

          <div className="gm-field">
            <label>Descripción</label>

            <input
              type="text"
              list="sugerencias-vetos"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Luz / Gas / Internet..."
              className="gm-input"
            />
            <datalist id="sugerencias-vetos">
              {sugerencias.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="gm-field">
            <label>Monto</label>
            <NumericFormat
              value={monto}
              thousandSeparator="."
              decimalSeparator=","
              allowNegative={false}
              prefix="$   "
              decimalScale={2}
              fixedDecimalScale
              onValueChange={({ floatValue }) => setMonto(floatValue ?? 0)}
              className="gm-input"
            />
          </div>
        </div>

        <div className="gm-modal__footer">
          <button className="gm-btn gm-btn--ghost" onClick={onClose}>
            Volver
          </button>
          <button
            className="gm-btn gm-btn--primary"
            onClick={handleSubmit}
            disabled={disabled}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VetoModal;
