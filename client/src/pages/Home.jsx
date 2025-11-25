// client/src/pages/Home.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";

export default function Home() {
  return (<>
    <Sidebar/>
    <main className="main">
      <div className="header"><h2>Inicio</h2><Bell/></div>
      <div className="card">Bienvenido. Usá el menú para navegar.</div>
    </main>
  </>);
}
