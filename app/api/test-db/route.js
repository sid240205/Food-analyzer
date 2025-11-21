import { connectDB } from "../../../utils/db";

export async function GET() {
  try {
    const db = await connectDB();
    const count = await db.collection("orders").countDocuments();
    
    return Response.json({ 
      success: true,
      message: "MongoDB connected!",
      ordersInDatabase: count
    });
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}