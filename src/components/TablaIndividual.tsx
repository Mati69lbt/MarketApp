//cspell:ignore FilaGasto descripcion
import React, { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import Swal from "sweetalert2";
import MedioPagoLogo from "./MedioPagoLogo";
import { getLogoMedioPago } from "../helpers/g-m/mediosPagoLogos";
import { formatearMoneda } from "../helpers";
import "../styles/TablaIndividual.css";

export interface FilaGasto {
  id?: string; // opcional: si no viene, usamos el índice
  fecha: string; // "YYYY-MM-DD"
  descripcion: string;
  monto: number; // valor crudo, no string
  medioPago?: string;
}

interface TablaIndividualProps {
  titulo: string;
  rows: FilaGasto[];
  labelTotal?: string;
  showIndex?: boolean;
  className?: string;
  onEdit?: (row: FilaGasto) => void;
  onDelete?: (row: FilaGasto) => void;
}

const DIAS_ABR = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const formatFechaCorta = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dia = String(d ?? 1).padStart(2, "0");
  const diaSemana = DIAS_ABR[new Date(y, m - 1, d).getDay()] ?? "";
  return `${dia} ${diaSemana}`;
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
  onEdit,
  onDelete,
}: TablaIndividualProps) => {
  const filasOrdenadas = useMemo(() => {
    return [...rows].sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [rows]);
  const total = useMemo(() => {
    const sum = filasOrdenadas.reduce(
      (acc, it) => acc + (Number.isFinite(it.monto) ? it.monto : 0),
      0,
    );
    return Math.round(sum * 100) / 100;
  }, [filasOrdenadas]);

  // En mobile, Nº y Fecha quedan en display:none (ver CSS), así que la fila
  // de Total debe spanear menos columnas o el header queda corrido/roto.
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 600px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const colsBase = isMobile ? 3 : (showIndex ? 1 : 0) + 4; // [idx] + fecha + desc + pago + monto
  const colsSinMonto = colsBase - 1;

  /** Mobile (<=600px): no hay lápiz/tacho visibles; tocar la fila abre el
   * elegidor Editar/Borrar. En escritorio no hace nada (ahí se usan los
   * botones de siempre). */
  const handleRowClick = async (g: FilaGasto) => {
    if (!onEdit && !onDelete) return;
    if (!window.matchMedia("(max-width: 600px)").matches) return;

    const result = await Swal.fire({
      title: prettyDescripcion(g.descripcion),
      text: `${formatFechaCorta(g.fecha)} · ${formatearMoneda(g.monto)}`,
      icon: "question",
      showDenyButton: !!onDelete,
      showConfirmButton: !!onEdit,
      showCancelButton: true,
      confirmButtonText: "Editar",
      denyButtonText: "Borrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      denyButtonColor: "#dc2626",
      cancelButtonColor: "#9ca3af",
    });

    if (result.isConfirmed) onEdit?.(g);
    else if (result.isDenied) onDelete?.(g);
  };

  return (
    <section className={`gm-tabla ${className}`}>
      <h3 className="gm-tabla__title">{titulo}</h3>

      <div className="gm-tabla__scroller">
        <table className="gm-tabla__table">
          <thead className="gm-tabla__thead">
            <tr>
              {showIndex && (
                <th className="gm-tabla__th gm-tabla__th--idx">N°</th>
              )}
              <th className="gm-tabla__th gm-tabla__th--fecha">Fecha</th>
              <th className="gm-tabla__th gm-tabla__th--desc">Descripción</th>
              <th className="gm-tabla__th gm-tabla__th--pago">Pago</th>
              <th className="gm-tabla__th gm-tabla__th--right">Monto</th>
            </tr>
          </thead>
          <tbody className="gm-tabla__tbody">
            {filasOrdenadas.length === 0 ? (
              <tr>
                <td className="gm-tabla__empty" colSpan={colsBase}>
                  Sin datos
                </td>
              </tr>
            ) : (
              filasOrdenadas.map((g, idx) => (
                <tr
                  key={g.id ?? `row-${idx}`}
                  className="gm-tabla__tr gm-tabla__tr--clickable"
                  onClick={() => handleRowClick(g)}
                >
                  <td className="gm-tabla__td gm-tabla__td--idx">
                    {idx + 1}
                  </td>
                  <td className="gm-tabla__td gm-tabla__td--fecha">
                    {formatFechaCorta(g.fecha)}
                  </td>
                  <td
                    className="gm-tabla__td gm-tabla__td--desc"
                    title={prettyDescripcion(g.descripcion)}
                  >
                    {/* acciones + texto */}
                    <div className="gm-desc__wrap">
                      {onEdit && (
                        <button
                          type="button"
                          className="gm-desc__btn gm-desc__btn--edit"
                          aria-label="Editar"
                          onClick={() => onEdit(g)}
                          title="Editar Gasto"
                        >
                          ✏️
                        </button>
                      )}
                      <span className="gm-desc__col">
                        <span className="gm-desc__text">
                          <span className="gm-desc__idx-mobile">
                            {idx + 1}.{" "}
                          </span>
                          {prettyDescripcion(g.descripcion)}
                        </span>
                        <span className="gm-desc__fecha-mobile">
                          {formatFechaCorta(g.fecha)}
                        </span>
                      </span>
                      {onDelete && (
                        <button
                          type="button"
                          className="gm-desc__btn gm-desc__btn--del"
                          aria-label="Borrar"
                          onClick={() => onDelete(g)}
                          title="Borrar Gasto"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="gm-tabla__td gm-tabla__td--pago">
                    {g.medioPago ? (
                      <span
                        className="td-pago__wrap"
                        title={g.medioPago}
                        aria-label={g.medioPago}
                      >
                        <MedioPagoLogo nombre={g.medioPago} size={30} />
                        {!getLogoMedioPago(g.medioPago) && (
                          <span className="td-pago__text">{g.medioPago}</span>
                        )}
                      </span>
                    ) : (
                      <span className="td-pago__empty">—</span>
                    )}
                  </td>
                  <td className="gm-tabla__td gm-tabla__td--right">
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
            <tr className="gm-tabla__tr-total">
              <td className="gm-tabla__td-total-label" colSpan={colsSinMonto}>
                {labelTotal ?? "Total"}
              </td>
              <td className="gm-tabla__td-total gm-tabla__td--right">
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
