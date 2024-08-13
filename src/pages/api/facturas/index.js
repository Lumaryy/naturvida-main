import clientPromise from "@/lib/mongodb";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const handler = async (req, res) => {
  const client = await clientPromise;
  const db = client.db("sena");

  if (req.method === "GET") {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);

      if (isNaN(pageNumber) || isNaN(pageSize)) {
        return res.status(400).json({ message: "Invalid page or limit parameter" });
      }

      const skip = (pageNumber - 1) * pageSize;
      const facturas = await db.collection("facturas")
        .find({})
        .skip(skip)
        .limit(pageSize)
        .toArray();

      const total = await db.collection("facturas").countDocuments();
      const totalPages = Math.ceil(total / pageSize);

      res.status(200).json({
        facturas,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total,
          totalPages,
        },
      });
    } catch (error) {
      console.error("Error fetching facturas", error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;

