// cspell: ignore historialMensuales Matias Matías Notiflix Seleccioná firestore notiflix
import React, { useEffect, useMemo, useState } from "react";
import TablaIndividual from "../components/TablaIndividual";
import Notiflix from "notiflix";
import { toast } from "react-toastify";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../helpers/firebase";
import type { GastoMensual } from "../types/GastosMensuales";
import "../styles/Historial.css";
import { Link } from "react-router-dom";
import { NumericFormat } from "react-number-format";

type HistorialMes = {
  id: string;
  periodoKey: string;
  periodoLabel: string;
  gastosCarolina: GastoMensual[];
  gastosMatias: GastoMensual[];
  totalCarolina: number;
  totalMatias: number;
  totalGeneral: number;
  costoCadaUno: number;
  diferenciaCarolina: number;
  diferenciaMatias: number;
};

const formatearPeriodo = (periodoLabel?: string, periodoKey?: string) => {
  const base = (periodoLabel || periodoKey || "").toString();
  if (!base) return "";

  const lower = base.toLowerCase().trim();
  const partes = lower.split("-");

  if (partes.length === 2) {
    const [mesStr, anioStr] = partes;
    const mesCapitalizado = mesStr.charAt(0).toUpperCase() + mesStr.slice(1);
    return `${mesCapitalizado} - ${anioStr}`;
  }

  return base; // fallback si vino en otro formato
};

const Historial = () => {
  const [historialMeses, setHistorialMeses] = useState<HistorialMes[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");

  useEffect(() => {
    const cargarHistorial = async () => {
      Notiflix.Loading.circle("Cargando historial...");

      try {
        const snap = await getDocs(collection(db, "historialGastosMensuales"));

        const lista: HistorialMes[] = [];

        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;

          lista.push({
            id: docSnap.id,
            periodoKey: data.periodoKey ?? docSnap.id,
            periodoLabel: data.periodoLabel ?? docSnap.id,
            gastosCarolina: (data.gastosCarolina ?? []) as GastoMensual[],
            gastosMatias: (data.gastosMatias ?? []) as GastoMensual[],
            totalCarolina: data.totalCarolina ?? 0,
            totalMatias: data.totalMatias ?? 0,
            totalGeneral: data.totalGeneral ?? 0,
            costoCadaUno: data.costoCadaUno ?? 0,
            diferenciaCarolina: data.diferenciaCarolina ?? 0,
            diferenciaMatias: data.diferenciaMatias ?? 0,
          });
        });
        console.log(lista);

        // ordeno por periodoKey
        lista.sort((a, b) => a.periodoKey.localeCompare(b.periodoKey));

        setHistorialMeses(lista);

        // si no hay uno seleccionado, uso el último (mes más nuevo)
        if (lista.length > 0) {
          setMesSeleccionado(lista[lista.length - 1].id);
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
        toast.error("Error al cargar el historial");
      } finally {
        Notiflix.Loading.remove();
      }
    };

    cargarHistorial();
  }, []);

  // mes actualmente seleccionado
  const mesActual = useMemo(() => {
    if (!mesSeleccionado) return undefined;
    return historialMeses.find((h) => h.id === mesSeleccionado);
  }, [historialMeses, mesSeleccionado]);

  if (historialMeses.length === 0) {
    return (
      <div className="historial">
        <h1 className="sinHistorial">Historial de Gastos Mensuales</h1>
        <p className="sinDatos">No hay meses cerrados todavía.</p>
        <Link to="/gastos-mensuales">
          <button className="btn-volver">Volver</button>
        </Link>
      </div>
    );
  }

  if (!mesActual) {
    return (
      <div className="historial">
        <h1 className="conDatos">Historial de Gastos Mensuales</h1>
        <p className="conMes">Seleccioná un mes para ver el detalle.</p>
        <Link to="/gastos-mensuales">
          <button className="btn-volver">Volver</button>
        </Link>
      </div>
    );
  }

  const {
    periodoKey,
    periodoLabel,
    gastosCarolina,
    gastosMatias,
    totalCarolina,
    totalMatias,
    totalGeneral,
    costoCadaUno,
    diferenciaCarolina,
    diferenciaMatias,
  } = mesActual;

  const periodoFormateado = formatearPeriodo(periodoLabel, periodoKey);

  const montoCarolina = Number(diferenciaCarolina.toFixed(2));
  const montoMatias = Number(diferenciaMatias.toFixed(2));

  let saldoLabel = "Están a mano; nadie le debe a nadie.";
  let saldoMonto: number | null = null;

  if (montoCarolina > 0.01) {
    // Carolina puso de más → Matías le paga a Carolina
    saldoLabel = "Matías le pagó a Carolina";
    saldoMonto = montoCarolina;
  } else if (montoMatias > 0.01) {
    // Matías puso de más → Carolina le paga a Matías
    saldoLabel = "Carolina le pagó a Matías";
    saldoMonto = montoMatias;
  }

  const textoCarolina =
    diferenciaCarolina > 0
      ? `puso de más $${diferenciaCarolina.toFixed(2)}`
      : diferenciaCarolina < 0
      ? `debería recibir $${Math.abs(diferenciaCarolina).toFixed(2)}`
      : "quedó justa";

  const textoMatias =
    diferenciaMatias > 0
      ? `puso de más $${diferenciaMatias.toFixed(2)}`
      : diferenciaMatias < 0
      ? `debería recibir $${Math.abs(diferenciaMatias).toFixed(2)}`
      : "quedó justo";

  return (
    <div className="historial">
      <header className="historial-head">
        <h1>Historial de gastos mensuales</h1>
        <div className="historial-filtros">
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          >
            {historialMeses.map((h) => (
              <option key={h.id} value={h.id}>
                {formatearPeriodo(h.periodoLabel, h.periodoKey)}
              </option>
            ))}
          </select>
          <Link to="/gastos-mensuales">
            <button className="btn-volver">Volver</button>
          </Link>
        </div>
      </header>

      <div className="tablas-mes-grid">
        <TablaIndividual
          titulo={"Carolina"}
          rows={gastosCarolina}
          labelTotal="Total"
          onEdit={() => {}}
          onDelete={() => {}}
        />
        <TablaIndividual
          titulo={`Matías`}
          rows={gastosMatias}
          labelTotal="Total"
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </div>

      <section className="historial-resumen">
        <h2>
          Resumen: <strong>{periodoFormateado}</strong>
        </h2>

        <p className="historial-resumen__fila">
          <span>Total gastado entre los dos</span>
          <strong>
            <NumericFormat
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$ "
              value={totalGeneral}
              decimalScale={2}
              fixedDecimalScale
            />
          </strong>
        </p>

        <p className="historial-resumen__fila">
          <span>Costo para cada uno</span>
          <strong>
            <NumericFormat
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$ "
              value={costoCadaUno}
              decimalScale={2}
              fixedDecimalScale
            />
          </strong>
        </p>

        <p className="historial-resumen__fila historial-resumen__saldo">
          <span>{saldoLabel}</span>
          {saldoMonto !== null ? (
            <strong>
              <NumericFormat
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$ "
                value={saldoMonto}
                decimalScale={2}
                fixedDecimalScale
              />
            </strong>
          ) : (
            <span className="historial-resumen__saldo-mano">
              Están a mano; nadie le debe a nadie.
            </span>
          )}
        </p>
      </section>
    </div>
  );
};

export default Historial;
