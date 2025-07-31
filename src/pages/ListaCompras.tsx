// cspell: ignore categoria firestore
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../helpers/firebase";
import "../styles/ListaCompras.css";
import { toast } from "react-toastify";
import Notiflix from "notiflix";

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

  const obtenerProductos = async () => {
    Notiflix.Loading.circle("Procesando...");
    try {
      const snapshot = await getDocs(collection(db, "sugeridos"));
      const productos: Producto[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data &&
          data.seleccionado === true &&
          typeof data.nombre === "string" &&
          typeof data.categoria === "string"
        ) {
          productos.push(data as Producto);
        }
      });

      setSeleccionados(productos);
    } catch (error) {
      toast.error("Error al cargar productos");
      console.error("Error al obtener productos:", error);
    } finally {
      Notiflix.Loading.remove();
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const borrarProducto = async (nombre: string) => {
    Notiflix.Confirm.show(
      "¿Confirmar compra?",
      `¿Ya compraste "${nombre}"?`,
      "Sí",
      "Cancelar",
      async function okCb() {
        Notiflix.Loading.circle("Procesando...");
        try {
          await deleteDoc(doc(db, "sugeridos", nombre));
          setSeleccionados((prev) => prev.filter((p) => p.nombre !== nombre));
          toast.success(`"${nombre}" eliminado de la lista`);
        } catch (error) {
          toast.error("No se pudo eliminar el producto");
          console.error("Error al borrar producto:", error);
        } finally {
          Notiflix.Loading.remove();
        }
      },
      function cancelCb() {
        // Cancelado, no hacer nada
      },
      {
        titleColor: "#333",
        okButtonBackground: "#4caf50",
        cancelButtonBackground: "#ccc",
      }
    );
  };

  const productosPorCategoria = seleccionados.reduce((acc, prod) => {
    if (!acc[prod.categoria]) acc[prod.categoria] = [];
    acc[prod.categoria].push(prod);
    return acc;
  }, {} as Record<string, Producto[]>);

  return (
    <div className="lista-compras">
      <h1>Lista de Compras</h1>
      <button className="actualizar" onClick={obtenerProductos}>
        Actualizar Lista
      </button>
      {seleccionados.length === 0 ? (
        <span className="sin-productos">No hay productos seleccionados</span>
      ) : (
        <div className="categorias-grid">
          {ordenDeseado.map((categoria) => {
            const items = productosPorCategoria[categoria];
            if (!items) return null;
            return (
              <div className="categoria" key={categoria}>
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
      )}
    </div>
  );
};

export default ListaCompras;
