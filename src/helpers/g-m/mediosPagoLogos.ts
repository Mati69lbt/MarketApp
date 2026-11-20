// cspell: ignore bersa credicoop modo

/** "Mercado Pago" -> "mercado-pago" (sin acentos, minúsculas, guiones) */
export function slugify(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Archivos reales en src/assets/medios-pago/. Mientras no existan, el glob
// no encuentra nada y se usa el fallback (iniciales + color) sin romper nada.
const archivosLogos = import.meta.glob(
  "../../assets/medios-pago/*.{svg,png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;

/**
 * slug del medio de pago -> nombre de archivo esperado en src/assets/medios-pago/
 * Si un medio no tiene entrada acá (ej. medios creados por el usuario), o el
 * archivo todavía no existe, se usa el fallback (iniciales + color).
 * Para sumar un logo nuevo, solo hace falta agregar la entrada acá con el
 * slug del nombre y soltar el archivo con ese mismo nombre en la carpeta.
 */
const NOMBRE_A_ARCHIVO: Record<string, string> = {
  bbva: "bbva.svg",
  bersa: "bersa.png",
  credicoop: "credicoop.png",
  efectivo: "efectivo.svg",
  "mercado-pago": "mercado-pago.svg",
  modo: "modo.png",
  "personal-pay": "personal-pay.png",
  santander: "santander.svg",
  belo: "belo.svg",
};

export function getLogoMedioPago(nombreOId: string): string | undefined {
  const archivo = NOMBRE_A_ARCHIVO[slugify(nombreOId)];
  if (!archivo) return undefined;

  const key = Object.keys(archivosLogos).find((k) => k.endsWith(`/${archivo}`));
  return key ? archivosLogos[key] : undefined;
}

/**
 * Factor de escala por logo: cada archivo trae su propia proporción y
 * margen interno, así que al mismo tamaño de celda unos se ven enormes y
 * otros diminutos. Ajustar estos valores a mano (1 = tamaño normal).
 */
const ESCALA_LOGO: Record<string, number> = {
  bbva: 0.55,
  "mercado-pago": 1.6,
  "personal-pay": 1.8,
  efectivo: 1.8,
  belo: 2,
};

export function getEscalaLogo(nombreOId: string): number {
  return ESCALA_LOGO[slugify(nombreOId)] ?? 1;
}

/** color estable derivado del nombre, para el fallback con inicial */
export function colorDesdeNombre(nombre: string): string {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}
