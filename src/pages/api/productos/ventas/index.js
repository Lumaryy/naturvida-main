import clientPromise from "@/lib/mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const { vendedorId } = req.query;

      if (!vendedorId) {
        return res.status(400).json({ message: "vendedorId is required" });
      }

      const client = await clientPromise;
      const db = client.db("sena");

      // Obtener todas las facturas del vendedor específico
      const facturas = await db.collection("facturas").find({ facVendedor: vendedorId }).toArray();

      // Agrupar productos vendidos
      const productosVendidos = {};

      facturas.forEach(factura => {
        factura.detalles.forEach(detalle => {
          const { proCodigo, faCantidad } = detalle;
          if (!productosVendidos[proCodigo]) {
            productosVendidos[proCodigo] = { cantidadVendida: 0 };
          }
          productosVendidos[proCodigo].cantidadVendida += faCantidad;
        });
      });

      // Obtener información de los productos
      const productoCodigos = Object.keys(productosVendidos);
      const productos = await db.collection("productos").find({ proCodigo: { $in: productoCodigos } }).toArray();

      // Mapear productos con cantidad vendida
      const resultado = productos.map(producto => ({
        ...producto,
        cantidadVendida: productosVendidos[producto.proCodigo].cantidadVendida
      }));

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default authMiddleware(handler);

