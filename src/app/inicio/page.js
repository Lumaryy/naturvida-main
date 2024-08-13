"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const InicioPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!isAuthenticated) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "2em", textAlign: "center" }}>Bienvenido a Naturvida</h1>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
        <Card title="Clientes" link="/clientes" />
        <Card title="Productos" link="/productos" />
        <Card title="Vendedores" link="/vendedores" />
        <Card title="Facturas" link="/facturas" />
        {/* <Card title="facturaDetalles" link="/facturaDetalles" /> */}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#0070f3",
            color: "#fff",
            cursor: "pointer",
            fontSize: "1em",
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

const Card = ({ title, link }) => {
  return (
    <div
      style={{
        width: "200px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "20px",
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2 style={{ fontSize: "1.2em", marginBottom: "10px" }}>{title}</h2>
      <a
        href={link}
        style={{
          display: "inline-block",
          padding: "10px 15px",
          borderRadius: "4px",
          backgroundColor: "#0070f3",
          color: "#fff",
          textDecoration: "none",
        }}
      >
        Ir a {title}
      </a>
    </div>
  );
};

export default InicioPage;
