import { NumericFormat } from "react-number-format";

interface InputMonedaProps {
  value: number;
  onChange: (value: number) => void;
  name?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

import React from "react";

const InputMoneda = ({
  value,
  onChange,
  name = "",
  style = {},
  placeholder = "",
  inputRef = null,
}: InputMonedaProps) => {
  return (
    <NumericFormat
      name={name}
      value={value}
      getInputRef={inputRef}
      onValueChange={({ floatValue }) => onChange(floatValue ?? 0)}
      thousandSeparator="."
      decimalSeparator=","
      prefix="$ "
      allowNegative={false}
      decimalScale={2}
      fixedDecimalScale
      inputMode="decimal"
      placeholder={placeholder}
      style={style}
      onFocus={(e) => e.target.select()}
    />
  );
};

export default InputMoneda;
