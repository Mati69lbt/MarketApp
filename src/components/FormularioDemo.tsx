import React, { useState } from "react";

interface Producto {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

const FormularioDemo = () => {
  const [nombre, setNombre] = useState<string>("")
  const [cantidad, setCantidad] = useState<number>(0);
  const [precio, setPrecio] = useState<number>(0);
  const [productos, setProductos] = useState<Producto[]>([]);

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nombre || cantidad <= 0 || precio <= 0) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }
    const nuevoProducto: Producto = {
      id: crypto.randomUUID(),
      nombre,
      cantidad,
      precio
    };
    setProductos([...productos, nuevoProducto]);
    setNombre("");
    setCantidad(0);
    setPrecio(0);
}

  return (
  <div>
    <h1>Formulario de Productos</h1>
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre del Producto:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Cantidad:</label>
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <label>Precio:</label>
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(Number(e.target.value))}
          required
        />
      </div>
      <button type="submit">Agregar Producto</button>
    </form>

    <h2>Productos Agregados</h2>
    <ul>
      {productos.map((producto) => (
        <li key={producto.id}>
          {producto.nombre} - Cantidad: {producto.cantidad}, Precio: {producto.precio.toFixed(2)} €
        </li>
      ))}
    </ul>
  </div>
  )
}

export default FormularioDemo