"use client";

import { useState, useEffect } from 'react';

const VendedoresPage = () => {
  const [vendedores, setVendedores] = useState([]);
  const [newVendedor, setNewVendedor] = useState({
    venUsuario: '',
    venContrasena: '',
  });
  const [editingVendedor, setEditingVendedor] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendedores = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login'; // Redirige si no hay token
        return;
      }

      try {
        const response = await fetch('/api/vendedores', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setVendedores(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchVendedores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editingVendedor) {
      setEditingVendedor(prevState => ({
        ...prevState,
        [name]: value,
      }));
    } else {
      setNewVendedor(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleAddVendedor = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirige si no hay token
      return;
    }

    try {
      const response = await fetch('/api/vendedores/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newVendedor),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setVendedores(prev => [...prev, data]);
      setNewVendedor({
        venUsuario: '',
        venContrasena: '',
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditVendedor = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirige si no hay token
      return;
    }

    try {
      const response = await fetch(`/api/vendedores/${editingVendedor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editingVendedor),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedVendedor = await response.json();
      setVendedores(prev => prev.map(v => (v._id === updatedVendedor._id ? updatedVendedor : v)));
      setEditingVendedor(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteVendedor = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirige si no hay token
      return;
    }

    try {
      const response = await fetch(`/api/vendedores/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setVendedores(prev => prev.filter(v => v._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Vendedores</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <h2>{editingVendedor ? 'Editar Vendedor' : 'Agregar Vendedor'}</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          name="venUsuario"
          placeholder="Usuario"
          value={editingVendedor ? editingVendedor.venUsuario : newVendedor.venUsuario}
          onChange={handleChange}
          style={{ margin: '5px', padding: '5px' }}
        />
        <input
          type="password"
          name="venContrasena"
          placeholder="Contraseña"
          value={editingVendedor ? editingVendedor.venContrasena : newVendedor.venContrasena}
          onChange={handleChange}
          style={{ margin: '5px', padding: '5px' }}
        />
        {editingVendedor ? (
          <button
            onClick={handleEditVendedor}
            style={{ margin: '5px', padding: '10px', backgroundColor: 'blue', color: 'white' }}
          >
            Actualizar Vendedor
          </button>
        ) : (
          <button
            onClick={handleAddVendedor}
            style={{ margin: '5px', padding: '10px', backgroundColor: 'green', color: 'white' }}
          >
            Agregar Vendedor
          </button>
        )}
      </div>

      <h2>Lista de Vendedores</h2>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {vendedores.length > 0 ? (
          vendedores.map(vendedor => (
            vendedor && vendedor._id && (
              <li key={vendedor._id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
                <strong>Usuario:</strong> {vendedor.venUsuario}<br />
                <strong>Contraseña:</strong> {vendedor.venContrasena}<br />
                <button
                  onClick={() => setEditingVendedor(vendedor)}
                  style={{ margin: '5px', padding: '5px', backgroundColor: 'blue', color: 'white' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteVendedor(vendedor._id)}
                  style={{ margin: '5px', padding: '5px', backgroundColor: 'red', color: 'white' }}
                >
                  Eliminar
                </button>
              </li>
            )
          ))
        ) : (
          <li>No hay vendedores disponibles</li>
        )}
      </ul>
    </div>
  );
};

export default VendedoresPage;
