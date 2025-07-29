// cspell: ignore categoria firestore
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../helpers/firebase";
import "../styles/ListaCompras.css";
import { toast } from "react-toastify";

interface Producto {
  nombre: string;
  categoria: string;
  seleccionado: boolean;
}

const ordenDeseado = [
  "Almacen",
  "Limpieza",
  "Cuidado Personal",
  "Carniceria",
  "Condimentos",
];

const ListaCompras = () => {
  const [seleccionados, setSeleccionados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const obtenerProductos = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "sugeridos"));
      const productos: Producto[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Documento leído:", data);
        if (
          data &&
          data.seleccionado === true &&
          typeof data.nombre === "string" &&
          typeof data.categoria === "string"
        ) {
          productos.push(data as Producto);
        }
      });
      console.log("Productos filtrados:", productos);
      setSeleccionados(productos);
    } catch (error) {
      toast.error("Error al cargar productos");
      console.error("Error al obtener productos:", error);
    } finally {
      console.log("se activo el finally");

      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const borrarProducto = async (nombre: string) => {
    const confirmar = window.confirm(`¿Ya compraste "${nombre}"?`);
    if (!confirmar) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, "sugeridos", nombre));
      setSeleccionados((prev) => prev.filter((p) => p.nombre !== nombre));
      toast.success(`"${nombre}" eliminado de la lista`);
    } catch (error) {
      toast.error("No se pudo eliminar el producto");
      console.error("Error al borrar producto:", error);
    } finally {
      setLoading(false);
    }
  };

  const productosPorCategoria = seleccionados.reduce((acc, prod) => {
    if (!acc[prod.categoria]) acc[prod.categoria] = [];
    acc[prod.categoria].push(prod);
    return acc;
  }, {} as Record<string, Producto[]>);

  return (
    <div className="lista-compras">
      {loading ? (
        <div className="cargando">Cargando...</div>
      ) : (
        <>
          <h1>Lista de Compras</h1>
          {seleccionados.length === 0 ? (
            <span className="sin-productos">
              No hay productos seleccionados
            </span>
          ) : (
            ordenDeseado.map((categoria) => {
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
            })
          )}
        </>
      )}
    </div>
  );
};

export default ListaCompras;
