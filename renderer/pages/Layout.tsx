import { Outlet } from "react-router-dom";
import { Nav } from "../components/Nav";
import '../styles/index.css';

export function Layout() {
  return (
    <main className="p-4">
      <Nav />
      <Outlet />
    </main>
  )
}