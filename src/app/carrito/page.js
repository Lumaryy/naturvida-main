"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  const handleRemove = (productId) => {
    const updatedCart = cart.filter(product => product.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      // Iterar sobre el carrito para generar las facturas
      for (const product of cart) {
        const facturaData = {
          facNumero: `FACT-${Date.now()}`,  // Generar un número de factura único
          facProductoId: product.id,
          faCantidad: product.quantity,
        };

        const response = await fetch('/api/facturaDetalle/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(facturaData),
        });

        if (!response.ok) {
          throw new Error(`Error al crear la factura: ${response.statusText}`);
        }
      }

      // Limpiar el carrito después de generar las facturas
      setCart([]);
      localStorage.removeItem('cart');

      // Redirigir a la página de detalle de facturas
      router.push('/facturaDetalle');
    } catch (error) {
      alert(`Error al proceder al pago: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Carrito de Compras</h1>
      <ul>
        {cart.length > 0 ? (
          cart.map(product => (
            <li key={product.id}>
              <strong>{product.name}</strong> - {product.quantity} x ${product.price}
              <button onClick={() => handleRemove(product.id)}>Eliminar</button>
            </li>
          ))
        ) : (
          <p>No hay productos en el carrito.</p>
        )}
      </ul>
      <button onClick={handleCheckout}>Proceder al Pago</button>
    </div>
  );
};

export default CartPage;
