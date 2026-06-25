//cspell: ignore vencimientos historico Histo Seleccion descripcion Seleccioná anio
import { useState } from "react";
import "../styles/VetoMes.css";

interface Fila {
  id: number;
  fecha: string;
  descripcion: string;
  monto: number;
  pagado: boolean;
}

interface FormState {
  fecha: string;
  descripcion: string;
  monto: string;
}

const VetoMes = () => {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [form, setForm] = useState<FormState>({
    fecha: "",
    descripcion: "",
    monto: "",
  });
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAgregar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.fecha || !form.descripcion || !form.monto) return;

    const nueva: Fila = {
      id: Date.now(),
      fecha: form.fecha,
      descripcion: form.descripcion,
      monto: parseFloat(form.monto),
      pagado: false,
    };

    setFilas([...filas, nueva]);
    setForm({ fecha: "", descripcion: "", monto: "" });
  };

  const togglePagado = (id: number) => {
    setFilas(filas.map((f) => (f.id === id ? { ...f, pagado: !f.pagado } : f)));
  };

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const capitalizarPrimera = (texto: string): string =>
    texto.charAt(0).toUpperCase() + texto.slice(1);

  const eliminar = (id: number) => {
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

  const formatPeso = (n: number): string =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  const formatFechaPartes = (iso: string) => {
    if (!iso) return { diaSemana: "", diaNumero: "", mesNombre: "" };
    const [anio, mes, dia] = iso.split("-");
    const fecha = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
    const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
    return {
      diaSemana: cap(fecha.toLocaleDateString("es-AR", { weekday: "long" })),
      diaNumero: fecha.toLocaleDateString("es-AR", { day: "numeric" }),
      mesNombre: cap(fecha.toLocaleDateString("es-AR", { month: "long" })),
    };
  };

  const filasOrdenadas = [...filas].sort((a, b) =>
    a.fecha.localeCompare(b.fecha),
  );

  const descripcionesUnicas = [...new Set(filas.map((f) => f.descripcion))];

  const getClaseFila = (fila: Fila): string => {
    const clases: string[] = [];
    if (fila.pagado) clases.push("fila-pagada");
    if (seleccionados.includes(fila.id)) clases.push("fila-seleccionada");
    return clases.join(" ");
  };

  return (
    <div className="vetoMes-contenedor">
      <div className="vetoMes-layout">
        {/* COLUMNA 1 — FORMULARIO */}
        <form className="vetoMes-form" onSubmit={handleAgregar}>
          <input
            type="date"
            name="fecha"
            placeholder="Fecha"
            value={form.fecha}
            onChange={handleChange}
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            list="sugerencias-descripcion"
            autoComplete="off"
          />
          <datalist id="sugerencias-descripcion">
            {descripcionesUnicas.map((desc) => (
              <option key={desc} value={desc} />
            ))}
          </datalist>
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

        {/* COLUMNA 2 — TABLA */}
        <div>
          {filas.length > 0 && (
            <div className="vetoMes-tabla-wrapper">
              <table className="vetoMes-tabla">
                <thead>
                  <tr>
                    <th className="col-idx">N°</th>
                    <th className="col-fecha">Fecha</th>
                    <th className="col-desc">Descripción</th>
                    <th className="col-monto">Monto</th>
                    <th className="col-check">Pagado</th>
                    <th
                      className="col-check"
                      title="Seleccioná filas para sumar"
                    >
                      Sumar
                    </th>
                    <th className="col-accion"></th>
                  </tr>
                </thead>
                <tbody>
                  {filasOrdenadas.map((fila, idx) => (
                    <tr key={fila.id} className={getClaseFila(fila)}>
                      <td className="col-idx">{idx + 1}</td>
                      <td className="col-fecha">
                        <div className="fecha-celda">
                          <span className="fecha-dia-semana">
                            {formatFechaPartes(fila.fecha).diaSemana}
                          </span>
                          <span className="fecha-dia-numero">
                            {formatFechaPartes(fila.fecha).diaNumero}
                          </span>
                          <span className="fecha-mes-nombre">
                            {formatFechaPartes(fila.fecha).mesNombre}
                          </span>
                        </div>
                      </td>
                      <td className="col-desc">
                        {capitalizarPrimera(fila.descripcion)}
                      </td>
                      <td className="col-monto">{formatPeso(fila.monto)}</td>
                      <td className="col-check">
                        <input
                          type="checkbox"
                          checked={fila.pagado}
                          onChange={() => togglePagado(fila.id)}
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
            </div>
          )}
        </div>

        {/* COLUMNA 3 — SUBTOTALES */}
        {filas.length > 0 && (
          <div className="vetoMes-subtotales">
            <h3 className="subtotales-titulo">Resumen</h3>
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
        )}
      </div>
    </div>
  );
};

export default VetoMes;
