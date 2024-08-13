"use client";
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/context/CarritoContext';
 

const ProductosPage = () => {
  const [productos, setProductos] = useState([]);
  const [newProduct, setNewProduct] = useState({
    proCodigo: '',
    proDescripcion: '',
    proValor: '',
    proCantidad: '',
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);
  const { cartItems, setCartItems, addToCart } = useCart(); // Asegúrate de usar el contexto correctamente

  useEffect(() => {
    const fetchProductos = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login'; // Redirige si no hay token
        return;
      }

      try {
        const response = await fetch('/api/productos', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProductos(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProductos();
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cart);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = (name === 'proValor' || name === 'proCantidad') ? parseFloat(value) || 0 : value;
    if (editingProduct) {
      setEditingProduct(prevState => ({
        ...prevState,
        [name]: parsedValue,
      }));
    } else {
      setNewProduct(prevState => ({
        ...prevState,
        [name]: parsedValue,
      }));
    }
  };

  const handleAddProduct = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirige si no hay token
      return;
    }

    try {
      const response = await fetch('/api/productos/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setProductos(prev => [...prev, data.product]);
      setNewProduct({
        proCodigo: '',
        proDescripcion: '',
        proValor: '',
        proCantidad: '',
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditProduct = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirige si no hay token
      return;
    }

    try {
      const response = await fetch(`/api/productos/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editingProduct),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedProduct = await response.json();
      setProductos(prev => prev.map(p => (p._id === updatedProduct._id ? updatedProduct : p)));
      setEditingProduct(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirige si no hay token
      return;
    }

    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setProductos(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
   // alert(`${product.proDescripcion} agregado al carrito.`);
  };

  const handleToggleCart = () => {
    setCartVisible(!cartVisible);
  };

  return (
    <div style={styles.container}>
      <div style={styles.cartIcon} onClick={handleToggleCart}>
        <FontAwesomeIcon icon={faShoppingCart} size="2x" />
        <span style={styles.cartCount}>{cartItems.length}</span>
      </div>

      {cartVisible && (
        <div style={styles.cartModal}>
          <h2 style={styles.subTitle}>Carrito de Compras</h2>
          {cartItems.length > 0 ? (
            <ul style={styles.list}>
              {cartItems.map((item, index) => (
                <li key={index} style={styles.card}>
                  <strong>{item.proDescripcion}</strong><br />
                  Cantidad: {item.proCantidad}<br />
                  Valor: {item.proValor}
                </li>
              ))}
            </ul>
          ) : (
            <p>El carrito está vacío.</p>
          )}
          <button onClick={handleToggleCart} style={{ ...styles.button, backgroundColor: 'red' }}>
            Cerrar
          </button>
        </div>
      )}

      <h1 style={styles.title}>Productos</h1>
      {error && <p style={styles.error}>Error: {error}</p>}

      <h2 style={styles.subTitle}>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</h2>
      <div style={styles.form}>
        <input
          type="text"
          name="proCodigo"
          placeholder="Código"
          value={editingProduct ? editingProduct.proCodigo : newProduct.proCodigo}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="proDescripcion"
          placeholder="Descripción"
          value={editingProduct ? editingProduct.proDescripcion : newProduct.proDescripcion}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="number"
          name="proValor"
          placeholder="Valor"
          value={editingProduct ? editingProduct.proValor : newProduct.proValor}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="number"
          name="proCantidad"
          placeholder="Cantidad"
          value={editingProduct ? editingProduct.proCantidad : newProduct.proCantidad}
          onChange={handleChange}
          style={styles.input}
        />
        {editingProduct ? (
          <button
            onClick={handleEditProduct}
            style={{ ...styles.button, backgroundColor: 'blue' }}
          >
            Actualizar Producto
          </button>
        ) : (
          <button
            onClick={handleAddProduct}
            style={{ ...styles.button, backgroundColor: 'green' }}
          >
            Agregar Producto
          </button>
        )}
      </div>

      <h2 style={styles.subTitle}>Lista de Productos</h2>
      <ul style={styles.list}>
        {productos.length > 0 ? (
          productos.map(producto => (
            producto && producto._id ? (
              <li key={producto._id} style={styles.card}>
                <strong>Código:</strong> {producto.proCodigo || 'N/A'}<br />
                <strong>Descripción:</strong> {producto.proDescripcion || 'N/A'}<br />
                <strong>Valor:</strong> {producto.proValor || 'N/A'}<br />
                <strong>Cantidad:</strong> {producto.proCantidad || 'N/A'}
                <div>
                  <button
                    onClick={() => handleEditProduct(producto)}
                    style={{ ...styles.button, backgroundColor: 'blue' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(producto._id)}
                    style={{ ...styles.button, backgroundColor: 'red' }}
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => handleAddToCart(producto)}
                    style={{ ...styles.button, backgroundColor: 'orange' }}
                  >
                    Añadir al Carrito
                  </button>
                </div>
              </li>
            ) : null
          ))
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  subTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  form: {
    marginBottom: '20px',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '5px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    marginRight: '10px',
    marginTop: '10px',
  },
  cartIcon: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  cartCount: {
    marginLeft: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  cartModal: {
    position: 'fixed',
    top: '50px',
    right: '20px',
    width: '300px',
    padding: '20px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    zIndex: '1000',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
    margin: '0',
  },
  card: {
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  error: {
    color: 'red',
    fontSize: '16px',
  },
};


export default ProductosPage;
