import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

async function handler(req, res) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const client = await clientPromise;
  const db = client.db("sena");

  if (req.method === "GET") {
    try {
      const collection = db.collection("facturas");
      const factura = await collection.findOne({ _id: new ObjectId(id) });

      if (!factura) {
        return res.status(404).json({ message: "Factura not found" });
      }

      res.status(200).json(factura);
    } catch (error) {
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else if (req.method === "PUT") {
    try {
      const {
        facNumero,
        facFecha,
        facCliente,
        facValorTotal,
        facVendedor,
        detalles,
      } = req.body;

      // Validación básica de campos requeridos
      if (!facNumero || !facFecha || !facCliente || !facValorTotal || !facVendedor) {
        return res.status(400).json({ message: "All fields are required" });
      }

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
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            facNumero,
            facFecha,
            facCliente,
            facValorTotal,
            facVendedor,
            detalles,
          },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Factura not found" });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else if (req.method === "DELETE") {
    try {
      const collection = db.collection("facturas");
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Factura not found" });
      }

      res.status(204).end(); // No content
    } catch (error) {
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authMiddleware(handler);
