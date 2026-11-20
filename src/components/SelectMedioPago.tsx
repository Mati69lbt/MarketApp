// cspell: ignore mediospago
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Notiflix from "notiflix";
import { useMediosPago } from "../helpers/g-m/useMediosPago";
import MedioPagoLogo from "./MedioPagoLogo";
import "../styles/SelectMedioPago.css";

interface Props {
  value?: string;
  onChange: (nombre: string | undefined) => void;
}

const SelectMedioPago = ({ value, onChange }: Props) => {
  const { medios, agregarMedio, borrarMedio, cargando } = useMediosPago();
  const [abierto, setAbierto] = useState(false);
  const [creando, setCreando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const ordenados = useMemo(
    () =>
      [...medios].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      ),
    [medios]
  );

  useEffect(() => {
    const onClickFuera = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setAbierto(false);
        setCreando(false);
      }
    };
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  const cerrarTodo = () => {
    setAbierto(false);
    setCreando(false);
    setNuevoNombre("");
  };

  const seleccionar = (nombre: string) => {
    onChange(nombre);
    cerrarTodo();
  };

  const confirmarNuevo = async () => {
    const limpio = nuevoNombre.trim();
    if (!limpio) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    const existe = medios.some(
      (m) => m.nombre.toLowerCase() === limpio.toLowerCase()
    );
    if (existe) {
      toast.error("Ese medio de pago ya existe");
      return;
    }

    Notiflix.Loading.circle("Guardando medio de pago...");
    try {
      const creado = await agregarMedio(limpio);
      if (!creado) {
        toast.error("Ese medio de pago ya existe");
        return;
      }
      onChange(creado.nombre);
      toast.success("Medio de pago agregado");
      cerrarTodo();
    } catch (error) {
      console.error("Error al agregar medio de pago:", error);
      toast.error("Error al agregar el medio de pago");
    } finally {
      Notiflix.Loading.remove();
    }
  };

  const borrar = (e: React.MouseEvent, id: string, nombre: string) => {
    e.stopPropagation();
    Swal.fire({
      title: "Borrar medio de pago",
      text: `¿Seguro que querés borrar "${nombre}"? Los gastos ya guardados no se ven afectados.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Borrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#9ca3af",
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      try {
        await borrarMedio(id);
        toast.success("Medio de pago borrado");
      } catch (error) {
        console.error("Error al borrar medio de pago:", error);
        toast.error("Error al borrar el medio de pago");
      }
    });
  };

  return (
    <div className="smp" ref={rootRef}>
      <button
        type="button"
        className="smp__trigger"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
      >
        {value ? (
          <span className="smp__valor">
            <MedioPagoLogo nombre={value} size={30} />
            <span className="smp__valor-texto">{value}</span>
          </span>
        ) : (
          <span className="smp__placeholder">Seleccionar...</span>
        )}
        <span className="smp__caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {abierto && (
        <ul className="smp__lista" role="listbox">
          {cargando && <li className="smp__cargando">Cargando...</li>}

          {ordenados.map((m) => (
            <li
              key={m.id}
              className="smp__opcion"
              role="option"
              aria-selected={m.nombre === value}
            >
              <button
                type="button"
                className="smp__opcion-btn"
                onClick={() => seleccionar(m.nombre)}
              >
                <MedioPagoLogo nombre={m.nombre} size={30} />
                <span>{m.nombre}</span>
              </button>
              <button
                type="button"
                className="smp__opcion-del"
                aria-label={`Borrar ${m.nombre}`}
                title={`Borrar ${m.nombre}`}
                onClick={(e) => borrar(e, m.id, m.nombre)}
              >
                🗑️
              </button>
            </li>
          ))}

          <li className="smp__opcion smp__opcion--nuevo">
            {creando ? (
              <div className="smp__nuevo-form">
                <input
                  autoFocus
                  type="text"
                  value={nuevoNombre}
                  placeholder="Nombre del medio de pago"
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmarNuevo();
                    if (e.key === "Escape") {
                      setCreando(false);
                      setNuevoNombre("");
                    }
                  }}
                />
                <div className="smp__nuevo-acciones">
                  <button
                    type="button"
                    className="smp__nuevo-ok"
                    onClick={confirmarNuevo}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="smp__nuevo-cancel"
                    onClick={() => {
                      setCreando(false);
                      setNuevoNombre("");
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="smp__opcion-btn smp__opcion-btn--nuevo"
                onClick={() => setCreando(true)}
              >
                + Nuevo
              </button>
            )}
          </li>
        </ul>
      )}
    </div>
  );
};

export default SelectMedioPago;
