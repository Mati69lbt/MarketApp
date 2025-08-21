import type { Dispatch, SetStateAction } from "react";
import type { Gasto } from "../types/Gasto";
import NuevoPresupuesto from "./NuevoPresupuesto";
import ControlPresupuesto from "./ControlPresupuesto";

interface HeaderProps {
  gastos: Gasto[];
  setGastos: Dispatch<SetStateAction<Gasto[]>>;
  presupuesto: number;
  setPresupuesto: Dispatch<SetStateAction<number>>;
  isValidPresupuesto: boolean;
  setIsValidPresupuesto: Dispatch<SetStateAction<boolean>>;
}

const Header = ({
  gastos,
  setGastos,
  presupuesto,
  setPresupuesto,
  isValidPresupuesto,
  setIsValidPresupuesto,
}: HeaderProps) => {
  return (
    <header>
      <h1>Planificador de Gastos</h1>
      {isValidPresupuesto ? (
        <ControlPresupuesto
          presupuesto={presupuesto}
          gastos={gastos}
          setGastos={setGastos}
          setPresupuesto={setPresupuesto}
          setIsValidPresupuesto={setIsValidPresupuesto}
        />
      ) : (
        <NuevoPresupuesto
          presupuesto={presupuesto}
          setPresupuesto={setPresupuesto}
          setIsValidPresupuesto={setIsValidPresupuesto}
          setGastos={setGastos}
        />
      )}
    </header>
  );
};

export default Header;
