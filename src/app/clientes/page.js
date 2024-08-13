"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    dDocumento: '',
    dNombre: '',
    dDireccion: '',
    dTelefono: '',
    dCorreo: ''
  });
  const [editingCliente, setEditingCliente] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchClientes = async () => {
      try {
        const response = await fetch('/api/clientes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setClientes(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchClientes();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCreateCliente = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/clientes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newCliente = await response.json();
      setClientes([...clientes, newCliente]);
      setFormData({
        dDocumento: '',
        dNombre: '',
        dDireccion: '',
        dTelefono: '',
        dCorreo: ''
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateCliente = async (e) => {
    e.preventDefault();
    if (!editingCliente) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/clientes/${editingCliente._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedCliente = await response.json();
      setClientes(clientes.map(cliente => cliente._id === updatedCliente._id ? updatedCliente : cliente));
      setEditingCliente(null);
      setFormData({
        dDocumento: '',
        dNombre: '',
        dDireccion: '',
        dTelefono: '',
        dCorreo: ''
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteCliente = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setClientes(clientes.filter(cliente => cliente._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditCliente = (cliente) => {
    setFormData(cliente);
    setEditingCliente(cliente);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Clientes</h1>
      {error && <p style={styles.error}>Error: {error}</p>}
      <ul style={styles.list}>
        {clientes.length > 0 ? (
          clientes.map(cliente => (
            <li key={cliente._id} style={styles.card}>
              <p><strong>Nombre:</strong> {cliente.dNombre}</p>
              <p><strong>Documento:</strong> {cliente.dDocumento}</p>
              <p><strong>Dirección:</strong> {cliente.dDireccion}</p>
              <p><strong>Teléfono:</strong> {cliente.dTelefono}</p>
              <p><strong>Correo:</strong> {cliente.dCorreo}</p>
              <button style={styles.button} onClick={() => handleEditCliente(cliente)}>Editar</button>
              <button style={styles.deleteButton} onClick={() => handleDeleteCliente(cliente._id)}>Eliminar</button>
            </li>
          ))
        ) : (
          <li style={styles.emptyMessage}>No hay clientes disponibles</li>
        )}
      </ul>

      <h2 style={styles.subTitle}>{editingCliente ? 'Actualizar Cliente' : 'Agregar Cliente'}</h2>
      <form 
        onSubmit={(e) => { e.preventDefault(); editingCliente ? handleUpdateCliente(e) : handleCreateCliente(e); }} 
        style={styles.form}
      >
        <input
          type="text"
          name="dDocumento"
          placeholder="Documento"
          value={formData.dDocumento}
          onChange={handleInputChange}
          style={styles.input}
        />
        <input
          type="text"
          name="dNombre"
          placeholder="Nombre"
          value={formData.dNombre}
          onChange={handleInputChange}
          style={styles.input}
        />
        <input
          type="text"
          name="dDireccion"
          placeholder="Dirección"
          value={formData.dDireccion}
          onChange={handleInputChange}
          style={styles.input}
        />
        <input
          type="text"
          name="dTelefono"
          placeholder="Teléfono"
          value={formData.dTelefono}
          onChange={handleInputChange}
          style={styles.input}
        />
        <input
          type="email"
          name="dCorreo"
          placeholder="Correo"
          value={formData.dCorreo}
          onChange={handleInputChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          {editingCliente ? 'Actualizar Cliente' : 'Agregar Cliente'}
        </button>
      </form>
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
  list: {
    listStyleType: 'none',
    padding: '0',
  },
  card: {
    backgroundColor: '#fff',
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  },
  cardHover: {
    transform: 'scale(1.05)',
  },
  emptyMessage: {
    color: '#555',
    textAlign: 'center',
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
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1em',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#0070f3',
    color: '#fff',
    fontSize: '1em',
    cursor: 'pointer',
    marginTop: '10px',
  },
  deleteButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    fontSize: '1em',
    cursor: 'pointer',
    marginTop: '10px',
    marginLeft: '10px',
  },
};

export default ClientesPage;
