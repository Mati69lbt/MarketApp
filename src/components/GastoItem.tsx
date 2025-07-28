import type { Gasto } from "../types/Gasto"

interface Props {
  gasto: Gasto
}

const GastoItem = ({gasto}: Props) => {
  return (
    <div className="gasto-item">
      <div className="gasto-item__info">
        <h3 className="gasto-item__nombre">{gasto.nombre}</h3>
        <p className="gasto-item__categoria">{gasto.categoria}</p>
        <p className="gasto-item__fecha">{new Date(gasto.fecha).toLocaleDateString()}</p>
      </div>
      <div className="gasto-item__cantidad">
        <span>{gasto.cantidad.toFixed(2)} €</span>
        <span>Unidades: {gasto.unidades}</span>
      </div>
    </div>
  )
}

export default GastoItem