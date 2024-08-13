import clientPromise from "@/lib/mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const handler = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { dDocumento, dNombre, dDireccion, dTelefono, dCorreo } = req.body;

      if (!dDocumento || !dNombre || !dDireccion || !dTelefono || !dCorreo) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const client = await clientPromise;
      const db = client.db("sena");
      const collection = db.collection("clientes");

      const result = await collection.insertOne({
        dDocumento,
        dNombre,
        dDireccion,
        dTelefono,
        dCorreo,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;

