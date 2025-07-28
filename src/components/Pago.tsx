// cspell: ignore Swipeable, Subcripciones, subcripciones, categoria, descripcion, Iconoahorro

import type { Dispatch, SetStateAction } from "react";
import { formatearFecha, formatearHora } from "../helpers";
import Iconoahorro from "../img/icono_ahorro.svg";
import IconoCasa from "../img/icono_casa.svg";
import IconoComida from "../img/icono_comida.svg";
import IconoGastos from "../img/icono_gastos.svg";
import IconoOcio from "../img/icono_ocio.svg";
import IconoSalud from "../img/icono_salud.svg";
import IconoSubcripciones from "../img/icono_suscripciones.svg";
import type { Gasto, Categoria } from "../types/Gasto";
import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from "react-swipeable-list";

const diccIconos: Record<Categoria, string> = {
  ahorro: Iconoahorro,
  casa: IconoCasa,
  comida: IconoComida,
  gastos: IconoGastos,
  ocio: IconoOcio,
  salud: IconoSalud,
  subcripciones: IconoSubcripciones,
};

interface Props {
  gasto: Gasto;
  setGastoEditar: Dispatch<SetStateAction<Gasto | null>>;
  eliminarGasto: (id: string) => void;
}

const Pago = ({ gasto, setGastoEditar, eliminarGasto }: Props) => {
  const { categoria, nombre, id, subTotal, fecha } = gasto;
  const formatearNumero = (valor: number) => {
    if (!valor) return "";
    return valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const leadingActions = () => (
    <LeadingActions>
      <SwipeAction onClick={() => setGastoEditar(gasto)}>Editar</SwipeAction>
    </LeadingActions>
  );

  const trailingActions = () => (
    <TrailingActions>
      <SwipeAction onClick={() => eliminarGasto(id)} destructive={true}>
        Eliminar
      </SwipeAction>
    </TrailingActions>
  );
  return (
    <SwipeableList>
      <SwipeableListItem
        leadingActions={leadingActions()}
        trailingActions={trailingActions()}
      >
        <div className="gasto sombra">
          <div className="contenido-gasto">
            <img src={diccIconos[categoria]} />
            <div className="descripcion-gasto">
              <p className="categoria">{categoria}</p>
              <p className="nombre-gasto">
                {nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase()}
              </p>
              <p className="fecha-gasto">
                <span>
                  {formatearFecha(fecha)} - {formatearHora(fecha)}
                </span>
              </p>
            </div>
          </div>
          <p className="cantidad-gasto">{formatearNumero(subTotal)}</p>
        </div>
      </SwipeableListItem>
    </SwipeableList>
  );
};

export default Pago;
