// src/lib/mongodb.js
const { MongoClient } = require("mongodb");

// URL de conexión a MongoDB (reemplázala con la tuya)
const uri = "mongodb://localhost:27017/sena";
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // En desarrollo, usa un cliente MongoDB persistente para habilitar la recarga rápida.
  if (global._mongoClientPromise) {
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
    clientPromise = global._mongoClientPromise;
  }
} else {
  // En producción, no reutilices la conexión entre invocaciones.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

module.exports = clientPromise;
