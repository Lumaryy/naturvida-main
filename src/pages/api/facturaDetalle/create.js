import clientPromise from "@/lib/mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";
import { ObjectId } from "mongodb";

async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { facNumero, facProductoId, faCantidad } = req.body;


      if (!facNumero || !facProductoId || faCantidad === undefined) {
        return res.status(400).json({ message: "All fields are required" });
      }

    
      const client = await clientPromise;
      const db = client.db("sena");
      const facturaDetallesCollection = db.collection("facturaDetalles");
      const productosCollection = db.collection("productos");

      //! Buscar el producto por facProductoId
      const producto = await productosCollection.findOne({ _id: new ObjectId(facProductoId) });

      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      //! Calcular la nueva cantidad
      const nuevaCantidad = producto.proCantidad - faCantidad;

      //! Verificar si la cantidad es válida (no negativa)
      if (nuevaCantidad < 0) {
        return res.status(400).json({ message: "No hay suficiente stock disponible" });
      }


      await productosCollection.updateOne(
        { _id: new ObjectId(facProductoId) },
        { $set: { proCantidad: nuevaCantidad } }
      );

  
      const result = await facturaDetallesCollection.insertOne({
        facNumero,
        facProductoId,
        faCantidad,
      });

      res.status(201).json({
        message: "FacturaDetalle created successfully",
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

export default authMiddleware(handler);
