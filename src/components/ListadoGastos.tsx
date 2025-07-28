import type { Dispatch, SetStateAction } from "react";
import type { Gasto as GastoType } from "../types/Gasto";
import "../styles/ListadoGastos.css";
import Pago from "./Pago";

interface Props {
  gastos: GastoType[];
  setGastoEditar: Dispatch<SetStateAction<GastoType | null>>;
  eliminarGasto: (id: string) => void;
}

const ListadoGastos = ({ gastos, setGastoEditar, eliminarGasto }: Props) => {
  const ordenarGastos = (gastos: GastoType[]) => {
    return [...gastos].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
    );
  };
  const gastosOrdenados: GastoType[] = ordenarGastos(gastos);

  return (
    <div className="listado-gastos contenedor">
      <h2>{gastosOrdenados.length ? "Gastos" : "No Hay Gastos, No Hay"}</h2>
      {gastosOrdenados.map((gasto) => (
        <Pago
          key={gasto.id}
          gasto={gasto}
          setGastoEditar={setGastoEditar}
          eliminarGasto={eliminarGasto}
        />
      ))}
    </div>
  );
};
export default ListadoGastos;
