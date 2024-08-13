import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";

// Función para generar un token con un tiempo de expiración
export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' }); 
};

// Función para verificar el token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
