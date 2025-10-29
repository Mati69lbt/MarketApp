// cspell: ignore categoria firestore Notiflix Almacen Carniceria categorias notiflix
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

  const borrarTodosMarcados = () => {
    if (seleccionados.length === 0) {
      toast.info("No hay productos marcados para borrar");
      return;
    }

    Notiflix.Confirm.show(
      "¿Borrar todos?",
      `Se eliminarán ${seleccionados.length} productos marcados. ¿Continuar?`,
      "Borrar",
      "Cancelar",
      async () => {
        Notiflix.Loading.circle("Eliminando marcados...");

        try {
          const nombres = seleccionados.map((p) => p.nombre);

          // Borra cada documento directamente (sin batch)
          await Promise.all(
            nombres.map((nombre) => deleteDoc(doc(db, "sugeridos", nombre)))
          );

          setSeleccionados([]);
          toast.success("Se borraron todos los artículos marcados");
        } catch (error) {
          console.error("Error al borrar todos:", error);
          toast.error("No se pudieron borrar todos los artículos");
          // Recupero listado por si quedó inconsistente
          await obtenerProductos();
        } finally {
          Notiflix.Loading.remove();
        }
      },
      () => {
        // Cancelado: no hacemos nada
      },
      {
        titleColor: "#d32f2f",
        okButtonBackground: "#d32f2f",
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
      <button
        className="borrar-todos"
        onClick={borrarTodosMarcados}
        disabled={seleccionados.length === 0 || false}
        title={
          seleccionados.length === 0
            ? "No hay productos marcados"
            : "Borrar todos los marcados"
        }
      >
        Borrar marcados
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
