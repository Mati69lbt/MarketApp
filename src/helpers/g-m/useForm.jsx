import { useState } from "react";

const useForm = (initialObj = {}) => {
  const [form, setForm] = useState(initialObj);

  const changed = ({ target }) => {
    const { name, value } = target;
    setForm({ ...form, [name]: value });
  };

  const reset = () => {
    setForm(initialObj);
  };

  return {
    form,
    changed,
    reset,
  };
};

export default useForm;
