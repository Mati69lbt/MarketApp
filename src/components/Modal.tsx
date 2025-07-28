// cspell: ignore categoria subcripciones Edicion categorias  
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { NumericFormat } from "react-number-format";
import cerrarBTN from "../img/cerrar.svg";
import Mensaje from "./Mensaje";
import type { Categoria, Gasto } from "../types/Gasto";
import "../styles/Modal.css";

interface ModalProps {
  setModal: Dispatch<SetStateAction<boolean>>;
  animarModal: boolean;
  setAnimarModal: Dispatch<SetStateAction<boolean>>;
  guardarGasto: (gasto: Gasto) => void;
  gastoEditar: Gasto | null;
  setGastoEditar: Dispatch<SetStateAction<Gasto | null>>;
}

const Modal = ({
  setModal,
  animarModal,
  setAnimarModal,
  guardarGasto,
  gastoEditar,
  setGastoEditar,
}: ModalProps) => {
  const [mensaje, setMensaje] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(0);
  const [categoria, setCategoria] = useState<string>("");
  const [unidades, setUnidades] = useState<number>(1);
  const [id, setId] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null!);
  const cantidadRef = useRef<HTMLInputElement>(null!);

  const categorias_nombre = [
    { value: "ahorro" },
    { value: "gastos" },
    { value: "comida" },
    { value: "casa" },
    { value: "salud" },
    { value: "ocio" },
    { value: "subcripciones" },
  ];

  useEffect(() => {
      if (gastoEditar && Object.keys(gastoEditar).length > 0) {
        setNombre(gastoEditar.nombre ?? "");
        setCantidad(gastoEditar.cantidad ?? 0);
        setCategoria(gastoEditar.categoria ?? "");
        setUnidades(gastoEditar.unidades ?? 1);
        setId(gastoEditar.id ?? "");
       setFecha(String(gastoEditar.fecha ?? ""));
      }
  }, [gastoEditar]);

  const seleccionarTexto = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) ref.current.select();
  };

  const ocultarModal = () => {
    setAnimarModal(false);
  setGastoEditar(null);
    setTimeout(() => {
      setModal(false);
    }, 500);
  };

  const subTotal = cantidad * unidades;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nombre || cantidad === 0) {
      setMensaje("Todos los Campos son Obligatorios");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    const categoriaRandom =
      categorias_nombre[Math.floor(Math.random() * categorias_nombre.length)];

    const esEdicion = !!gastoEditar?.nombre;
    const fechaActual = esEdicion ? fecha : new Date().toISOString();

    guardarGasto({
      nombre,
      cantidad,
      categoria: categoriaRandom.value as Categoria,
      unidades,
      id,
      fecha: fechaActual,
      subTotal,
    });
  };

  return (
    <div className="modal">
      <div className="cerrar-modal">
        <img src={cerrarBTN} alt="cerrarBtn" onClick={ocultarModal} />
      </div>
      <form
        className={`formulario ${animarModal ? "animar" : "cerrar"}`}
        onSubmit={handleSubmit}
      >
        <legend>{gastoEditar?.nombre ? "Editar Gasto" : "Nuevo Gasto"}</legend>
        {mensaje && <Mensaje tipo="error">{mensaje}</Mensaje>}

        <div className="campo">
          <label htmlFor="nombre">Nombre Gasto</label>
          <input
            type="text"
            id="nombre"
            placeholder="Añade el Nombre del Gasto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="off"
            style={{ width: "100%" }}
          />
        </div>

        <div className="campo">
          <label htmlFor="precio">Precio del Producto</label>
          <NumericFormat
            placeholder="Ej: $3.309"
            id="precio"
            value={cantidad}
            thousandSeparator="."
            decimalSeparator=","
            prefix="$ "
            allowNegative={false}
            decimalScale={2}
            fixedDecimalScale
            inputMode="decimal"
            getInputRef={inputRef}
            onClick={() => seleccionarTexto(inputRef)}
            onValueChange={({ floatValue }) => {
              setCantidad(floatValue ?? 0);
            }}
            style={{ width: "100%" }}
          />
        </div>

        <div className="campo">
          <label htmlFor="unidades">Cantidad</label>
          <NumericFormat
            placeholder="¿Cuántos vas a comprar?"
            id="unidades"
            value={unidades}
            thousandSeparator="."
            decimalSeparator=","
            allowNegative={false}
            decimalScale={0}
            inputMode="numeric"
            getInputRef={cantidadRef}
            onClick={() => seleccionarTexto(cantidadRef)}
            onValueChange={({ floatValue }) => {
              setUnidades(floatValue ?? 0);
            }}
            style={{ width: "100%" }}
          />
        </div>

        <div className="campo">
          <label htmlFor="subTotal">Sub Total</label>
          <h3 className="subTotal">
            {(subTotal || 0).toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            })}
          </h3>
        </div>

        <input
          type="submit"
          value={gastoEditar?.nombre ? "Actualizar Gasto" : "Añadir Gasto"}
        />
        <br />
        <br />
        <button type="button" onClick={ocultarModal}>
          Cerrar
        </button>
      </form>
    </div>
  );
};

export default Modal;
