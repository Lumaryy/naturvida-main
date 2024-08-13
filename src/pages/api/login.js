import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { username, password } = req.body;
  const client = await clientPromise;
  const db = client.db("sena");
  const collection = db.collection("vendedores");

  const user = await collection.findOne({ venUsuario: username });

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  if (username !== user.venUsuario) {
    return res.status(401).json({ message: "Usuario o contraseña inválidos" });
  }

  const passwordIsValid = await bcrypt.compare(password, user.venContrasena);

  if (!passwordIsValid) {
    return res.status(401).json({ message: "Usuario o contraseña inválidos" });
  }

  const token = jwt.sign({ userId: user._id }, "your-secret-key", {
    expiresIn: "24h",
  });

  res.status(200).json({ token });
}
