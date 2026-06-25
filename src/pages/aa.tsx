// cspell: ignore vetos descripcion anio periodoLabel vetos-ordenados TablaVeto calcularGastos mesActual gastoMensual abrirCrear Notiflix Firestore notiflix
import { useEffect, useMemo, useState } from "react";
import type { GastoMensual } from "../types/GastosMensuales";
import mesActual from "../helpers/g-m/utils/mesActual";
import calcularGastos from "../helpers/g-m/utils/calcularGastos";
import "../styles/GastosMensuales.css";
import GastoModal from "../components/GastoModal";
import type { Gasto, GastoInput } from "../components/GastoModal";
import type { FilaGasto } from "../components/TablaVeto";
import Notiflix from "notiflix";
import { toast } from "react-toastify";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "../helpers/firebase";
import TablaVeto from "../components/TablaVeto";

// ✅ Declarada arriba del todo para que los useEffect puedan usarla
const asc = (a: GastoMensual, b: GastoMensual) =>
  a.fecha.localeCompare(b.fecha);

const VetosMensuales = () => {
  const [vetos, setVetos] = useState<GastoMensual[]>([]);
  const [total, setTotal] = useState(0);
  const [mes, setMes] = useState("");

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Gasto | null>(null);

  // ─── Carga inicial desde Firestore ───────────────────────────────────────
  useEffect(() => {
    const cargarVetos = async () => {
      Notiflix.Loading.circle("Cargando vencimientos...");

      try {
        const snap = await getDocs(collection(db, "VetosMensuales"));
        const todos: GastoMensual[] = [];

        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          todos.push({
            id: data.id ?? docSnap.id,
            fecha: data.fecha,
            descripcion: data.descripcion,
            monto: data.monto,
            pagadoPor: "carolina", // todos los vencimientos son de carolina
            periodoKey: data.periodoKey ?? "",
            periodoLabel: data.periodoLabel ?? "",
          });
        });

        setVetos(todos.sort(asc));
      } catch (error) {
        console.error("Error al cargar vencimientos desde Firestore:", error);
        toast.error("Error al cargar los vencimientos");
      } finally {
        Notiflix.Loading.remove();
      }
    };

    cargarVetos();
  }, []);

  // ─── Derivados ────────────────────────────────────────────────────────────
  const vetos_ordenados = useMemo(() => [...vetos].sort(asc), [vetos]);

  useEffect(() => {
    setTotal(Number(calcularGastos(vetos_ordenados).toFixed(2)));
    const { periodLabel } = mesActual(vetos_ordenados, []); // ✅ firma correcta
    setMes(periodLabel);
  }, [vetos_ordenados]);

  // ─── Abrir modal ──────────────────────────────────────────────────────────
  const abrirCrear = () => {
    setEditItem(null);
    setOpen(true);
  };

  // ─── Guardar (crear o editar) ─────────────────────────────────────────────
  const handleSubmit = async ({
    input,
    id,
  }: {
    input: GastoInput;
    id?: string;
  }) => {
    const finalId = id ?? crypto.randomUUID();

    const row: GastoMensual = {
      id: finalId,
      fecha: input.fecha,
      descripcion: input.descripcion,
      monto: input.monto,
      pagadoPor: "carolina",
      periodoKey: "",
      periodoLabel: mes,
    };

    Notiflix.Loading.circle("Guardando vencimiento...");

    try {
      await setDoc(doc(db, "VetosMensuales", finalId), row);

      // ✅ Actualiza estado local: saca el viejo (si existía) y agrega el nuevo
      setVetos((prev) =>
        [...prev.filter((g) => g.id !== finalId), row].sort(asc),
      );

      toast.success("Vencimiento guardado");
      setOpen(false);
      setEditItem(null);
    } catch (error) {
      console.error("Error al guardar vencimiento en Firestore:", error);
      toast.error("Error al guardar el vencimiento");
    } finally {
      Notiflix.Loading.remove();
    }
  };

  // ─── Editar ───────────────────────────────────────────────────────────────
  const onEdit = (row: FilaGasto) => {
    const g: Gasto = {
      id: row.id || crypto.randomUUID(),
      fecha: row.fecha,
      descripcion: row.descripcion,
      monto: row.monto,
      pagadoPor: "Carolina",
    };
    setEditItem(g);
    setOpen(true);
  };

  // ─── Borrar ───────────────────────────────────────────────────────────────
  const onDelete = (row: FilaGasto) => {
    if (!row.id) {
      toast.error("No se puede borrar un vencimiento sin ID");
      return;
    }

    Notiflix.Confirm.show(
      "Borrar vencimiento",
      `¿Seguro que querés borrar "${row.descripcion}" del ${row.fecha}?`,
      "Borrar",
      "Cancelar",
      async () => {
        Notiflix.Loading.circle("Borrando vencimiento...");
        try {
          await deleteDoc(doc(db, "VetosMensuales", row.id!));

          // ✅ Actualiza estado local inmediatamente
          setVetos((prev) => prev.filter((g) => g.id !== row.id));

          toast.success("Vencimiento borrado");
        } catch (error) {
          console.error("Error al borrar vencimiento en Firestore:", error);
          toast.error("Error al borrar el vencimiento");
        } finally {
          Notiflix.Loading.remove();
        }
      },
      () => {
        // cancelar → no hacemos nada
      },
    );
  };

  // ─── Cerrar mes ───────────────────────────────────────────────────────────
  const cerrarMes = () => {
    if (vetos_ordenados.length === 0) {
      toast.info("No hay vencimientos para cerrar.");
      return;
    }

    Notiflix.Confirm.show(
      "Cerrar mes",
      `Vas a cerrar el mes "${mes || "actual"}".\nLos vencimientos pasarán al historial y se vaciarán las tablas.\n¿Continuar?`,
      "Cerrar mes",
      "Cancelar",
      async () => {
        Notiflix.Loading.circle("Cerrando mes...");

        try {
          const first = vetos_ordenados[0];
          const [anio, mesStr] = first.fecha.split("-");
          const periodoKey = `${anio}-${mesStr}`; // ej: "2025-06"

          // ✅ Historial simplificado: solo lo que tiene sentido para vencimientos
          const historialDoc = {
            periodoKey,
            periodoLabel: mes,
            fechaCierre: new Date().toISOString(),
            vetos: vetos_ordenados,
            totalVencimientos: total,
          };

          await setDoc(
            doc(db, "historialVetosMensuales", periodoKey),
            historialDoc,
          );

          // Borrar uno por uno de la colección activa
          for (const v of vetos_ordenados) {
            await deleteDoc(doc(db, "VetosMensuales", v.id));
          }

          // Limpiar estado local
          setVetos([]);
          setTotal(0);
          setMes("");

          toast.success("Mes cerrado y guardado en historial.");
        } catch (error) {
          console.error("Error al cerrar mes:", error);
          toast.error("Error al cerrar el mes");
        } finally {
          Notiflix.Loading.remove();
        }
      },
      () => {
        // cancelar
      },
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <section className="head">
        <h1>Vencimientos del Mes Actual</h1>
        <div className="btn-head">
          <button className="gm-btn gm-btn--primary" onClick={abrirCrear}>
            Agregar Factura
          </button>
          <button className="gm-btn gm-btn--secondary" onClick={cerrarMes}>
            Cerrar Mes
          </button>
        </div>
      </section>

      <div className="tablas-mes-grid">
        <TablaVeto
          titulo={mes}
          rows={vetos_ordenados}
          labelTotal="Total"
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <GastoModal
        isOpen={open}
        mode={editItem ? "edit" : "create"}
        periodoLabel={mes}
        initial={editItem ?? undefined}
        onClose={() => {
          setOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default VetosMensuales;
