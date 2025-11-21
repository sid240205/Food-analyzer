import { MongoClient } from "mongodb";

let client = null;
let db = null;

export async function connectDB() {
  try {
    if (db) {
      return db;
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    if (!client) {
      client = new MongoClient(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    await client.connect();
    db = client.db("zomato_analyzer");

    // Create indexes for better performance
    await db.collection("orders").createIndex({ emailId: 1 }, { unique: true });
    await db.collection("orders").createIndex({ date: -1 });
    await db.collection("orders").createIndex({ restaurant: 1 });

    console.log("✅ MongoDB connected successfully");
    return db;

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  }
});