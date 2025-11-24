import React, { useState } from "react";
export default function Announce(){
  const [f,setF]=useState({subject:"",message:""});
  const send=e=>{e.preventDefault(); alert("Comunicado enviado (mock)");};
  return <div>
    <h1>Enviar comunicado</h1>
    <form onSubmit={send} style={{display:"grid",gap:8,maxWidth:520}}>
      <input placeholder="Asunto" value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}/>
      <textarea placeholder="Mensaje" value={f.message} onChange={e=>setF({...f,message:e.target.value})}/>
      <button>Enviar</button>
    </form>
  </div>;
}