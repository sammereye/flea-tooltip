import { Outlet } from "react-router-dom";
import { Nav } from "../components/Nav";
import "../styles/index.css";

export function Layout() {
  return (
    <main className="p-2 pt-1 h-full">
      {/* <Nav /> */}
      <Outlet />
    </main>
  );
}
