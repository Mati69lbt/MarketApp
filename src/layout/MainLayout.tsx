import { Outlet } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { useEffect, useState } from "react";
import "./MainLayout.css";
import { auth } from "../helpers/firebase";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import Historial from "../pages/Historial";

const MainLayout = () => {
  const [usuario, setUsuario] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        "mati69_lbt@hotmail.com",
        "compras"
      );
      toast.success("Login exitoso");
    } catch (error) {
      toast.error("Error al iniciar sesión");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  const cerrarMenu = () => {
    document.body.classList.remove("menu-open");
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-header">
          <button
            className="menu-toggle"
            onClick={() => document.body.classList.toggle("menu-open")}
          >
            ☰
          </button>
          <div className="logo">🛒 MarketApp</div>
        </div>

        <div className="navbar-links">
          <NavLink
            to="/"
            onClick={cerrarMenu}
            className={({ isActive }) => (isActive ? "activo" : "")}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/comparacion"
            onClick={cerrarMenu}
            className={({ isActive }) => (isActive ? "activo" : "")}
          >
            Comparación
          </NavLink>
          <NavLink
            to="/productos"
            onClick={cerrarMenu}
            className={({ isActive }) => (isActive ? "activo" : "")}
          >
            Sugeridos
          </NavLink>
          <NavLink
            to="/compras"
            onClick={cerrarMenu}
            className={({ isActive }) => (isActive ? "activo" : "")}
          >
            Compras
          </NavLink>
          <NavLink
            to="/gastos-mensuales"
            onClick={cerrarMenu}
            className={({ isActive }) => (isActive ? "activo" : "")}
          >
            Gastos Mensuales
          </NavLink>
          <NavLink
            to="/historial"
            onClick={cerrarMenu}
            className={({ isActive }) => (isActive ? "activo" : "")}
          >
            Historial
          </NavLink>
          {usuario ? (
            <button className="logOut" onClick={handleLogout}>
              Log Out
            </button>
          ) : (
            <button className="logIn" onClick={handleLogin}>
              Log In
            </button>
          )}
          <NavLink
            to="/vencimientos"
            onClick={cerrarMenu}
            className={({ isActive }) => (isActive ? "activo" : "")}
          >
            Vencimientos
          </NavLink>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
