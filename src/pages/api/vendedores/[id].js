import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const SALT_ROUNDS = 10;

async function handler(req, res) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (req.method === "PUT") {
    try {
      const { venUsuario, venContrasena } = req.body;

      if (!venUsuario || !venContrasena) {
        return res
          .status(400)
          .json({ message: "Name, email, and phone are required" });
      }

      const client = await clientPromise;
      const db = client.db("sena");
      const collection = db.collection("vendedores");

      const hashedPassword = await bcrypt.hash(venContrasena, SALT_ROUNDS);
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { venUsuario, venContrasena: hashedPassword } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Vendedor not found" });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else if (req.method === "DELETE") {
    // Lógica para eliminar
    try {
      const client = await clientPromise;
      const db = client.db("sena");
      const collection = db.collection("vendedores");

      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Vendedor not found" });
      }

      res.status(204).end(); // No content
    } catch (error) {
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authMiddleware(handler);
