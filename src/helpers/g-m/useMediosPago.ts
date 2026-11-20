import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { slugify } from "./mediosPagoLogos";

export interface MedioPago {
  id: string;
  nombre: string;
  logo?: string;
}

const MEDIOS_INICIALES: MedioPago[] = [
  { id: "bbva", nombre: "BBVA" },
  { id: "bersa", nombre: "BERSA" },
  { id: "credicoop", nombre: "Credicoop" },
  { id: "efectivo", nombre: "Efectivo" },
  { id: "mercado-pago", nombre: "Mercado Pago" },
  { id: "modo", nombre: "MODO" },
  { id: "personal-pay", nombre: "Personal Pay" },
  { id: "santander", nombre: "Santander" },
];

const mediosPagoRef = () => doc(db, "config", "mediosPago");

export function useMediosPago() {
  const [medios, setMedios] = useState<MedioPago[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const ref = mediosPagoRef();
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(ref, { lista: MEDIOS_INICIALES });
          if (activo) setMedios(MEDIOS_INICIALES);
        } else {
          const data = snap.data();
          const lista = Array.isArray(data.lista)
            ? (data.lista as MedioPago[])
            : [];
          if (activo) setMedios(lista);
        }
      } catch (error) {
        console.error("Error al cargar medios de pago:", error);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const agregarMedio = useCallback(
    async (nombre: string): Promise<MedioPago | null> => {
      const limpio = nombre.trim();
      if (!limpio) return null;

      const existe = medios.some(
        (m) => m.nombre.toLowerCase() === limpio.toLowerCase()
      );
      if (existe) return null;

      const nuevo: MedioPago = {
        id: slugify(limpio) || crypto.randomUUID(),
        nombre: limpio,
      };
      const nuevaLista = [...medios, nuevo];

      await setDoc(mediosPagoRef(), { lista: nuevaLista });
      setMedios(nuevaLista);
      return nuevo;
    },
    [medios]
  );

  const borrarMedio = useCallback(
    async (id: string) => {
      const nuevaLista = medios.filter((m) => m.id !== id);
      await setDoc(mediosPagoRef(), { lista: nuevaLista });
      setMedios(nuevaLista);
    },
    [medios]
  );

  return { medios, cargando, agregarMedio, borrarMedio };
}
