//cspell: ignore vencimientos historico Histo
import { useState } from "react";
import VetoHisto from "../components/VetoHisto";

import "../styles/Vencimientos.css";
import VetosMensuales from "./VetosMensuales";

const Vencimientos = () => {
  const [view, setView] = useState("mesActual");
  return (
    <div className="vencimientos-contenedor">
      <div className="vencimientos-nav">
        <button
          className={view === "mesActual" ? "activo" : ""}
          onClick={() => setView("mesActual")}
        >
          Mensual
        </button>
        <button
          className={view === "historico" ? "activo" : ""}
          onClick={() => setView("historico")}
        >
          Histórico
        </button>
      </div>
      {view === "mesActual" ? (
        <div className="vencimientos-seccion">      
          <VetosMensuales />
        </div>
      ) : (
        <div className="vencimientos-seccion">
          <h2>Vencimientos Históricos</h2>
          <VetoHisto />
        </div>
      )}
    </div>
  );
};

export default Vencimientos;
