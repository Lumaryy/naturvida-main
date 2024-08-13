import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const { facProductoId } = req.query;

      if (!facProductoId) {
        return res.status(400).json({ message: "El parámetro facProductoId es requerido" });
      }

      const client = await clientPromise;
      const db = client.db("sena");

      // Buscar los detalles de factura por facProductoId
      const detallesFactura = await db.collection("facturaDetalles").find({ facProductoId }).toArray();

      if (detallesFactura.length === 0) {
        return res.status(404).json({ message: "No se encontraron detalles de factura para este número de factura" });
      }

      // Obtener los IDs de producto asociados a los detalles de la factura
      const productoIds = detallesFactura.map(detalle => detalle.facProducto);
      
      // Si los IDs de producto son ObjectId válidos, los convertimos
      const productos = await db.collection("productos").find({
        _id: { $in: productoIds.map(id => ObjectId.isValid(id) ? new ObjectId(id) : id) }
      }).toArray();

      res.status(200).json({ productos, detallesFactura });
    } catch (error) {
      console.error("Error al conectar con la base de datos:", error);
      res.status(500).json({ error: "Error al conectar con la base de datos" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
};

export default handler;
