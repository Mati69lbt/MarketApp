// cspell: ignore matias descripcion Verduleria Supermercado Transporte Restaurante Cine Matías anio fechaiso periodoLabel gM_ordenados gC_ordenados tablas-mes-grid tablas-mes-grid--calc TablaDeCalcular TablaIndividual calcularGastos mesActual gastoMensual subTotal costo_cada_uno diferencia_matias diferencia_carolina abrirCrear abrirEditar sinEditado nid toRow listSetter asce calculás podés querés tenés Notiflix Firestore notiflix
import React, { useEffect, useMemo, useState } from "react";
import type { GastoMensual } from "../types/GastosMensuales";
import mesActual from "../helpers/g-m/utils/mesActual";
import calcularGastos from "../helpers/g-m/utils/calcularGastos";
import TablaIndividual from "../components/TablaIndividual";
import "../styles/GastosMensuales.css";
import TablaDeCalcular from "../components/TablaDeCalcular";
import "../styles/TablaDeCalcular.css";
import GastoModal from "../components/GastoModal";
import type { Gasto, GastoInput } from "../components/GastoModal";
import type { FilaGasto } from "../components/TablaIndividual";
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

const GastosMensuales = () => {
  const [gastos_Matias, setGastos_Matias] = useState<GastoMensual[]>([]);
  const [gastos_Carolina, setGastos_Carolina] = useState<GastoMensual[]>([]);
  const [total_Carolina, setTotal_Carolina] = useState(0);
  const [total_Matias, setTotal_Matias] = useState(0);
  const [mes, setMes] = useState("");

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Gasto | null>(null);

  useEffect(() => {
    const cargarGastos = async () => {
      Notiflix.Loading.circle("Cargando gastos...");

      try {
        const snap = await getDocs(collection(db, "gastosMensuales"));

        const todos: GastoMensual[] = [];

        console.log(todos);

        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;

          // normalizo el pagador al tipo de GastoMensual ("matias" | "carolina")
          let pagadoNormalizado: "matias" | "carolina" = "matias";
          if (data.pagadoPor === "Carolina" || data.pagadoPor === "carolina") {
            pagadoNormalizado = "carolina";
          }

          todos.push({
            id: data.id ?? docSnap.id,
            fecha: data.fecha,
            descripcion: data.descripcion,
            monto: data.monto,
            pagadoPor: pagadoNormalizado,
            periodoKey: data.periodoKey ?? "",
            periodoLabel: data.periodoLabel ?? "",
          });
        });

        // separo en listas para cada uno
        const gastosMatias = todos
          .filter((g) => g.pagadoPor === "matias")
          .sort(asce);
        const gastosCarolina = todos
          .filter((g) => g.pagadoPor === "carolina")
          .sort(asce);

        setGastos_Matias(gastosMatias);
        setGastos_Carolina(gastosCarolina);
      } catch (error) {
        console.error("Error al cargar gastos desde Firestore:", error);
        toast.error("Error al cargar los gastos");
      } finally {
        Notiflix.Loading.remove();
      }
    };

    cargarGastos();
  }, []); // solo al montar el componente

  // abrir para crear
  const abrirCrear = () => {
    setEditItem(null);
    setOpen(true);
  };
  // abrir para editar
  const abrirEditar = (g: Gasto) => {
    setEditItem(g);
    setOpen(true);
  };

  const asce = (a: GastoMensual, b: GastoMensual) =>
    a.fecha.localeCompare(b.fecha);

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
      pagadoPor: input.pagadoPor === "Matías" ? "matias" : "carolina", // según tu tipo
      periodoKey: "", // o lo que uses como clave
      periodoLabel: mes,
    };

    const gastoFirestore = {
      ...row,
      pagadoPor: input.pagadoPor, // "Carolina" | "Matías"
    };

    // si estamos editando, miro quién era el pagador antes
    const pagadorViejo = id ? editItem?.pagadoPor : undefined; // "Carolina" | "Matías" | undefined
    const pagadorNuevo = input.pagadoPor;

    Notiflix.Loading.circle("Guardando gasto...");

    try {
      // 1) Guardar / actualizar en Firestore
      await setDoc(doc(db, "gastosMensuales", finalId), gastoFirestore);

      // 2) Actualizar estado de Matías
      setGastos_Matias((prev) => {
        let lista = [...prev];

        // si antes era de Matías y ahora no, lo saco
        if (pagadorViejo === "Matías" && pagadorNuevo !== "Matías") {
          lista = lista.filter((g) => g.id !== finalId);
        }

        // si ahora es de Matías (nuevo o editado)
        if (pagadorNuevo === "Matías") {
          lista = lista.filter((g) => g.id !== finalId);
          lista.push(row);
        }

        return lista.sort((a, b) => a.fecha.localeCompare(b.fecha));
      });

      // 3) Actualizar estado de Carolina
      setGastos_Carolina((prev) => {
        let lista = [...prev];

        // si antes era de Carolina y ahora no, lo saco
        if (pagadorViejo === "Carolina" && pagadorNuevo !== "Carolina") {
          lista = lista.filter((g) => g.id !== finalId);
        }

        // si ahora es de Carolina (nuevo o editado)
        if (pagadorNuevo === "Carolina") {
          lista = lista.filter((g) => g.id !== finalId);
          lista.push(row);
        }

        return lista.sort((a, b) => a.fecha.localeCompare(b.fecha));
      });

      toast.success("Gasto guardado");
      setOpen(false);
      setEditItem(null);
    } catch (error) {
      console.error("Error al guardar el gasto en Firestore:", error);
      toast.error("Error al guardar el gasto");
    } finally {
      Notiflix.Loading.remove();
    }
  };

  // ✅ Ordenar sin tocar estado (evita loops)
  const asc = (a: GastoMensual, b: GastoMensual) =>
    a.fecha.localeCompare(b.fecha);
  const gM_ordenados = useMemo(
    () => [...gastos_Matias].sort(asc),
    [gastos_Matias]
  );
  const gC_ordenados = useMemo(
    () => [...gastos_Carolina].sort(asc),
    [gastos_Carolina]
  );

  useEffect(() => {
    setTotal_Matias(Number(calcularGastos(gM_ordenados).toFixed(2)));
    setTotal_Carolina(Number(calcularGastos(gC_ordenados).toFixed(2)));

    const { periodLabel } = mesActual(gastos_Carolina, gastos_Matias);
    setMes(periodLabel);
  }, [gM_ordenados, gC_ordenados, gastos_Carolina, gastos_Matias]);

  const onEditCarolina = (row: FilaGasto) => {
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

  const onEditMatias = (row: FilaGasto) => {
    const g: Gasto = {
      id: row.id || crypto.randomUUID(),
      fecha: row.fecha,
      descripcion: row.descripcion,
      monto: row.monto,
      pagadoPor: "Matías",
    };
    setEditItem(g);
    setOpen(true);
  };

  const borrarGasto = (row: FilaGasto, quien: "Carolina" | "Matías") => {
    if (!row.id) {
      toast.error("No se puede borrar un gasto sin ID");
      return;
    }

    Notiflix.Confirm.show(
      "Borrar gasto",
      `¿Seguro que querés borrar "${row.descripcion}" del ${row.fecha}?`,
      "Borrar",
      "Cancelar",
      async () => {
        Notiflix.Loading.circle("Borrando gasto...");

        try {
          // 1) borrar en Firestore
          await deleteDoc(doc(db, "gastosMensuales", row.id!));

          // 2) actualizar estado local
          if (quien === "Matías") {
            setGastos_Matias((prev) => prev.filter((g) => g.id !== row.id));
          } else {
            setGastos_Carolina((prev) => prev.filter((g) => g.id !== row.id));
          }

          toast.success("Gasto borrado");
        } catch (error) {
          console.error("Error al borrar gasto en Firestore:", error);
          toast.error("Error al borrar el gasto");
        } finally {
          Notiflix.Loading.remove();
        }
      },
      () => {
        // cancelar -> no hacemos nada
      }
    );
  };

  const onDeleteCarolina = (row: FilaGasto) => borrarGasto(row, "Carolina");
  const onDeleteMatias = (row: FilaGasto) => borrarGasto(row, "Matías");

  return (
    <div>
      <section className="head">
        <h1>Gastos Mensuales</h1>
        <div className="btn-head">
          <button className="gm-btn gm-btn--primary" onClick={abrirCrear}>
            Agregar gasto
          </button>
          <button className="gm-btn gm-btn--secondary">Cerrar Mes</button>
        </div>
      </section>

      <div className="tablas-mes-grid">
        <TablaIndividual
          titulo="Carolina"
          rows={gC_ordenados}
          labelTotal="Total"
          onEdit={onEditCarolina}
          onDelete={onDeleteCarolina}
        />
        <TablaIndividual
          titulo="Matías"
          rows={gM_ordenados}
          labelTotal="Total"
          onEdit={onEditMatias}
          onDelete={onDeleteMatias}
        />
      </div>
      <div className="tablas-mes-grid tablas-mes-grid--calc">
        <TablaDeCalcular
          carolina={gC_ordenados}
          matias={gM_ordenados}
          periodLabel={mes}
        />
      </div>
      <GastoModal
        isOpen={open}
        mode={editItem ? "edit" : "create"}
        periodoLabel={mes} // ej: "noviembre-2025"; si aún no lo tenés, podés omitir
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

export default GastosMensuales;
