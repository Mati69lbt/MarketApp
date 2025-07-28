// cspell:ignore gastos exito
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  tipo: "error" | "exito" | string; 
}

const Mensaje = ({ children, tipo }: Props) => {
  return <div className={`alerta ${tipo}`}>{children}</div>;
};

export default Mensaje;
