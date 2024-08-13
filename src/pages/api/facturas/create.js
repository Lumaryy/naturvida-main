import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

async function handler(req, res) {
  if (req.method === "POST") {
    const { facNumero, facFecha, facCliente, facValorTotal, facVendedor, detalles } = req.body;

    if (!facNumero || !facFecha || !facCliente || !facValorTotal || !facVendedor) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const client = await clientPromise;
      const db = client.db("sena");

      // Validar que facCliente existe en la colección clientes
      const clienteCollection = db.collection("clientes");
      const clienteExists = await clienteCollection.findOne({ _id: new ObjectId(facCliente) });
      if (!clienteExists) {
        return res.status(400).json({ message: "Cliente does not exist" });
      }

      // Validar que facVendedor existe en la colección vendedores
      const vendedorCollection = db.collection("vendedores");
      const vendedorExists = await vendedorCollection.findOne({ _id: new ObjectId(facVendedor) });
      if (!vendedorExists) {
        return res.status(400).json({ message: "Vendedor does not exist" });
      }

      const collection = db.collection("facturas");
      const result = await collection.insertOne({
        facNumero,
        facFecha,
        facCliente,
        facValorTotal,
        facVendedor,
        detalles,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authMiddleware(handler);
