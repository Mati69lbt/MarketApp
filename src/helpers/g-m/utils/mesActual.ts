type Gasto = { fecha: string };

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const splitYMD = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
};

const mesActual = (
  gastos_Carolina: Gasto[] = [],
  gastos_Matias: Gasto[] = []
) => {
  const todos: Gasto[] = [...gastos_Carolina, ...gastos_Matias];

  if (todos.length === 0) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    return {
      periodKey: `${y}-${String(m).padStart(2, "0")}`,
      periodLabel: `${monthNames[m - 1]}-${y}`,
    };
  }

  // ✅ reduce con tipo e inicial
  const max = todos.reduce<Gasto>(
    (a, b) => (a.fecha > b.fecha ? a : b),
    todos[0]
  );

  const { y, m } = splitYMD(max.fecha);
  return {
    periodKey: `${y}-${String(m).padStart(2, "0")}`,
    periodLabel: `${monthNames[m - 1]}-${y}`,
  };
};

export default mesActual;
