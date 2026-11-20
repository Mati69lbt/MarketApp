import {
  getLogoMedioPago,
  getEscalaLogo,
  colorDesdeNombre,
} from "../helpers/g-m/mediosPagoLogos";
import "../styles/MedioPagoLogo.css";

interface Props {
  nombre: string;
  size?: number;
}

const ANCHO_MAXIMO = 90;

const MedioPagoLogo = ({ nombre, size = 30 }: Props) => {
  const url = getLogoMedioPago(nombre);

  if (url) {
    const escala = getEscalaLogo(nombre);
    return (
      <span className="mp-logo mp-logo--img" style={{ height: size }}>
        <img
          src={url}
          alt=""
          style={{
            height: size * escala,
            maxWidth: ANCHO_MAXIMO * escala,
          }}
        />
      </span>
    );
  }

  return (
    <span
      className="mp-logo mp-logo--fallback"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background: colorDesdeNombre(nombre),
      }}
    >
      {nombre.charAt(0).toUpperCase()}
    </span>
  );
};

export default MedioPagoLogo;
