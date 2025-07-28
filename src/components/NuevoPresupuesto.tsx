import {
  useState,
  type Dispatch,
  type SetStateAction,
  type FormEvent,
  type ChangeEvent,
} from "react";
import type { Gasto } from '../types/Gasto';
import Mensaje from "./Mensaje";


interface Props {
  presupuesto: number;
  setPresupuesto: Dispatch<SetStateAction<number>>;
  setIsValidPresupuesto: Dispatch<SetStateAction<boolean>>;
  setGastos: Dispatch<SetStateAction<Gasto[]>>;
}


const NuevoPresupuesto = ({
  presupuesto,
  setPresupuesto,
  setIsValidPresupuesto,
  setGastos,
}: Props) => {
  const [mensaje, setMensaje] = useState<string>("");

   const handlePresupuesto = (e: FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     if (!presupuesto || presupuesto < 0) {
       setMensaje("Presupuesto Inválido!!!");
       return;
     }
     setMensaje("");
     setIsValidPresupuesto(true);
   };

   const handleCheckboxChange = (valor: number) => {
     if (presupuesto === valor) {
       setPresupuesto(0);
     } else {
       setPresupuesto(valor);
     }
   };

   const handleImportarGastos = (e: ChangeEvent<HTMLInputElement>) => {
     const archivo = e.target.files?.[0];
     if (!archivo) return;

     const lector = new FileReader();
     lector.onload = (event: ProgressEvent<FileReader>) => {
       try {
         const texto = event.target?.result;
         if (typeof texto !== "string") throw new Error("Archivo inválido");

         const datos: Gasto[] = JSON.parse(texto);
         if (!Array.isArray(datos)) throw new Error("Formato inválido");

         const totalImportado = datos.reduce(
           (acc, gasto) => acc + (gasto.subTotal || 0),
           0
         );
         const presupuestoCalculado = totalImportado + 50000;

         setGastos(datos);
         setPresupuesto(presupuestoCalculado);
         setIsValidPresupuesto(true);

         alert("Gastos importados correctamente");
       } catch (error: any) {
         alert("Error al importar el archivo: " + error.message);
       }
     };

     lector.readAsText(archivo);
   };




   return (
     <div className="contenedor-presupuesto contenedor sombra">
       <form onSubmit={handlePresupuesto} className="formulario">
         <div className="campo">
           <label>Definir Presupuesto</label>
           <div className="checkbox-grid">
             {[...Array(9)].map((_, index) => {
               const valor = 20000 + index * 10000;
               return (
                 <label key={valor} className="checkbox-item pretty">
                   <input
                     type="checkbox"
                     checked={presupuesto === valor}
                     onChange={() => handleCheckboxChange(valor)}
                   />
                   <span>
                     {valor.toLocaleString("es-AR", {
                       style: "currency",
                       currency: "ARS",
                     })}
                   </span>
                 </label>
               );
             })}
           </div>

           <div style={{ marginTop: "1rem" }}>
             <label htmlFor="importar-json" className="label-importar-json">
               📂 Importar JSON de Gastos
             </label>
             <input
               id="importar-json"
               type="file"
               accept=".json"
               onChange={handleImportarGastos}
             />
           </div>
         </div>

         <input type="submit" value="Añadir" />
         {mensaje && <Mensaje tipo="error">{mensaje}</Mensaje>}
       </form>
     </div>
   );
};

export default NuevoPresupuesto