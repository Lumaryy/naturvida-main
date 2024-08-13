import clientPromise from "@/lib/mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const handler = async (req, res) => {
  const client = await clientPromise;
  const db = client.db("sena");

  if (req.method === "GET") {
    try {
      const clientes = await db.collection("clientes").find({}).toArray();
      res.status(200).json(clientes);
    } catch (error) {
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
