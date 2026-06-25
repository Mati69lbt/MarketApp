

import { useState } from "react";

const VetoMes = () => {
  const [filas, setFilas] = useState([]);
  const [form, setForm] = useState({ fecha: "", descripcion: "", monto: "" });
  const [seleccionados, setSeleccionados] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAgregar = (e) => {
    e.preventDefault();
    if (!form.fecha || !form.descripcion || !form.monto) return;

    const nueva = {
      id: Date.now(),
      fecha: form.fecha,
      descripcion: form.descripcion,
      monto: parseFloat(form.monto),
      pagado: false,
    };

    setFilas([...filas, nueva]);
    setForm({ fecha: "", descripcion: "", monto: "" });
  };

  const togglePagado = (id) => {
    setFilas(filas.map((f) => (f.id === id ? { ...f, pagado: !f.pagado } : f)));
  };

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const eliminar = (id) => {
    setFilas(filas.filter((f) => f.id !== id));
    setSeleccionados(seleccionados.filter((s) => s !== id));
  };

  const totalGeneral = filas.reduce((acc, f) => acc + f.monto, 0);
  const totalPagado = filas
    .filter((f) => f.pagado)
    .reduce((acc, f) => acc + f.monto, 0);
  const totalPendiente = totalGeneral - totalPagado;
  const totalSeleccionados = filas
    .filter((f) => seleccionados.includes(f.id))
    .reduce((acc, f) => acc + f.monto, 0);

  const formatPeso = (n) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  const formatFecha = (iso) => {
    if (!iso) return "";
    const [anio, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <div className="vetoMes-contenedor">
      {/* FORMULARIO */}
      <form className="vetoMes-form" onSubmit={handleAgregar}>
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
        />
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />
        <input
          type="number"
          name="monto"
          placeholder="Monto"
          value={form.monto}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
        <button type="submit">Agregar</button>
      </form>

      {/* TABLA */}
      {filas.length > 0 && (
        <>
          <table className="vetoMes-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Pagado</th>
                <th title="Seleccioná filas para sumar">Sumar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr
                  key={fila.id}
                  className={
                    fila.pagado
                      ? "fila-pagada"
                      : "" + seleccionados.includes(fila.id)
                        ? " fila-seleccionada"
                        : ""
                  }
                >
                  <td>{formatFecha(fila.fecha)}</td>
                  <td>{fila.descripcion}</td>
                  <td className="monto">{formatPeso(fila.monto)}</td>
                  <td className="centrado">
                    <input
                      type="checkbox"
                      checked={fila.pagado}
                      onChange={() => togglePagado(fila.id)}
                    />
                  </td>
                  <td className="centrado">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(fila.id)}
                      onChange={() => toggleSeleccion(fila.id)}
                    />
                  </td>
                  <td className="centrado">
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminar(fila.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* SUBTOTALES */}
          <div className="vetoMes-subtotales">
            <div className="subtotal-item">
              <span>Total general</span>
              <strong>{formatPeso(totalGeneral)}</strong>
            </div>
            <div className="subtotal-item pagado">
              <span>Pagado</span>
              <strong>{formatPeso(totalPagado)}</strong>
            </div>
            <div className="subtotal-item pendiente">
              <span>Pendiente</span>
              <strong>{formatPeso(totalPendiente)}</strong>
            </div>
            {seleccionados.length > 0 && (
              <div className="subtotal-item seleccionado">
                <span>Suma seleccionados ({seleccionados.length})</span>
                <strong>{formatPeso(totalSeleccionados)}</strong>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VetoMes;
