// cspell: ignore comparacion Toastify
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CompararTicket from "./pages/CompararTicket";
import ProdSugeridos from "./pages/ProdSugeridos";
import ListaCompras from "./pages/ListaCompras";
import MainLayout from "./layout/MainLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/comparacion" element={<CompararTicket />} />
          <Route path="/productos" element={<ProdSugeridos />} />
          <Route path="/compras" element={<ListaCompras />} />
        </Route>
      </Routes>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </>
  );
};

export default App;
