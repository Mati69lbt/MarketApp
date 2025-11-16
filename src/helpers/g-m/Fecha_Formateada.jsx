const Fecha_Formateada = (fecha) => {
  // Crear la fecha en UTC
  const dateObj = new Date(
    new Date(fecha).toLocaleString("en-US", { timeZone: "UTC" })
  );

  // Ajustar la fecha al huso horario deseado, por ejemplo UTC-3
  dateObj.setHours(dateObj.getHours() - 3);

  const opciones = {
    month: "short",
    day: "numeric",
    timeZone: "UTC", // Establecer la zona horaria para el formateo también en UTC
  };

  const fechaFormateada = dateObj.toLocaleDateString("es-ES", opciones);

  return fechaFormateada;
};

export default Fecha_Formateada;
