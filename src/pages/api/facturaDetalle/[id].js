import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

async function handler(req, res) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("sena");
      const detalleCollection = db.collection("facturaDetalles");
      const productoCollection = db.collection("productos");

      // Obtener detalle específico
      const detalle = await detalleCollection.findOne({ _id: new ObjectId(id) });

      if (!detalle) {
        return res.status(404).json({ message: "FacturaDetalle not found" });
      }

      // Obtener producto relacionado
      const producto = await productoCollection.findOne({ _id: new ObjectId(detalle.facProductoId) });

      res.status(200).json({ ...detalle, producto });
    } catch (error) {
      console.error("Error connecting to the database:", error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else if (req.method === "PUT") {
    try {
      const { facNumero, facProductoId, faCantidad } = req.body;

      if (!facNumero || !facProductoId || faCantidad === undefined) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const client = await clientPromise;
      const db = client.db("sena");
      const detalleCollection = db.collection("facturaDetalles");
      const productoCollection = db.collection("productos");

      // Obtener el detalle actual antes de la actualización
      const detalleActual = await detalleCollection.findOne({ _id: new ObjectId(id) });
      if (!detalleActual) {
        return res.status(404).json({ message: "FacturaDetalle not found" });
      }

      // Calcular la diferencia en cantidad
      const diferenciaCantidad = detalleActual.faCantidad - faCantidad;

      // Actualizar la cantidad del producto
      await productoCollection.updateOne(
        { _id: new ObjectId(facProductoId) },
        { $inc: { proCantidad: diferenciaCantidad } }
      );

      // Actualizar el detalle de la factura
      const result = await detalleCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            facNumero,
            facProductoId,
            faCantidad,
          },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "FacturaDetalle not found" });
      }

      res.status(200).json({ message: "FacturaDetalle updated successfully", result });
    } catch (error) {
      console.error("Error connecting to the database:", error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else if (req.method === "DELETE") {
    try {
      const client = await clientPromise;
      const db = client.db("sena");
      const detalleCollection = db.collection("facturaDetalles");
      const productoCollection = db.collection("productos");

      // Obtener el detalle antes de eliminarlo
      const detalle = await detalleCollection.findOne({ _id: new ObjectId(id) });
      if (!detalle) {
        return res.status(404).json({ message: "FacturaDetalle not found" });
      }

      // Sumar la cantidad del detalle al producto correspondiente
      await productoCollection.updateOne(
        { _id: new ObjectId(detalle.facProductoId) },
        { $inc: { proCantidad: detalle.faCantidad } }
      );

      // Eliminar el detalle
      const result = await detalleCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "FacturaDetalle not found" });
      }

      res.status(204).end(); // No content
    } catch (error) {
      console.error("Error connecting to the database:", error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authMiddleware(handler);
