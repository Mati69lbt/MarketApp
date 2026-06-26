//cspell: ignore vencimientos historico Histo
import { useState } from "react";
import VetoHisto from "../components/VetoHisto";

import "../styles/Vencimientos.css";
import VetosMensuales from "./VetosMensuales";

const Vencimientos = () => {
  const [view, setView] = useState("mesActual");
  return (
    <div className="vencimientos-contenedor">
      {view === "mesActual" ? (
        <div className="vencimientos-seccion">
          <VetosMensuales setView={setView} />
        </div>
      ) : (
        <div className="vencimientos-seccion">
          <VetoHisto setView={setView} />
        </div>
      )}
    </div>
  );
};

export default Vencimientos;
