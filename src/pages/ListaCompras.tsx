// cspell: ignore categoria firestore
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../helpers/firebase";
import "../styles/ListaCompras.css";
import { toast } from "react-toastify";

interface Producto {
  nombre: string;
  categoria: string;
  seleccionado: boolean;
}

const ListaCompras = () => {
  const [seleccionados, setSeleccionados] = useState<Producto[]>([]);
  const [cuentaRegresiva, setCuentaRegresiva] = useState<number | null>(null);

  useEffect(() => {
    if (cuentaRegresiva === null) return;
    if (cuentaRegresiva === 0) {
      setTimeout(() => setCuentaRegresiva(null), 1000);
      return;
    }

    const timer = setTimeout(() => {
      setCuentaRegresiva((prev) => (prev ?? 0) - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cuentaRegresiva]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sugeridos"), (snapshot) => {
      const productos: Producto[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.seleccionado) {
          productos.push(data as Producto);
        }
      });
      setSeleccionados(productos);
      setCuentaRegresiva(30);
    });

    return () => unsub(); // Limpieza al desmontar
  }, []);

 const borrarProducto = async (nombre: string) => {
   // Optimismo: lo sacamos del estado primero
   setSeleccionados((prev) => prev.filter((p) => p.nombre !== nombre));

   try {
     await deleteDoc(doc(db, "sugeridos", nombre));
     toast.success(`"${nombre}" eliminado de la lista`);
   } catch (error) {
     toast.error("No se pudo eliminar el producto");
     console.error("Error al borrar producto:", error);
     // Revertir si falló
     setSeleccionados((prev) => [...prev, { nombre, seleccionado: true }]); // opcional
   }
 };

  const productosPorCategoria = seleccionados.reduce((acc, prod) => {
    if (!acc[prod.categoria]) acc[prod.categoria] = [];
    acc[prod.categoria].push(prod);
    return acc;
  }, {} as Record<string, Producto[]>);

  const ordenDeseado = [
    "Almacen",
    "Limpieza",
    "Cuidado Personal",
    "Carniceria",
    "Condimentos",
  ];

  return (
    <div className="lista-compras">
      {cuentaRegresiva !== null && (
        <div className="contador">
          <h3>{cuentaRegresiva === 0 ? "¡Listo!" : cuentaRegresiva}</h3>
        </div>
      )}
      <h1>Lista de Compras</h1>
      {ordenDeseado.map((categoria) => {
        const items = productosPorCategoria[categoria];
        if (!items) return null;
        return (
          <div key={categoria}>
            <h2>{categoria}</h2>
            <ul>
              {items.map((prod) => (
                <li
                  key={prod.nombre}
                  onClick={() => borrarProducto(prod.nombre)}
                >
                  {prod.nombre}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default ListaCompras;
