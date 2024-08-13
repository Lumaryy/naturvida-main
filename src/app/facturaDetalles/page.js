"use client";

import { useState, useEffect } from 'react';

const FacturasPage = () => {
  const [productos, setProductos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [form, setForm] = useState({
    facNumero: "",
    facProductoId: "",
    faCantidad: "",
  });
  const [error, setError] = useState(null);
  const [editingFactura, setEditingFactura] = useState(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; 
      return;
    }

    try {
      const productosResponse = await fetch('/api/productos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!productosResponse.ok) {
        throw new Error(`HTTP error! Status: ${productosResponse.status}`);
      }

      const productosData = await productosResponse.json();
      setProductos(productosData);

      const facturasResponse = await fetch('/api/facturaDetalle', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!facturasResponse.ok) {
        throw new Error(`HTTP error! Status: ${facturasResponse.status}`);
      }

      const facturasData = await facturasResponse.json();
      setFacturas(facturasData);

    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingFactura) {
      setForm({
        facNumero: editingFactura.facNumero || "",
        facProductoId: editingFactura.facProductoId || "",
        faCantidad: editingFactura.faCantidad || "",
      });
    }
  }, [editingFactura]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleCreateFactura = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
  
    const cantidadAEnviar = parseInt(form.faCantidad, 10);
  
    if (isNaN(cantidadAEnviar)) {
      setError("Cantidad no válida");
      return;
    }
  
    // Encuentra el producto seleccionado para obtener su proCantidad
    const productoSeleccionado = productos.find(producto => producto._id === form.facProductoId);
  
    if (productoSeleccionado) {
      if (cantidadAEnviar > productoSeleccionado.proCantidad) {
        setError("No puedes registrar una cantidad mayor a la disponible.");
        return;
      }
    }
  
    try {
      const response = await fetch('/api/facturaDetalle/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, faCantidad: cantidadAEnviar }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      await fetchData();  // Recargar los datos después de crear
      setForm({
        facNumero: "",
        facProductoId: "",
        faCantidad: "",
      });
  
    } catch (error) {
      setError(error.message);
    }
  };
  

  const handleEditFactura = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const cantidadAEnviar = parseInt(form.faCantidad, 10);

    if (isNaN(cantidadAEnviar)) {
      setError("Cantidad no válida");
      return;
    }

    // Encuentra el producto seleccionado para obtener su proCantidad
    const productoSeleccionado = productos.find(producto => producto._id === form.facProductoId);

    if (productoSeleccionado) {
      const cantidadOriginal = editingFactura.faCantidad;

      // Si la cantidad nueva es mayor que la original, entonces verifica si es mayor que la disponible
      if (cantidadAEnviar > cantidadOriginal) {
        const diferencia = cantidadAEnviar - cantidadOriginal;
        if (diferencia > productoSeleccionado.proCantidad) {
          setError("No puedes registrar una cantidad mayor a la disponible.");
          return;
        }
      }
    }

    try {
      const response = await fetch(`/api/facturaDetalle/${editingFactura._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, faCantidad: cantidadAEnviar }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await fetchData();  // Recargar los datos después de editar
      setEditingFactura(null);
      setForm({
        facNumero: "",
        facProductoId: "",
        faCantidad: "",
      });
    } catch (error) {
      setError(error.message);
    }
};

  

  const handleDeleteFactura = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`/api/facturaDetalle/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await fetchData();  // Recargar los datos después de eliminar
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Facturas</h1>
      {error && <p style={styles.error}>Error: {error}</p>}

      <h2 style={styles.subTitle}>{editingFactura ? 'Editar Factura' : 'Agregar Factura'}</h2>
      <div style={styles.form}>
        <select
          name="facProductoId"
          value={form.facProductoId}
          onChange={handleChange}
          style={styles.input}
          required
        >
          <option value="">Seleccionar Producto</option>
          {productos.map((producto) => (
            <option key={producto._id} value={producto._id}>
              {producto.proDescripcion}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="facNumero"
          placeholder="Número de Factura"
          value={form.facNumero}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="number"
          name="faCantidad"
          placeholder="Cantidad"
          value={form.faCantidad}
          onChange={handleChange}
          style={styles.input}
          required
        />
        {editingFactura ? (
          <button
            onClick={handleEditFactura}
            style={{ ...styles.button, backgroundColor: 'blue' }}
          >
            Actualizar Factura
          </button>
        ) : (
          <button
            onClick={handleCreateFactura}
            style={{ ...styles.button, backgroundColor: 'green' }}
          >
            Agregar Factura
          </button>
        )}
      </div>

      <h2 style={styles.subTitle}>Lista de Facturas</h2>
      <ul style={styles.list}>
        {facturas.length > 0 ? (
          facturas.map(factura => (
            factura && factura._id ? (
              <li key={factura._id} style={styles.card}>
                <strong>Número:</strong> {factura.facNumero || 'N/A'}<br />
                <strong>Producto:</strong> {factura.facProductoId || 'N/A'}<br />
                <strong>Cantidad:</strong> {factura.faCantidad || 'N/A'}<br />
                <strong>ValorTotal:</strong>{factura.valorTotal || 'N/A'}<br />
                <button
                  onClick={() => setEditingFactura(factura)}
                  style={{ ...styles.button, backgroundColor: 'blue' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteFactura(factura._id)}
                  style={{ ...styles.button, backgroundColor: 'red' }}
                >
                  Eliminar
                </button>
              </li>
            ) : (
              <li key="no-factura" style={styles.card}>
                Factura inválida
              </li>
            )
          ))
        ) : (
          <li style={styles.card}>No hay facturas disponibles</li>
        )}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2em',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  subTitle: {
    fontSize: '1.5em',
    marginBottom: '10px',
    color: '#333',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    margin: '10px 0',
    fontSize: '1em',
    borderRadius: '4px',
    border: '1px solid #ddd',
    width: '100%',
    maxWidth: '300px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    marginBottom: '10px',
    position: 'relative',
  },
};

export default FacturasPage;
