// cspell: ignore matias descripcion Verduleria Supermercado Transporte Restaurante Cine Matías anio fechaiso periodoLabel gM_ordenados gC_ordenados tablas-mes-grid tablas-mes-grid--calc TablaDeCalcular TablaIndividual calcularGastos mesActual gastoMensual subTotal costo_cada_uno diferencia_matias diferencia_carolina abrirCrear abrirEditar sinEditado nid toRow listSetter asce calculás podés querés tenés
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

const GastosMensuales = () => {
  const [gastos_Matias, setGastos_Matias] = useState<GastoMensual[]>([]);
  const [gastos_Carolina, setGastos_Carolina] = useState<GastoMensual[]>([]);
  const [total_Carolina, setTotal_Carolina] = useState(0);
  const [total_Matias, setTotal_Matias] = useState(0);
  const [mes, setMes] = useState("");

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Gasto | null>(null);

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

  const handleSubmit = ({ input, id }: { input: GastoInput; id?: string }) => {
    // map del tipo del modal → tipo de tabla (minúsculas en pagadoPor)
    const toRow = (g: GastoInput, idStr: string): GastoMensual => ({
      id: idStr,
      fecha: g.fecha,
      descripcion: g.descripcion,
      monto: g.monto,
      pagadoPor: g.pagadoPor === "Matías" ? "matias" : "carolina",
      periodoKey: "", // si querés, después completamos
      periodoLabel: mes || "", // podés mostrarlo o dejarlo vacío
    });

    const listSetter =
      input.pagadoPor === "Matías" ? setGastos_Matias : setGastos_Carolina;

    listSetter((prev) => {
      const nid = id ?? crypto.randomUUID();
      const sinEditado = prev.filter((x) => x.id !== (id ?? "__none__"));
      const next = [...sinEditado, toRow(input, nid)].sort(asce);
      return next;
    });
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

  // por ahora, borrar solo deja el emoji sin acción real
  const onDeletePlaceholder = (row: FilaGasto) => {
    console.log("Borrar (próximamente):", row);
  };

  return (
    <div>
      <button className="gm-btn gm-btn--primary" onClick={abrirCrear}>
        Agregar gasto
      </button>

      <div className="tablas-mes-grid">
        <TablaIndividual
          titulo="Carolina"
          rows={gC_ordenados}
          labelTotal="Total"
          onEdit={onEditCarolina}
          onDelete={onDeletePlaceholder}
        />
        <TablaIndividual
          titulo="Matías"
          rows={gM_ordenados}
          labelTotal="Total"
          onEdit={onEditMatias}
          onDelete={onDeletePlaceholder}
        />
      </div>
      <div className="tablas-mes-grid tablas-mes-grid--calc">
        <TablaDeCalcular
          carolina={gC_ordenados}
          matias={gM_ordenados}
          periodLabel={mes} // ej: "noviembre-2025" si ya lo calculás con mesActual
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
