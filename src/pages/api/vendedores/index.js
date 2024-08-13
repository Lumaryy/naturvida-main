import clientPromise from "@/lib/mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const handler = async (req, res) => {
  const client = await clientPromise;
  const db = client.db("sena");

  if (req.method === "GET") {
    try {
      const vendedores = await db.collection("vendedores").find({}).toArray();
      res.status(200).json(vendedores);
    } catch (error) {
      console.error("Error fetching vendedores", error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default authMiddleware(handler);
