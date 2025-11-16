//cspell:ignore FilaGasto descripcion
import React, { useMemo } from "react";
import { NumericFormat } from "react-number-format";
import "../styles/TablaIndividual.css";

export interface FilaGasto {
  id?: string; // opcional: si no viene, usamos el índice
  fecha: string; // "YYYY-MM-DD"
  descripcion: string;
  monto: number; // valor crudo, no string
}
/** Props del componente */
interface TablaIndividualProps {
  titulo: string; // ej: "Carolina" | "Matías"
  rows: FilaGasto[]; // filas a mostrar (solo lectura)
  /** Texto a mostrar en la fila de total (ej: "Total Carolina") */
  labelTotal?: string;
  /** Si querés ocultar/mostrar la col de índice (#) */
  showIndex?: boolean;
  /** Clase extra para contenedor (opcional) */
  className?: string;
}

// Meses abreviados con mayúscula inicial y sin punto
const MESES_ABR = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/** "YYYY-MM-DD" -> "2 Nov" (sin UTC raros) */
const formatFechaCorta = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dia = String(d ?? 1).replace(/^0+/, ""); // sin cero adelante
  const mes = MESES_ABR[(m ?? 1) - 1] ?? "";
  return `${dia} ${mes}`;
};

/** capitaliza solo la primera letra, trim + colapsa espacios */
const prettyDescripcion = (s: string) => {
  const t = s?.trim().replace(/\s+/g, " ") ?? "";
  return t ? t[0].toUpperCase() + t.slice(1) : "";
};

const TablaIndividual = ({
  titulo,
  rows,
  labelTotal,
  showIndex = true,
  className = "",
}: TablaIndividualProps) => {
  const filasOrdenadas = useMemo(() => {
    return [...rows].sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [rows]);
  const total = useMemo(() => {
    const sum = filasOrdenadas.reduce(
      (acc, it) => acc + (Number.isFinite(it.monto) ? it.monto : 0),
      0
    );
    return Math.round(sum * 100) / 100;
  }, [filasOrdenadas]);
  return (
    <section className={`tabla-ind ${className}`}>
      <h3 className="tabla-ind__title">{titulo}</h3>

      <div className="tabla-ind__scroller">
        <table className="tabla-ind__table">
          <thead className="tabla-ind__thead">
            <tr>
              <th className="tabla-ind__th tabla-ind__th--idx">N°</th>
              <th className="tabla-ind__th tabla-ind__th--fecha">Fecha</th>
              <th className="tabla-ind__th tabla-ind__th--desc">Descripción</th>
              <th className="tabla-ind__th tabla-ind__th--right">Monto</th>
            </tr>
          </thead>
          <tbody className="tabla-ind__tbody">
            {filasOrdenadas.length === 0 ? (
              <tr>
                <td className="tabla-ind__empty" colSpan={4}>
                  Sin datos
                </td>
              </tr>
            ) : (
              filasOrdenadas.map((g, idx) => (
                <tr key={g.id ?? `row-${idx}`} className="tabla-ind__tr">
                  <td className="tabla-ind__td tabla-ind__td--idx">
                    {idx + 1}
                  </td>
                  <td className="tabla-ind__td tabla-ind__td--fecha">
                    {formatFechaCorta(g.fecha)}
                  </td>
                  <td
                    className="tabla-ind__td tabla-ind__td--desc"
                    title={prettyDescripcion(g.descripcion)}
                  >
                    {prettyDescripcion(g.descripcion)}
                  </td>
                  <td className="tabla-ind__td tabla-ind__td--right">
                    <NumericFormat
                      value={g.monto}
                      displayType="text"
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="$  "
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </td>
                </tr>
              ))
            )}
            <tr className="tabla-ind__tr-total">
              <td className="tabla-ind__td-total-label" colSpan={3}>
                {labelTotal ?? "Total"}
              </td>
              <td className="tabla-ind__td-total tabla-ind__td--right">
                <NumericFormat
                  value={total}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$  "
                  decimalScale={2}
                  fixedDecimalScale
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TablaIndividual;
