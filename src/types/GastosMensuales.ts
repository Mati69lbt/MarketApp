// cspell: ignore matias descripcion
export type Persona = "carolina" | "matias";

export interface GastoMensual {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  pagadoPor: Persona;
  periodoKey: string;
  periodoLabel: string;
}

export interface ResumenMensual {
  periodoKey: string;
  periodoLabel: string;
  totalCarolina: number;
  totalMatias: number;
  totalGeneral: number;
  mitad: number;
  quienDebe: Persona | null;
  monto: number;
  estado: "abierto" | "cerrado";
  cerradoEn?: string;
}
