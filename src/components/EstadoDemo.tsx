//cspell: ignore comparacion Categorias Ubicacion categorias ubicacion
import { useState } from "react";

interface Producto {
  nombre: string;
  precio: number;
}

const EstadoDemo = () => {
  const [nombre, setNombre] = useState<string>("Leche")
  const [cantidad, setCantidad] = useState<number>(1)
  const [disponible, setDisponible] = useState<boolean>(true);
  const [categorias, setCategorias] = useState<string[]>(["comida", "bebida", "limpieza"]);
  const [ubicacion, setUbicacion] = useState<{estante: string, nivel: number}>({estante: "A", nivel: 1});
  const [producto, setProducto] = useState<Producto>({ nombre: "Yerba", precio: 1.5 });
  return(
    <div>
      <h1>Estado Demo</h1>
      <p>Nombre: {nombre}</p>
      <p>Cantidad: {cantidad}</p>
      <p>Disponible: {disponible ? "Sí" : "No"}</p>
      <p>Categorías: {categorias.join(", ")}</p>
      <p>Ubicación: Estante {ubicacion.estante}, Nivel {ubicacion.nivel}</p>
      <p>Producto: {producto.nombre} - Precio: {producto.precio.toFixed(2)} €</p>
    </div>
  )
};

export default EstadoDemo;
