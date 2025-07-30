// cspell: ignore Resetear App Firestore Notiflix firestore mostrás notiflix
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Gasto } from "../types/Gasto";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "../styles/ControlPresupuesto.css";
import Notiflix from "notiflix";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../helpers/firebase";
import { toast } from "react-toastify";

interface Props {
  gastos: Gasto[];
  presupuesto: number;
  setGastos: Dispatch<SetStateAction<Gasto[]>>;
  setPresupuesto: Dispatch<SetStateAction<number>>;
  setIsValidPresupuesto: Dispatch<SetStateAction<boolean>>;
}

const ControlPresupuesto = ({
  gastos,
  presupuesto,
  setGastos,
  setPresupuesto,
  setIsValidPresupuesto,
}: Props) => {
  const [porcentaje, setPorcentaje] = useState(0);
  const [disponible, setDisponible] = useState(0);
  const [gastado, setGastado] = useState(0);

  useEffect(() => {
    const totalGastado = gastos.reduce(
      (total, gasto) => gasto.subTotal + total,
      0
    );
    const totalDisponible = presupuesto - totalGastado;

    const nuevoPorcentaje = parseFloat(
      (((presupuesto - totalDisponible) / presupuesto) * 100).toFixed(2)
    );

    setTimeout(() => {
      setPorcentaje(nuevoPorcentaje);
      setDisponible(totalDisponible);
    }, 1500);

    setGastado(totalGastado);
  }, [gastos, presupuesto]);

  const formatearCantidad = (cantidad: number): string => {
    return cantidad.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  };

  const handleResetApp = () => {
    Notiflix.Confirm.show(
      "Confirmar reinicio",
      "¿Desea Reiniciar la App?",
      "Sí, reiniciar",
      "Cancelar",
      async () => {
        try {
          Notiflix.Loading.circle("Reiniciando datos...");

          await setDoc(doc(db, "presupuesto", "valor"), { valor: 0 });
          await setDoc(doc(db, "gastos", "lista"), { gastos: [] });

          setGastos([]);
          setPresupuesto(0);
          setIsValidPresupuesto(false);

          toast.success("La app fue reiniciada correctamente.");
        } catch (error) {
          console.error("Error al reiniciar datos en Firestore:", error);
          toast.error("Hubo un error al reiniciar los datos.");
        } finally {
          Notiflix.Loading.remove();
        }
      },
      () => {
        toast.info("Reinicio cancelado.");
      }
    );
  };

  const exportarJSON = () => {
    const jsonString = JSON.stringify(gastos, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const hoy = new Date();
    const fecha =
      hoy.getFullYear() +
      "-" +
      String(hoy.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(hoy.getDate()).padStart(2, "0");

    const nombreArchivo = `gastos_${fecha}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="contenedor-presupuesto contenedor sombra dos-columnas">
      <div>
        <CircularProgressbarWithChildren
          value={porcentaje}
          styles={buildStyles({
            pathColor: porcentaje > 100 ? "#dc2626" : "#3b82f6",
            trailColor: "#f5f5f5",
          })}
        >
          <div
            className={`circular-text ${porcentaje > 100 ? "rojo" : "azul"}`}
          >
            <strong>{porcentaje}%</strong>
            <div>Gastado</div>
          </div>
        </CircularProgressbarWithChildren>
      </div>
      <div className="contenido-presupuesto">
        <button className="reset-app" type="button" onClick={handleResetApp}>
          Resetear App
        </button>
        <hr />
        <button
          className="reset-app-exportar"
          type="button"
          onClick={exportarJSON}
        >
          Exportar JSON
        </button>
        <p>
          <span>Presupuesto: </span>
          {formatearCantidad(presupuesto)}
        </p>
        <p className={`${disponible < 0 ? "negativo" : ""}`}>
          <span>Disponible: </span>
          {formatearCantidad(disponible)}
        </p>
        <p>
          <span>Gastado: </span>
          {formatearCantidad(gastado)}
        </p>
      </div>
    </div>
  );
};

export default ControlPresupuesto;
