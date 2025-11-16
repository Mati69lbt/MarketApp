import type { GastoMensual } from "../../../types/GastosMensuales";

export default function calcularGastos(
  items: Pick<GastoMensual, "monto">[]
): number {
  const sum = items.reduce(
    (acc, it) => acc + (Number.isFinite(it.monto) ? it.monto : 0),
    0
  );
  return Math.round(sum * 100) / 100;
}
