// cspell: ignore categoria firestore Almacen Limpieza Cuidado Carniceria Condimentos

import { useState, useEffect } from "react";
import productosData from "../helpers/prodSug.json";
import "../styles/ProdSugeridos.css";
import { collection, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../helpers/firebase";
import { toast } from "react-toastify";

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
  const [cuentaRegresiva, setCuentaRegresiva] = useState<number | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState(ordenDeseado[0]);

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

  const agregarProducto = async () => {
    const nombreTrimmed = nuevoNombre.trim();

    if (!nombreTrimmed) {
      toast.warn("El nombre está vacío. No se agrega.");
      return;
    }

    if (
      productos.some(
        (p) => p.nombre.toLowerCase() === nombreTrimmed.toLowerCase()
      )
    ) {
      toast.error("Ese producto ya está en la lista");
      return;
    }

    const nuevo = {
      nombre: nombreTrimmed,
      categoria: nuevaCategoria,
      seleccionado: true,
    };

    try {
      await setDoc(doc(db, "sugeridos", nuevo.nombre), nuevo);

      setProductos((prev) => [...prev, nuevo]);
      setNuevoNombre("");
      setNuevaCategoria(ordenDeseado[0]);
      toast.success("Producto agregado correctamente");
    } catch (error) {
      toast.error("Error al agregar producto");
      console.error("Error al agregar producto:", error);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sugeridos"), (snapshot) => {
      const seleccionadosMap = new Map<string, boolean>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data && typeof data.seleccionado === "boolean") {
          seleccionadosMap.set(data.nombre, data.seleccionado);
        }
      });

      setProductos(
        productosData.map((p) => ({
          ...p,
          seleccionado: seleccionadosMap.get(p.nombre) || false,
        }))
      );
      setCuentaRegresiva(30);
    });

    return () => unsub();
  }, []);

  const productosPorCategoria = productos.reduce((acc, prod) => {
    if (!acc[prod.categoria]) acc[prod.categoria] = [];
    acc[prod.categoria].push(prod);
    return acc;
  }, {} as Record<string, ProductoMarcado[]>);

const toggleSeleccionado = async (nombre: string) => {
  let nuevoEstado = false;

  setProductos((prev) => {
    const actualizados = prev.map((prod) => {
      if (prod.nombre === nombre) {
        nuevoEstado = !prod.seleccionado;
        return { ...prod, seleccionado: nuevoEstado };
      }
      return prod;
    });
    return actualizados;
  });

  try {
    await updateDoc(doc(db, "sugeridos", nombre), {
      seleccionado: nuevoEstado,
    });

    toast.info(`Producto ${nuevoEstado ? "Seleccionado" : "Desactivado"}`);
  } catch (error) {
    toast.error("No se pudo guardar el cambio");
    console.error("Error al guardar en Firebase:", error);
  }
};


  return (
    <div>
      {cuentaRegresiva !== null && (
        <div className="contador">
          <h3>{cuentaRegresiva === 0 ? "¡Listo!" : cuentaRegresiva}</h3>
        </div>
      )}
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
                      onChange={() => toggleSeleccionado(prod.nombre)}
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
