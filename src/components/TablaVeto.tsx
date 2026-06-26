//cspell:ignore FilaGasto descripcion Seleccion
import { useMemo } from "react";
import { NumericFormat } from "react-number-format";
import "../styles/TablaVeto.css";

export interface FilaGasto {
  id?: string;
  fecha: string;
  descripcion: string;
  monto: number;
  pagado?: boolean;
}

interface TablaIndividualProps {
  titulo: string;
  rows: FilaGasto[];
  labelTotal?: string;
  showIndex?: boolean;
  className?: string;
  onEdit?: (row: FilaGasto) => void;
  onDelete?: (row: FilaGasto) => void;
  pagados?: Set<string>;
  seleccionados?: Set<string>;
  onTogglePagado?: (id: string) => void;
  onToggleSeleccion?: (id: string) => void;
}

const DIAS_ABR = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const formatFechaCorta = (iso: string) => {
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

const TablaVeto = ({
  titulo,
  rows,
  labelTotal,
  showIndex = true,
  className = "",
  onEdit,
  onDelete,
  pagados = new Set(),
  seleccionados = new Set(),
  onTogglePagado,
  onToggleSeleccion,
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
  return (
    <section className={`tabla-ind ${className}`}>
      <h3 className="tabla-ind__title">{titulo}</h3>

      <div className="tabla-ind__scroller">
        <table className="tabla-ind__table">
          <thead className="tabla-ind__thead">
            <tr>
              {showIndex && (
                <th className="tabla-ind__th tabla-ind__th--idx">N°</th>
              )}
              <th className="tabla-ind__th tabla-ind__th--fecha">Fecha</th>
              <th className="tabla-ind__th tabla-ind__th--check" title="Pagado">
                ✅
              </th>
              <th className="tabla-ind__th tabla-ind__th--desc">Descripción</th>
              <th className="tabla-ind__th tabla-ind__th--right">Monto</th>
              <th
                className="tabla-ind__th tabla-ind__th--check"
                title="Seleccionar"
              >
                ☑️
              </th>
            </tr>
          </thead>
          <tbody className="tabla-ind__tbody">
            {filasOrdenadas.length === 0 ? (
              <tr>
                <td className="tabla-ind__empty" colSpan={6}>
                  Sin datos
                </td>
              </tr>
            ) : (
              filasOrdenadas.map((g, idx) => {
                const id = g.id ?? `row-${idx}`;
                const esPagado = pagados.has(id);
                const esSel = seleccionados.has(id);
                return (
                  <tr
                    key={id}
                    className={`tabla-ind__tr${esPagado ? " tabla-ind__tr--pagado" : ""}`}
                  >
                    <td className="tabla-ind__td tabla-ind__td--idx">
                      {idx + 1}
                    </td>
                    <td className="tabla-ind__td tabla-ind__td--fecha">
                      {formatFechaCorta(g.fecha)}
                    </td>
                    {/* ── checkbox pagado ── */}
                    <td className="tabla-ind__td tabla-ind__td--check">
                      {onTogglePagado && (
                        <input
                          type="checkbox"
                          checked={esPagado}
                          onChange={() => onTogglePagado(id)}
                          title="Marcar como pagado"
                        />
                      )}
                    </td>
                    <td
                      className="tabla-ind__td tabla-ind__td--desc"
                      title={prettyDescripcion(g.descripcion)}
                    >
                      <div className="td-desc__wrap">
                        {onEdit && (
                          <button
                            type="button"
                            className="td-desc__btn td-desc__btn--edit"
                            aria-label="Editar"
                            onClick={() => onEdit(g)}
                            title="Editar Gasto"
                          >
                            ✏️
                          </button>
                        )}
                        <span className="td-desc__text">
                          {prettyDescripcion(g.descripcion)}
                        </span>
                        {onDelete && (
                          <button
                            type="button"
                            className="td-desc__btn td-desc__btn--del"
                            aria-label="Borrar"
                            onClick={() => onDelete(g)}
                            title="Borrar Gasto"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
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
                    {/* ── checkbox selección ── */}
                    <td className="tabla-ind__td tabla-ind__td--check">
                      {onToggleSeleccion && (
                        <input
                          type="checkbox"
                          checked={esSel}
                          onChange={() => onToggleSeleccion(id)}
                          title="Sumar este vencimiento"
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
            <tr className="tabla-ind__tr-total">
              <td className="tabla-ind__td-total-label" colSpan={4}>
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
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TablaVeto;
