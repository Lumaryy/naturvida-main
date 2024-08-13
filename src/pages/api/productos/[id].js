import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

async function handler(req, res) {
  const { id } = req.query;

  // Validar el parámetro ID
  if (typeof id !== "string") {
    return res.status(400).json({ message: "Formato de ID inválido" });
  }

  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("sena");
      const collection = db.collection("productos");

      const product = await collection.findOne({ _id: new ObjectId(id) });

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.status(200).json({ product });
    } catch (error) {
      console.error("Error de conexión a la base de datos:", error);
      res.status(500).json({ error: "Error al conectar con la base de datos" });
    }
  } else if (req.method === "PUT") {
    try {
      const { proCodigo, proDescripcion, proValor, proCantidad } = req.body;

      // Validación básica de campos requeridos
      if (
        proCodigo === undefined ||
        proDescripcion === undefined ||
        proValor === undefined ||
        proCantidad === undefined
      ) {
        return res.status(400).json({
          message:
            "proCodigo, proDescripcion, proValor y proCantidad son requeridos",
        });
      }

      const client = await clientPromise;
      const db = client.db("sena");
      const collection = db.collection("productos");

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { proCodigo, proDescripcion, proValor, proCantidad } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.status(200).json({ message: "Producto actualizado con éxito", result });
    } catch (error) {
      console.error("Error de conexión a la base de datos:", error);
      res.status(500).json({ error: "Error al conectar con la base de datos" });
    }
  } else if (req.method === "DELETE") {
    try {
      const client = await clientPromise;
      const db = client.db("sena");
      const collection = db.collection("productos");

      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.status(204).end(); // Sin contenido
    } catch (error) {
      console.error("Error de conexión a la base de datos:", error);
      res.status(500).json({ error: "Error al conectar con la base de datos" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}

export default authMiddleware(handler);

