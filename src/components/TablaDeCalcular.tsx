//cspell: ignore descripcion matias Matías mati pcts caro carolina amb anio dias
import React, { useMemo } from "react";
import { NumericFormat } from "react-number-format";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const mesesMap: Record<string, string> = {
  enero: "Enero",
  febrero: "Febrero",
  marzo: "Marzo",
  abril: "Abril",
  mayo: "Mayo",
  junio: "Junio",
  julio: "Julio",
  agosto: "Agosto",
  septiembre: "Septiembre",
  setiembre: "Septiembre",
  octubre: "Octubre",
  noviembre: "Noviembre",
  diciembre: "Diciembre",
  ene: "Enero",
  feb: "Febrero",
  mar: "Marzo",
  abr: "Abril",
  may: "Mayo",
  jun: "Junio",
  jul: "Julio",
  ago: "Agosto",
  sep: "Septiembre",
  oct: "Octubre",
  nov: "Noviembre",
  dic: "Diciembre",
};
const formatPeriodo = (s?: string) => {
  if (!s) return "";
  const t = s.replace(/\s*-\s*/g, "-");
  const [mesRaw, anioRaw] = t.split("-");
  const mes = (mesRaw ?? "").toLowerCase();
  const anio = (anioRaw ?? "").trim();
  const mesPretty =
    mesesMap[mes] ?? (mes ? mes[0].toUpperCase() + mes.slice(1) : "");
  return [mesPretty, anio].filter(Boolean).join(" ");
};

export interface FilaGasto {
  id?: string;
  fecha: string; // "YYYY-MM-DD"
  descripcion: string;
  monto: number;
}

type Props = {
  carolina: FilaGasto[];
  matias: FilaGasto[];
  periodLabel?: string; // ej: "noviembre-2025" (opcional)
  className?: string;
};

const money2 = (n: number) => Math.round(n * 100) / 100;

