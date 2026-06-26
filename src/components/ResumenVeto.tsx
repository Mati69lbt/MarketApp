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
    <div className="tablas-mes-grid">
      <section className="tabla-ind">
        <h3 className="tabla-ind__title">Resumen</h3>
        <div className="tabla-ind__scroller">
          <table className="tabla-ind__table">
            <tbody className="tabla-ind__tbody">
              <tr className="tabla-ind__tr">
                <td className="tabla-ind__td tabla-ind__td--desc">Total</td>
                <td className="tabla-ind__td tabla-ind__td--right">
                  <NumericFormat
                    value={total}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="$  "
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </td>
              </tr>
              <tr className="tabla-ind__tr">
                <td className="tabla-ind__td tabla-ind__td--desc">Pagado</td>
                <td className="tabla-ind__td tabla-ind__td--right">
                  <NumericFormat
                    value={totalPagado}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="$  "
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </td>
              </tr>
              <tr className="tabla-ind__tr-total">
                <td className="tabla-ind__td-total-label">A pagar</td>
                <td className="tabla-ind__td-total tabla-ind__td--right">
                  <NumericFormat
                    value={totalAPagar}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="$  "
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </td>
              </tr>
              {cantSeleccionados > 0 && (
                <tr className="tabla-ind__tr">
                  <td className="tabla-ind__td tabla-ind__td--desc">
                    Seleccionados ({cantSeleccionados})
                  </td>
                  <td className="tabla-ind__td tabla-ind__td--right">
                    <NumericFormat
                      value={totalSeleccionados}
                      displayType="text"
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="$  "
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ResumenVeto;
