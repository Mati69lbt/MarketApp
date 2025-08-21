//cspell: ignore file Notiflix comparacion firestore notiflix vacio
import React, { useEffect, useState } from "react";
import type { Gasto } from "../types/Gasto";
import { formatearMoneda, limpiarInput } from "../helpers";
import InputMoneda from "../components/InputMoneda";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../helpers/firebase";
import Notiflix from "notiflix";

type GastoConInputs = Gasto & {
  precioTicket: number;
  descuento: number;
};

const CompararTicket = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [chequeoTicket, setChequeoTicket] = useState<number>(0);
  const [gastosConInputs, setGastosConInputs] = useState<GastoConInputs[]>(
    gastos.map((g) => ({
      ...g,
      precioTicket: 0,
      descuento: 0,
    }))
  );

  useEffect(() => {
    const cargarGastos = async () => {
      Notiflix.Loading.circle("Cargando datos...");
      try {
        const docRef = doc(db, "gastos", "lista");
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.gastos)) {
            setGastos(data.gastos);
          }
        }
      } catch (error) {
        toast.error("Error al cargar los gastos");
        console.error("Error al obtener los gastos:", error);
      } finally {
        Notiflix.Loading.remove();
      }
    };
    cargarGastos();
  }, []);

  useEffect(() => {
    const conInputs: GastoConInputs[] = gastos.map((g) => ({
      ...g,
      precioTicket: 0,
      descuento: 0,
    }));
    setGastosConInputs(conInputs);
  }, [gastos]);

  const ordenarGastosConInputs = (
    gastosConInputs: GastoConInputs[]
  ): GastoConInputs[] => {
    return [...gastosConInputs].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
    );
  };

  const gastosOrdenados = ordenarGastosConInputs(gastosConInputs);

  const TotalApp: number = gastos.reduce((acc, g) => {
    const subTotal = g.cantidad * g.unidades;
    return acc + subTotal;
  }, 0);

  const handleInputChange = (
    gastoEditado: Gasto,
    campo: "precioTicket" | "descuento",
    valor: number
  ) => {
    const copia = [...gastosConInputs];
    const idx = copia.findIndex((g) => g.id === gastoEditado.id);
    if (idx !== -1) {
      copia[idx][campo] = valor;
      setGastosConInputs(copia);
    }
  };

  const calcularSubtotal: (
    precio: string | number,
    descuento: string | number
  ) => number = (precio, descuento) =>
    limpiarInput(precio) - limpiarInput(descuento);

  const calcularDiferencia = (subApp: number, subTicket: number): number =>
    subTicket - subApp;

  const totalTicket: number = gastosConInputs.reduce((acc, g) => {
    const subtotal = calcularSubtotal(g.precioTicket, g.descuento);
    return acc + subtotal;
  }, 0);

  const TotalTicketSinDescuento: number = gastosConInputs.reduce((acc, g) => {
    return acc + g.precioTicket;
  }, 0);

  const totalDescuentos: number = gastosConInputs.reduce((acc, g) => {
    return acc + g.descuento;
  }, 0);

  const totalDiferencias: number = gastosConInputs.reduce((acc, gasto) => {
    const subtotalTicket = calcularSubtotal(
      gasto.precioTicket,
      gasto.descuento
    );
    const diferencia = subtotalTicket - gasto.subTotal;
    return acc + diferencia;
  }, 0);

  return (
    <div className="comparacion-container">
      <h2>Comparación de Gastos</h2>
      <table className="tabla-comparacion">
        <thead>
          <tr>
            <th className="index"></th>
            <th className="col-producto">Producto</th>
            <th className="col-precio-app">Precio App</th>
            <th className="col-precio-ticket">Precio Ticket</th>
            <th className="col-descuento">Descuento</th>
            <th className="col-subtotal">Subtotal</th>
            <th className="col-diferencia">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {gastosOrdenados.map((gasto, index) => {
            const subtotal = calcularSubtotal(
              gasto.precioTicket,
              gasto.descuento
            );
            const diferencia = calcularDiferencia(gasto.subTotal, subtotal);

            return (
              <tr key={gasto.id}>
                <td className="index">{index + 1}</td>
                <td className="col-producto">{gasto.nombre} - {gasto.unidades}</td>
                <td className="col-precio-app">
                  {formatearMoneda(gasto.subTotal)}
                </td>
                <td className="col-precio-ticket">
                  <InputMoneda
                    placeholder="Precio Ticket"
                    value={gasto.precioTicket}
                    onChange={(valor) =>
                      handleInputChange(gasto, "precioTicket", valor)
                    }
                  />
                </td>
                <td className="col-descuento">
                  <InputMoneda
                    value={gasto.descuento}
                    placeholder="Descuento"
                    onChange={(valor) =>
                      handleInputChange(gasto, "descuento", valor)
                    }
                  />
                </td>
                <td className="col-subtotal">{formatearMoneda(subtotal)}</td>
                <td
                  className={`col-diferencia ${
                    diferencia < 0 ? "negativo" : "positivo"
                  }`}
                >
                  {formatearMoneda(diferencia)}
                </td>
              </tr>
            );
          })}
          <tr>
            <td></td>
            <td className="col-producto">Totales</td>
            <td className="col-precio-app">{formatearMoneda(TotalApp)}</td>
            <td className="col-precio-ticket">
              {formatearMoneda(TotalTicketSinDescuento)}
            </td>
            <td className="col-descuento">
              {formatearMoneda(totalDescuentos)}
            </td>
            <td className="valor">{formatearMoneda(totalTicket)}</td>
            <td
              className={`col-diferencia ${
                totalDiferencias < 0 ? "negativo" : "positivo"
              }`}
            >
              {formatearMoneda(totalDiferencias)}
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <table className="tabla-totales">
        <thead>
          <tr>
            <th className="th-vacio"></th>
            <th className="th-titulo">Totales</th>
          </tr>
        </thead>
        <tbody>
          <tr className="fila-total-ticket">
            <td className="label">Total Ticket Super</td>
            <td className="valor">{formatearMoneda(totalTicket)}</td>
          </tr>
          <tr className="fila-chequeo">
            <td className="label">Chequeo Ticket</td>
            <td className="valor">
              <InputMoneda
                value={chequeoTicket}
                onChange={(valor) => setChequeoTicket(valor)}
                placeholder="Valor Tique"
              />
            </td>
          </tr>
          <tr className="fila-diferencia">
            <td className="label">Diferencia</td>
            <td
              className={`valor ${
                chequeoTicket - totalTicket < 0 ? "negativo" : "positivo"
              }`}
            >
              {formatearMoneda(totalTicket - chequeoTicket)}
            </td>
          </tr>
          <tr className="fila-total-app">
            <td className="label">Total App</td>
            <td className="valor">{formatearMoneda(TotalApp)}</td>
          </tr>
          <tr className="fila-diferencia-app">
            <td className="label">Total App - Tique Super</td>
            <td
              className={`valor ${
                TotalApp - totalTicket < 0 ? "negativo" : "positivo"
              }`}
            >
              {formatearMoneda(TotalApp - totalTicket)}
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className={`valor ${
                TotalApp - totalTicket < 0 ? "negativo" : "positivo"
              }`}
            >
              {TotalApp - totalTicket < 0
                ? `A uds lo han cagado en ${formatearMoneda(
                    TotalApp - totalTicket
                  )}`
                : `Aparentemente ud ha sido beneficiado con ${formatearMoneda(
                    TotalApp - totalTicket
                  )}`}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CompararTicket;
