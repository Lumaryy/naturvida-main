"use client"; // Marca este archivo como componente de cliente

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const FacturasPage = () => {
  const [facturas, setFacturas] = useState([]);
  const [facturasDetalle, setFacturasDetalle] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [form, setForm] = useState({
    facNumero: "",
    facFecha: "",
    facCliente: "",
    facValorTotal: "",
    facVendedor: "",
  });
  const [updateForm, setUpdateForm] = useState({
    facNumero: "",
    facFecha: "",
    facCliente: "",
    facValorTotal: "",
    facVendedor: "",
    detalles: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const router = useRouter();

  const navegarDetallesFacturas = () => {
    router.push('/facturaDetalles');
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        // Fetching facturas
        const facturasResponse = await fetch("/api/facturas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!facturasResponse.ok) throw new Error("Failed to fetch facturas: " + facturasResponse.statusText);
        const facturasData = await facturasResponse.json();
        setFacturas(facturasData.facturas);

        // Fetching clientes
        const clientesResponse = await fetch("/api/clientes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!clientesResponse.ok) throw new Error("Failed to fetch clientes: " + clientesResponse.statusText);
        const clientesData = await clientesResponse.json();
        setClientes(clientesData);

        // Fetching vendedores
        const vendedoresResponse = await fetch("/api/vendedores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!vendedoresResponse.ok) throw new Error("Failed to fetch vendedores: " + vendedoresResponse.statusText);
        const vendedoresData = await vendedoresResponse.json();
        setVendedores(vendedoresData);

        // Fetching facturas detalle
        const facturasDetalleResponse = await fetch('/api/facturaDetalle', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!facturasDetalleResponse.ok) {
          throw new Error(`HTTP error! Status: ${facturasDetalleResponse.status}`);
        }

        const facturasDetalleData = await facturasDetalleResponse.json();
        console.log("Facturas Detalle Data:", facturasDetalleData);
        setFacturasDetalle(facturasDetalleData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch("/api/facturas/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to create factura");

      router.push("/facturas");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // Crear un objeto de actualización sin campos innecesarios
      const updatedFactura = {
        facNumero: updateForm.facNumero,
        facFecha: updateForm.facFecha,
        facCliente: updateForm.facCliente,
        facValorTotal: updateForm.facValorTotal,
        facVendedor: updateForm.facVendedor,
      };

      const response = await fetch(`/api/facturas/${selectedFactura._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFactura),
      });

      if (!response.ok) throw new Error("Failed to update factura");

      router.push("/facturas");
    } catch (err) {
      setError(err.message);
    }
  };


  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`/api/facturas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete factura");

      setFacturas((prevFacturas) => prevFacturas.filter((factura) => factura._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2em", marginBottom: "20px", textAlign: "center" }}>Facturas</h1>

      {/* Facturas List */}
      {facturas.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px", backgroundColor: "#f4f4f4" }}>Número</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", backgroundColor: "#f4f4f4" }}>Fecha</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", backgroundColor: "#f4f4f4" }}>Cliente</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", backgroundColor: "#f4f4f4" }}>Valor Total</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", backgroundColor: "#f4f4f4" }}>Vendedor</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", backgroundColor: "#f4f4f4" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura) => (
              <tr key={factura._id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{factura.facNumero}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{factura.facFecha}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{factura.facCliente}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{factura.facValorTotal}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{factura.facVendedor}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <button
                    onClick={() => {
                      setSelectedFactura(factura);
                      setUpdateForm({
                        facNumero: factura.facNumero,
                        facFecha: factura.facFecha,
                        facCliente: factura.facCliente,
                        facValorTotal: factura.facValorTotal,
                        facVendedor: factura.facVendedor,
                        detalles: factura.detalles || "",
                      });
                    }}
                    style={{ marginRight: "10px" }}
                  >
                    Actualizar
                  </button>
                  <button onClick={() => handleDelete(factura._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: "center" }}>No hay facturas disponibles</p>
      )}

      {/* Add New Factura Form */}
      <h2 style={{ fontSize: "1.5em", margin: "20px 0", textAlign: "center" }}>Agregar Factura</h2>
      {error && <p style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>Error: {error}</p>}
      <form
        style={{ display: "flex", flexDirection: "column", maxWidth: "600px", margin: "0 auto" }}
        onSubmit={handleSubmit}
      >
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Número:</label>
          <input
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            type="text"
            name="facNumero"
            value={form.facNumero}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Fecha:</label>
          <input
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            type="date"
            name="facFecha"
            value={form.facFecha}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Cliente:</label>
          <select
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            name="facCliente"
            value={form.facCliente}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar Cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente._id} value={cliente._id}>
                {cliente.dNombre}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Valor Total:</label>



          <select
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            name="facValorTotal"
            value={form.facValorTotal}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar la factura detalle</option>
            {facturasDetalle.map((detalle) => (
              <option key={detalle.valorTotal} value={detalle.valorTotal}>
                {detalle.valorTotal}
              </option>
            ))}
          </select>




        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Vendedor:</label>
          <select
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            name="facVendedor"
            value={form.facVendedor}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar Vendedor</option>
            {vendedores.map((vendedor) => (
              <option key={vendedor._id} value={vendedor._id}>
                {vendedor.venUsuario}
              </option>
            ))}
          </select>
        </div>
        <button
          style={{
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#0070f3",
            color: "#fff",
            cursor: "pointer",
            fontSize: "1em",
            textAlign: "center",
          }}
          type="submit"
        >
          Agregar Factura
        </button>
        <button
          style={{
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#0020f3",
            color: "#fff",
            cursor: "pointer",
            fontSize: "1em",
            textAlign: "center",
            marginTop: "10px",
          }}
          type="submit"
          onClick={navegarDetallesFacturas}
        >
          Factura detalles
        </button>
      </form>

      {/* Update Factura Form */}
      {selectedFactura && (
        <>
          <h2 style={{ fontSize: "1.5em", margin: "20px 0", textAlign: "center" }}>Actualizar Factura</h2>
          <form
            style={{ display: "flex", flexDirection: "column", maxWidth: "600px", margin: "0 auto" }}
            onSubmit={handleUpdateSubmit}
          >
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Número:</label>
              <input
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                type="text"
                name="facNumero"
                value={updateForm.facNumero}
                onChange={handleUpdateChange}
                required
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Fecha:</label>
              <input
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                type="date"
                name="facFecha"
                value={updateForm.facFecha}
                onChange={handleUpdateChange}
                required
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Cliente:</label>
              <select
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                name="facCliente"
                value={updateForm.facCliente}
                onChange={handleUpdateChange}
                required
              >
                <option value="">Seleccionar Cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente._id} value={cliente._id}>
                    {cliente.dNombre}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Valor Total:</label>
              <select
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                name="facValorTotal"
                value={updateForm.facValorTotal}
                onChange={handleUpdateChange}
                required
              >
                <option value="">Seleccionar la factura detalle</option>
                {facturasDetalle.map((detalle) => (
                  <option key={detalle.valorTotal} value={detalle.valorTotal}>
                    {detalle.valorTotal}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Vendedor:</label>
              <select
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                name="facVendedor"
                value={updateForm.facVendedor}
                onChange={handleUpdateChange}
                required
              >
                <option value="">Seleccionar Vendedor</option>
                {vendedores.map((vendedor) => (
                  <option key={vendedor._id} value={vendedor._id}>
                    {vendedor.venUsuario}
                  </option>
                ))}
              </select>
            </div>
            <button
              style={{
                padding: "10px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#0070f3",
                color: "#fff",
                cursor: "pointer",
                fontSize: "1em",
                textAlign: "center",
              }}
              type="submit"
            >
              Actualizar Factura
            </button>

          </form>
        </>
      )}
    </div>
  );
};

export default FacturasPage;