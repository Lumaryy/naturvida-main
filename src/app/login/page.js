"use client";

import { useState } from 'react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('credenciales incorrectas');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // Guarda el token en localStorage
      window.location.href = '/inicio'; // Redirige a la página de inicio
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>
      {error && <p style={styles.error}>Error: {error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Usuario:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Contraseña:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </label>
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
  },
  title: {
    fontSize: '2.5em',
    marginBottom: '20px',
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  label: {
    width: '100%',
    marginBottom: '15px',
    color: '#333',
  },
 

  input: {
    width: '100%',
    padding: '10px',
    fontSize: '1em',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '5px',
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
};

export default LoginPage;
