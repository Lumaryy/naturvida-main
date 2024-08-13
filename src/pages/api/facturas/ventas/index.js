import clientPromise from "@/lib/mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("sena");
      
      const facturas = await db.collection('facturas').aggregate([
        {
          $lookup: {
            from: 'clientes',
            localField: 'facCliente',
            foreignField: '_id',
            as: 'cliente'
          }
        },
        {
          $unwind: '$cliente'
        },
        {
          $lookup: {
            from: 'vendedores',
            localField: 'facVendedor',
            foreignField: '_id',
            as: 'vendedor'
          }
        },
        {
          $unwind: '$vendedor'
        },
        {
          $project: {
            _id: 0,
            facCodigo: 1,
            facValor: 1,
            'cliente.cliCedula': 1,
            'cliente.cliNombre': 1,
            'vendedor.venNombre': 1
          }
        }
      ]).toArray();

      res.status(200).json(facturas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
