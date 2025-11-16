// cspell: ignore matias descripcion Verduleria Supermercado Transporte Restaurante Cine Matías
import React, { useEffect, useMemo, useState } from "react";
import type { GastoMensual } from "../types/GastosMensuales";
import mesActual from "../helpers/g-m/utils/mesActual";
import calcularGastos from "../helpers/g-m/utils/calcularGastos";
import TablaIndividual from "../components/TablaIndividual";
import "../styles/GastosMensuales.css";
import TablaDeCalcular from "../components/TablaDeCalcular";
import "../styles/TablaDeCalcular.css";

const gastosIniciales_Matias: GastoMensual[] = [
  {
    id: "30",
    fecha: "2024-01-12",
    descripcion: "Supermercado Dia",
    monto: 123851.75,
    pagadoPor: "matias",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "1",
    fecha: "2024-01-12",
    descripcion: "Supermercado",
    monto: 15015.75,
    pagadoPor: "matias",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "2",
    fecha: "2024-01-03",
    descripcion: "Transporte",
    monto: 50450.5,
    pagadoPor: "matias",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "3",
    fecha: "2024-01-05",
    descripcion: "Verduleria",
    monto: 150,
    pagadoPor: "matias",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "13",
    fecha: "2024-01-11",
    descripcion: "Farmacia",
    monto: 20256,
    pagadoPor: "matias",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "23",
    fecha: "2024-01-05",
    descripcion: "Chango",
    monto: 63257.25,
    pagadoPor: "matias",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "33",
    fecha: "2024-01-25",
    descripcion: "Panadería",
    monto: 7550.3,
    pagadoPor: "matias",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
];
const gastosIniciales_Carolina: GastoMensual[] = [
  {
    id: "5",
    fecha: "2024-01-10",
    descripcion: "Restaurante",
    monto: 100,
    pagadoPor: "carolina",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "4",
    fecha: "2024-01-20",
    descripcion: "Cine",
    monto: 8150,
    pagadoPor: "carolina",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "14",
    fecha: "2024-01-31",
    descripcion: "entrada a tan bionica",
    monto: 23000,
    pagadoPor: "carolina",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "31",
    fecha: "2024-01-27",
    descripcion: "Carniceria,descuento de mercado pago incluido",
    monto: 43250.75,
    pagadoPor: "carolina",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "24",
    fecha: "2024-01-02",
    descripcion: "Chango, descuento de personal pay incluido",
    monto: 45025.5,
    pagadoPor: "carolina",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
  {
    id: "25",
    fecha: "2024-01-13",
    descripcion: "Aspiradora nueva",
    monto: 40000,
    pagadoPor: "carolina",
    periodoKey: "2024-01",
    periodoLabel: "Enero-2024",
  },
];

const GastosMensuales = () => {
  const [gastos_Matias, setGastos_Matias] = useState<GastoMensual[]>([]);
  const [gastos_Carolina, setGastos_Carolina] = useState<GastoMensual[]>([]);
  const [total_Carolina, setTotal_Carolina] = useState(0);
  const [total_Matias, setTotal_Matias] = useState(0);
  const [mes, setMes] = useState("");

  useEffect(() => {
    setGastos_Matias(gastosIniciales_Matias);
    setGastos_Carolina(gastosIniciales_Carolina);
  }, []);

  useEffect(() => {
    console.group("GM :: estado");
    console.table(
      gastos_Matias.map((g) => ({
        id: g.id,
        fecha: g.fecha,
        monto: g.monto,
        desc: g.descripcion,
      }))
    );
    console.table(
      gastos_Carolina.map((g) => ({
        id: g.id,
        fecha: g.fecha,
        monto: g.monto,
        desc: g.descripcion,
      }))
    );
    console.groupEnd();
  }, [gastos_Matias, gastos_Carolina]);

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

  const subTotal = total_Matias + total_Carolina;
  const costo_cada_uno = subTotal / 2;
  const diferencia_matias = total_Matias - costo_cada_uno;
  const diferencia_carolina = total_Carolina - costo_cada_uno;

  return (
    <div>
      <div className="tablas-mes-grid">
        <TablaIndividual
          titulo="Carolina"
          rows={gC_ordenados}
          labelTotal="Total"
        />
        <TablaIndividual
          titulo="Matías"
          rows={gM_ordenados}
          labelTotal="Total"
        />
      </div>
      <div className="tablas-mes-grid tablas-mes-grid--calc">
        <TablaDeCalcular
          carolina={gC_ordenados}
          matias={gM_ordenados}
          periodLabel={mes} // ej: "noviembre-2025" si ya lo calculás con mesActual
        />
      </div>
    </div>
  );
};

export default GastosMensuales;
