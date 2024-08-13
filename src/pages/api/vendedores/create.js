import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const SALT_ROUNDS = 10;

async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { venUsuario, venContrasena } = req.body;

      if (!venUsuario || !venContrasena) {
        return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
      }

      const client = await clientPromise;
      const db = client.db("sena");
      const collection = db.collection("vendedores");

      // Verificar si el usuario ya existe
      const existingUser = await collection.findOne({ venUsuario });
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(venContrasena, SALT_ROUNDS);

      // Insertar el nuevo vendedor
      const result = await collection.insertOne({
        venUsuario,
        venContrasena: hashedPassword,
      });

      res.status(201).json({
        message: "Vendedor creado exitosamente",
        insertedId: result.insertedId,
      });
    } catch (error) {
      console.error("Error connecting to the database:", error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
