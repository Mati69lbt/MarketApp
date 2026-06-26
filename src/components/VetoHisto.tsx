// cspell: ignore vetos periodoLabel periodoKey Notiflix notiflix Seleccioná
import { useEffect, useMemo, useState } from "react";
import Notiflix from "notiflix";
import { toast } from "react-toastify";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../helpers/firebase";
import { NumericFormat } from "react-number-format";
import TablaVeto from "../components/TablaVeto";
import type { FilaGasto } from "../components/TablaVeto";
import "../styles/Historial.css";

type HistorialMes = {
  id: string;
  periodoKey: string;
  periodoLabel: string;
  vetos: FilaGasto[];
  totalVencimientos: number;
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
  return base;
};

const VetoHisto = () => {
  const [historialMeses, setHistorialMeses] = useState<HistorialMes[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");

  useEffect(() => {
    const cargarHistorial = async () => {
      Notiflix.Loading.circle("Cargando historial...");
      try {
        const snap = await getDocs(collection(db, "historialVetosMensuales"));
        const lista: HistorialMes[] = [];

        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          lista.push({
            id: docSnap.id,
            periodoKey: data.periodoKey ?? docSnap.id,
            periodoLabel: data.periodoLabel ?? docSnap.id,
            vetos: (data.vetos ?? []) as FilaGasto[],
            totalVencimientos: data.totalVencimientos ?? 0,
          });
        });

        // más nuevo primero
        lista.sort((a, b) => b.periodoKey.localeCompare(a.periodoKey));
        setHistorialMeses(lista);

        if (lista.length > 0) {
          setMesSeleccionado(lista[0].id);
        }
      } catch (error) {
        console.error("Error al cargar historial de vencimientos:", error);
        toast.error("Error al cargar el historial");
      } finally {
        Notiflix.Loading.remove();
      }
    };

    cargarHistorial();
  }, []);

  const mesActual = useMemo(
    () => historialMeses.find((h) => h.id === mesSeleccionado),
    [historialMeses, mesSeleccionado],
  );

  if (historialMeses.length === 0) {
    return (
      <div className="historial">
        <p className="sinDatos">No hay meses cerrados todavía.</p>
      </div>
    );
  }

  if (!mesActual) {
    return (
      <div className="historial">
        <p className="conMes">Seleccioná un mes para ver el detalle.</p>
      </div>
    );
  }

  const { periodoKey, periodoLabel, vetos, totalVencimientos } = mesActual;
  const periodoFormateado = formatearPeriodo(periodoLabel, periodoKey);

  return (
    <div className="historial">
      <header className="historial-head">
        <h2>Historial de vencimientos</h2>
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
        </div>
      </header>

      <div className="tablas-mes-grid">
        <TablaVeto
          titulo={periodoFormateado}
          rows={vetos}
          labelTotal="Total"
          // sin onEdit ni onDelete: solo lectura
        />
      </div>

      <section className="historial-resumen">
        <p className="historial-resumen__fila">
          <span>Total vencimientos</span>
          <strong>
            <NumericFormat
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$ "
              value={totalVencimientos}
              decimalScale={2}
              fixedDecimalScale
            />
          </strong>
        </p>
      </section>
    </div>
  );
};

export default VetoHisto;
