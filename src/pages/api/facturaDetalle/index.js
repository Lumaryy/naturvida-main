import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("sena");
      const facturaDetalleCollection = db.collection("facturaDetalles");
      const productoCollection = db.collection("productos");


      const facturaDetalles = await facturaDetalleCollection.find({}).toArray();
      console.log("Factura Detalles:", facturaDetalles);


      let productoIds;
      try {
        productoIds = facturaDetalles.map(detalle => new ObjectId(detalle.facProductoId));
        console.log("Producto IDs:", productoIds);
      } catch (conversionError) {
        console.error("Error convirtiendo facProductoId a ObjectId:", conversionError);
        return res.status(500).json({ error: "Error convirtiendo facProductoId a ObjectId" });
      }

      let productos;
      try {
        productos = await productoCollection.find({ _id: { $in: productoIds } }).toArray();
        console.log("Productos:", productos);
      } catch (queryError) {
        console.error("Error en la consulta de productos:", queryError);
        return res.status(500).json({ error: "Error en la consulta de productos" });
      }

      const detalleConProductos = facturaDetalles.map(detalle => {
        const producto = productos.find(p => p._id.toString() === detalle.facProductoId.toString());

        if (!producto) {
          console.error(`Producto con ID ${detalle.facProductoId} no encontrado`);
          return {
            ...detalle,
            producto: null,
            valorTotal: null,
          };
        }


        if (typeof producto.proValor !== 'number') {
          console.error(`El producto con ID ${detalle.facProductoId} no tiene un campo 'proValor' válido`);
          return {
            ...detalle,
            producto,
            valorTotal: null,
          };
        }

        //!VALOR TOTAL
        const valorTotal = detalle.faCantidad * producto.proValor;
        return {
          ...detalle,
          producto,
          valorTotal,
        };
      });

      console.log("Detalles con Productos:", detalleConProductos);
      res.status(200).json(detalleConProductos);
    } catch (error) {
      console.error("Error en la conexión a la base de datos:", error);
      res.status(500).json({ error: "Error en la conexión a la base de datos" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
