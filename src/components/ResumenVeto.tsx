import { NumericFormat } from "react-number-format";

interface Props {
  total: number;
  totalPagado: number;
  totalAPagar: number;
  totalSeleccionados: number;
  cantSeleccionados: number;
}

const ResumenVeto = ({
  total,
  totalPagado,
  totalAPagar,
  totalSeleccionados,
  cantSeleccionados,
}: Props) => {
  return (
    <section className="resumen-veto">
      <h3 className="resumen-veto__title">Resumen</h3>

      <div className="resumen-veto__fila">
        <span>Total</span>
        <strong>
          <NumericFormat
            value={total}
            displayType="text"
            thousandSeparator="."
            decimalSeparator=","
            prefix="$ "
            decimalScale={2}
            fixedDecimalScale
          />
        </strong>
      </div>

      <div className="resumen-veto__fila">
        <span>Pagado</span>
        <strong>
          <NumericFormat
            value={totalPagado}
            displayType="text"
            thousandSeparator="."
            decimalSeparator=","
            prefix="$ "
            decimalScale={2}
            fixedDecimalScale
          />
        </strong>
      </div>

      <div className="resumen-veto__fila resumen-veto__fila--total">
        <span>A pagar</span>
        <strong>
          <NumericFormat
            value={totalAPagar}
            displayType="text"
            thousandSeparator="."
            decimalSeparator=","
            prefix="$ "
            decimalScale={2}
            fixedDecimalScale
          />
        </strong>
      </div>

      {cantSeleccionados > 0 && (
        <div className="resumen-veto__fila">
          <span>Seleccionados ({cantSeleccionados})</span>
          <strong>
            <NumericFormat
              value={totalSeleccionados}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$ "
              decimalScale={2}
              fixedDecimalScale
            />
          </strong>
        </div>
      )}
    </section>
  );
};

export default ResumenVeto;
