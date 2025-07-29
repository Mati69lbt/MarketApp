// cspell: ignore categoria
import { useEffect, useState } from "react";
import type { Gasto } from "../types/Gasto";
import { generarId } from "../helpers/index.ts";
import Header from "../components/Header.js";
import ListadoGastos from "../components/ListadoGastos.js";
import Modal from "../components/Modal.js";
import IconoNuevoGasto from "../img/nuevo-gasto.svg";

function Home() {
  const [gastos, setGastos] = useState<Gasto[]>(
    JSON.parse(localStorage.getItem("gastos") || "[]")
  );

  const [presupuesto, setPresupuesto] = useState<number>(
    Number(localStorage.getItem("presupuesto")) || 0
  );
  const [isValidPresupuesto, setIsValidPresupuesto] = useState<boolean>(false);

  const [modal, setModal] = useState<boolean>(false);
  const [animarModal, setAnimarModal] = useState<boolean>(false);

  const [gastoEditar, setGastoEditar] = useState<Gasto | null>(null);

  useEffect(() => {
    if (gastoEditar && Object.keys(gastoEditar).length > 0) {
      setModal(true);
      setTimeout(() => setAnimarModal(true), 500);
    }
  }, [gastoEditar]);

  useEffect(() => {
    localStorage.setItem("presupuesto", presupuesto.toString());
    localStorage.setItem("gastos", JSON.stringify(gastos));
  }, [presupuesto, gastos]);

  useEffect(() => {
    const presupuestoLs = Number(localStorage.getItem("presupuesto") || 0);
    if (presupuestoLs > 0) {
      setIsValidPresupuesto(true);
    }
  }, []);

  const handleNuevoGasto = () => {
    setModal(true);
    setGastoEditar(null);
    setTimeout(() => setAnimarModal(true), 500);
  };

  const guardarGasto = (gasto: Gasto | Partial<Gasto>) => {
    if ("id" in gasto && gasto.id) {
      const gastosActualizados = gastos.map((g) =>
        g.id === gasto.id ? (gasto as Gasto) : g
      );
      setGastos(gastosActualizados);
      setGastoEditar(null);
    } else {
      const nuevoGasto: Gasto = {
        ...(gasto as Gasto),
        id: generarId(),
        fecha: Date.now(),
        subTotal: (gasto.cantidad || 0) * (gasto.unidades || 1),
      };
      setGastos([...gastos, nuevoGasto]);
    }

    setAnimarModal(false);
    setTimeout(() => setModal(false), 500);
  };

  const eliminarGasto = (id: string) => {
    const gastosActualizados = gastos.filter((g) => g.id !== id);
    setGastos(gastosActualizados);
  };

  return (
    <div className={modal ? "fijar" : ""}>
      <Header
        gastos={gastos}
        setGastos={setGastos}
        presupuesto={presupuesto}
        setPresupuesto={setPresupuesto}
        isValidPresupuesto={isValidPresupuesto}
        setIsValidPresupuesto={setIsValidPresupuesto}
      />

      {isValidPresupuesto && (
        <>
          <main>
            <ListadoGastos
              gastos={gastos}
              setGastoEditar={setGastoEditar}
              eliminarGasto={eliminarGasto}
            />
          </main>
          <div className="nuevo-gasto">
            <img
              src={IconoNuevoGasto}
              alt="IconoNuevoGasto"
              onClick={handleNuevoGasto}
            />
          </div>
        </>
      )}

      {modal && (
        <Modal
          setModal={setModal}
          animarModal={animarModal}
          setAnimarModal={setAnimarModal}
          guardarGasto={guardarGasto}
          gastoEditar={gastoEditar}
          setGastoEditar={setGastoEditar}
        />
      )}

      <div className="footer">
        <p>&copy; {new Date().getFullYear()} - MDelgado (JUL) - V18</p>
      </div>
    </div>
  );
}

export default Home;
