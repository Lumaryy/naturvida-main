// src/app/layout.js
"use client";

import { CartProvider } from '../context/CarritoContext';

export default function RootLayout({ children }) {
  return (
    <CartProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </CartProvider>
  );
}
