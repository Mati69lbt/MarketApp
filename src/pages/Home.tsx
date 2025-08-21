// cspell: ignore categoria firestore Almacen Limpieza Cuidado Carniceria Condimentos Notiflix notiflix querés
import { useEffect, useState } from "react";
import type { Gasto } from "../types/Gasto";
import { generarId } from "../helpers/index.ts";
import Header from "../components/Header.js";
import ListadoGastos from "../components/ListadoGastos.js";
import Modal from "../components/Modal.js";
import IconoNuevoGasto from "../img/nuevo-gasto.svg";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Notiflix from "notiflix";
import { db } from "../helpers/firebase.ts";

function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([]);

  const [presupuesto, setPresupuesto] = useState<number>(0);
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
    const guardarEnFirestore = async () => {
      try {
        Notiflix.Loading.circle("Guardando Presupuesto...");
        await setDoc(doc(db, "presupuesto", "valor"), { valor: presupuesto });
        await setDoc(doc(db, "gastos", "lista"), { gastos });
      } catch (error) {
        toast.error("Error al guardar el presupuesto");
        console.error("Error al guardar en Firestore:", error);
      } finally {
        Notiflix.Loading.remove();
      }
    };

    if (presupuesto > 0) {
      guardarEnFirestore();
    }
  }, [presupuesto, gastos]);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      Notiflix.Loading.circle("Cargando datos...");

      // Promesas individuales
      const cargarPresupuesto = async () => {
        try {
          const docRef = doc(db, "presupuesto", "valor");
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            const valor = data?.valor;
            if (typeof valor === "number" && valor > 0) {
              setPresupuesto(valor);
              setIsValidPresupuesto(true);
            }
          }
        } catch (error) {
          toast.error("Error al cargar el presupuesto");
          console.error("Error al obtener el presupuesto:", error);
        }
      };

      const cargarGastos = async () => {
        try {
          const docRef = doc(db, "gastos", "lista");
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (Array.isArray(data?.gastos)) {
              setGastos(data.gastos);
            }
          }
        } catch (error) {
          toast.error("Error al cargar los gastos");
          console.error("Error al obtener los gastos:", error);
        }
      };

      // Ejecutar en paralelo
      await Promise.all([cargarPresupuesto(), cargarGastos()]);

      Notiflix.Loading.remove();
    };

    cargarDatosIniciales();
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
        <p>&copy; {new Date().getFullYear()} - MDelgado (JUL) - V25</p>
      </div>
    </div>
  );
}

export default Home;
