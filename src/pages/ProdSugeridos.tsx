// cspell: ignore categoria firestore Almacen Limpieza Cuidado Carniceria Condimentos Notiflix notiflix prod sug proditem proditemnombre proditemseleccionado proditemsugeridos proditemsugeridosspan proditemsugeridosspanlinethrough agregarproducto nuevocategoria nuevonombre prodsugeridos marcarproductos Reintentá Sacalo manualmente

import { useState, useEffect } from "react";
import productosData from "../helpers/prodSug.json";
import "../styles/ProdSugeridos.css";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../helpers/firebase";
import { toast } from "react-toastify";
import Notiflix from "notiflix";

export interface ProductoSugerido {
  nombre: string;
  categoria: string;
}

interface ProductoMarcado extends ProductoSugerido {
  seleccionado: boolean;
}

const ordenDeseado = [
  "Almacen",
  "Limpieza",
  "Cuidado Personal",
  "Carniceria",
  "Condimentos",
];

const ProdSugeridos = () => {
  const [productos, setProductos] = useState<ProductoMarcado[]>(
    productosData.map((p) => ({ ...p, seleccionado: false }))
  );

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState(ordenDeseado[0]);

  useEffect(() => {
    const cargarSeleccionados = async () => {
      Notiflix.Loading.circle("Cargando productos marcados...");
      try {
        const snapshot = await getDocs(collection(db, "sugeridos"));
        const productosSeleccionados: Record<string, boolean> = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data?.nombre && data.seleccionado) {
            productosSeleccionados[data.nombre] = true;
          }
        });

        // Combinamos con productosData
        const productosCombinados: ProductoMarcado[] = productosData.map(
          (p) => ({
            ...p,
            seleccionado: !!productosSeleccionados[p.nombre],
          })
        );

        setProductos(productosCombinados);
      } catch (error) {
        toast.error("Error al cargar productos seleccionados");
        console.error("Error al cargar productos:", error);
      } finally {
        Notiflix.Loading.remove();
      }
    };

    cargarSeleccionados();
  }, []);

  const agregarProducto = async () => {
    const nombreTrimmed = nuevoNombre.trim();

    if (!nombreTrimmed) {
      toast.warn("El nombre está vacío. No se agrega.");
      return;
    }

    const yaExiste = productos.some(
      (p) => p.nombre.toLowerCase() === nombreTrimmed.toLowerCase()
    );

    if (yaExiste) {
      toast.error("Ese producto ya está en la lista");
      return;
    }
    Notiflix.Loading.circle("Agregando producto...");
    try {
      await setDoc(doc(db, "sugeridos", nombreTrimmed), {
        nombre: nombreTrimmed,
        categoria: nuevaCategoria,
        seleccionado: true,
      });

      toast.success(`"${nombreTrimmed}" guardado en Firebase`);
      setNuevoNombre("");
      setNuevaCategoria(ordenDeseado[0]);
    } catch (error) {
      toast.error("Error al guardar el producto");
      console.error("Error al agregar producto:", error);
    } finally {
      Notiflix.Loading.remove();
    }
  };

  const productosPorCategoria = productos.reduce((acc, prod) => {
    if (!acc[prod.categoria]) acc[prod.categoria] = [];
    acc[prod.categoria].push(prod);
    return acc;
  }, {} as Record<string, ProductoMarcado[]>);

  const toggleProducto = async (
    nombre: string,
    categoria: string,
    checked: boolean
  ) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.nombre === nombre ? { ...p, seleccionado: checked } : p
      )
    );

    const ref = doc(db, "sugeridos", nombre);

    try {
      if (checked) {
        await setDoc(
          ref,
          {
            nombre,
            categoria,
            seleccionado: true,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        toast.success(`"${nombre}" marcado y guardado`);
      } else {
        toast.info(
          "Este listado no permite destildar. Hacelo desde la otra pantalla."
        );
      }
    } catch (err) {
      setProductos((prev) =>
        prev.map((p) =>
          p.nombre === nombre ? { ...p, seleccionado: !checked } : p
        )
      );
      console.error("Error sincronizando Firestore:", err);
      toast.error("No se pudo sincronizar el producto. Reintentá.");
    }
  };

  return (
    <div>
      <div className="agregar-producto">
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Nombre del producto"
        />
        <select
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
        >
          {ordenDeseado.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button onClick={agregarProducto}>Agregar</button>
      </div>
      <hr />
      <br />
      {/* <div className="MarcarProductos">
        <button onClick={guardarSeleccionados}>Marcar productos</button>
      </div> */}
      {/* Listado de productos por categoría */}
      <div className="prod-sugeridos">
        {ordenDeseado.map((categoria) => {
          const items = productosPorCategoria[categoria];
          if (!items) return null;
          return (
            <div key={categoria}>
              <h2>{categoria}</h2>
              <ul>
                {items.map((prod) => (
                  <label key={prod.nombre} className="prod-item">
                    <input
                      type="checkbox"
                      checked={prod.seleccionado}
                      disabled={prod.seleccionado}
                      onChange={(e) =>
                        toggleProducto(
                          prod.nombre,
                          prod.categoria,
                          e.target.checked
                        )
                      }
                    />
                    <span
                      style={{
                        textDecoration: prod.seleccionado
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {prod.nombre}
                    </span>
                  </label>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProdSugeridos;
