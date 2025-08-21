export const generarId = (): string => {
  const random = Math.random().toString(36).substring(2);
  const fecha = Date.now().toString(36);
  return random + fecha;
};

export const formatearFecha = (fecha: string | number): string => {
  const fechaNueva = new Date(fecha);
  if (isNaN(fechaNueva.getTime())) return "Fecha inválida";

  const dia = String(fechaNueva.getDate()).padStart(2, "0");
  const mes = String(fechaNueva.getMonth() + 1).padStart(2, "0"); // +1 porque enero = 0
  const anio = String(fechaNueva.getFullYear()).slice(-2); // últimos 2 dígitos

  return `${dia}/${mes}/${anio}`;
};

export const formatearHora = (fecha: string | number): string => {
  const fechaNueva = new Date(fecha);
  if (isNaN(fechaNueva.getTime())) return "Hora inválida";

  return fechaNueva.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatearMoneda = (valor: string | number) => {
  const num = Number(valor) || 0;
  return num.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
};

export const limpiarInput = (valor: string | number) => {
  if (typeof valor === "number") return valor;
  if (typeof valor === "string") {
    return Number(valor.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0;
  }
  throw new Error("Tipo de dato no válido");
};