const TablaDeCalcular: React.FC<Props> = ({
  carolina,
  matias,
  periodLabel,
  className = "",
}) => {
  // Totales
  const totalC = useMemo(
    () =>
      money2(
        carolina.reduce(
          (a, it) => a + (Number.isFinite(it.monto) ? it.monto : 0),
          0
        )
      ),
    [carolina]
  );
  const totalM = useMemo(
    () =>
      money2(
        matias.reduce(
          (a, it) => a + (Number.isFinite(it.monto) ? it.monto : 0),
          0
        )
      ),
    [matias]
  );

  const subtotal = money2(totalC + totalM);
  const mitad = money2(subtotal / 2);

  const difMatias = money2(totalM - mitad); // >0 pagó de más / <0 debe
  const difCarolina = money2(totalC - mitad); // >0 pagó de más / <0 debe

  // Porcentajes
  const pC = subtotal > 0 ? Math.round((totalC / subtotal) * 100) : 0;
  const pM = subtotal > 0 ? 100 - pC : 0;

  const diasDelMes = useMemo(() => {
    const norm = (periodLabel ?? "")
      .toLowerCase()
      .replace(/\s*-\s*/g, " ")
      .trim(); // "enero 2024"
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "setiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    let d = 30;
    if (norm) {
      const [mRaw, yRaw] = norm.split(/\s+/);
      let m = meses.indexOf(mRaw);
      if (mRaw === "setiembre") m = 8;
      const y = Number(yRaw);
      if (m >= 0 && Number.isFinite(y)) d = new Date(y, m + 1, 0).getDate();
    } else {
      const f = carolina?.[0]?.fecha || matias?.[0]?.fecha || "";
      const [y, m] = f.split("-").map(Number);
      if (y && m) d = new Date(y, m, 0).getDate();
    }
    return d;
  }, [periodLabel, carolina, matias]);

  // Promedios diarios ($/día)
  const promDiarioTotal = useMemo(
    () => Math.round((subtotal / diasDelMes) * 100) / 100,
    [subtotal, diasDelMes]
  );
  const promDiarioC = useMemo(
    () => Math.round((totalC / diasDelMes) * 100) / 100,
    [totalC, diasDelMes]
  );
  const promDiarioM = useMemo(
    () => Math.round((totalM / diasDelMes) * 100) / 100,
    [totalM, diasDelMes]
  );

  // Para las barras de dinero, normalizamos contra el mayor de los tres
  const maxProm = Math.max(promDiarioTotal, promDiarioC, promDiarioM, 1);
  const wTotal = (promDiarioTotal / maxProm) * 100;
  const wC = (promDiarioC / maxProm) * 100;
  const wM = (promDiarioM / maxProm) * 100;

  return (
    <div className="cards-in-file">
      <div className="calc-card">
        <table className="calc-table">
          <thead>
            <tr>
              <th className="calc-th calc-th--label">Concepto</th>
              <th className="calc-th calc-th--monto">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="calc-td calc-td--label">
                <strong>Total Gastos Entre Los Dos</strong>
              </td>
              <td className="calc-td calc-td--monto">
                <NumericFormat
                  value={subtotal}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$ "
                  decimalScale={2}
                  fixedDecimalScale
                />
              </td>
            </tr>
            <tr>
              <td className="calc-td calc-td--label">Costo Para Cada Uno</td>
              <td className="calc-td calc-td--monto">
                <NumericFormat
                  value={mitad}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$ "
                  decimalScale={2}
                  fixedDecimalScale
                />
              </td>
            </tr>
            <tr>
              <td className="calc-td calc-td--label">Diferencia Matías</td>
              <td
                className={`calc-td calc-td--monto ${
                  difMatias < 0 ? "neg" : difMatias > 0 ? "pos" : ""
                }`}
              >
                <NumericFormat
                  value={difMatias}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$ "
                  decimalScale={2}
                  fixedDecimalScale
                />
              </td>
            </tr>
            <tr>
              <td className="calc-td calc-td--label">Diferencia Carolina</td>
              <td
                className={`calc-td calc-td--monto ${
                  difCarolina < 0 ? "neg" : difCarolina > 0 ? "pos" : ""
                }`}
              >
                <NumericFormat
                  value={difCarolina}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$ "
                  decimalScale={2}
                  fixedDecimalScale
                />
              </td>
            </tr>        
          </tbody>
        </table>
      </div>

      <div className="calc-side">
        {periodLabel && (
          <div className="calc-period">{formatPeriodo(periodLabel)}</div>
        )}

        <div className="calc-side-row">
          <div className="bars">
            <div className="bar">
              <div className="bar-head">
                <span className="bar-name">
                  <span className="badge badge--caro"></span> Carolina
                </span>
                <span className="bar-value">{pC}%</span>
              </div>
              <div className="bar-bg">
                <div
                  className="bar-fill bar-fill--caro"
                  style={{ width: `${pC}%` }}
                />
              </div>
            </div>

            <div className="bar">
              <div className="bar-head">
                <span className="bar-name">
                  <span className="badge badge--mati"></span> Matías
                </span>
                <span className="bar-value">{pM}%</span>
              </div>
              <div className="bar-bg">
                <div
                  className="bar-fill bar-fill--mati"
                  style={{ width: `${pM}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bars-amount">
        <div className="bars-title">Promedio diario ($/día)</div>

        <div className="bar">
          <div className="bar-head">
            <span className="bar-name">
              <span className="badge badge--amb"></span> Entre los dos
            </span>
            <span className="bar-value">
              <NumericFormat
                value={promDiarioTotal}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$ "
                decimalScale={2}
                fixedDecimalScale
              />
            </span>
          </div>
          <div className="bar-bg bar-bg--amount">
            <div
              className="bar-fill bar-fill--amb"
              style={{ width: `${wTotal}%` }}
            />
          </div>
        </div>

        <div className="bar">
          <div className="bar-head">
            <span className="bar-name">
              <span className="badge badge--caro"></span> Carolina
            </span>
            <span className="bar-value">
              <NumericFormat
                value={promDiarioC}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$ "
                decimalScale={2}
                fixedDecimalScale
              />
            </span>
          </div>
          <div className="bar-bg bar-bg--amount">
            <div
              className="bar-fill bar-fill--caro"
              style={{ width: `${wC}%` }}
            />
          </div>
        </div>

        <div className="bar">
          <div className="bar-head">
            <span className="bar-name">
              <span className="badge badge--mati"></span> Matías
            </span>
            <span className="bar-value">
              <NumericFormat
                value={promDiarioM}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$ "
                decimalScale={2}
                fixedDecimalScale
              />
            </span>
          </div>
          <div className="bar-bg bar-bg--amount">
            <div
              className="bar-fill bar-fill--mati"
              style={{ width: `${wM}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablaDeCalcular;
