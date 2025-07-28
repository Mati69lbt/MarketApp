// cspell: ignore categoria subcripciones
export interface Gasto {
  id: string;
  nombre: string;
  cantidad: number;
  categoria: Categoria;
  unidades: number;
  fecha: string | number;
  subTotal: number;
}

export type Categoria =
  | "ahorro"
  | "casa"
  | "comida"
  | "gastos"
  | "ocio"
  | "salud"
  | "subcripciones";