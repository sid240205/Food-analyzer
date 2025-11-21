import { connectDB } from "../../../utils/db";

export async function GET() {
  try {
    const db = await connectDB();
    const result = await db.collection("orders").deleteMany({});
    
    return Response.json({ 
      success: true,
      deleted: result.deletedCount,
      message: `Deleted ${result.deletedCount} orders. Database is now clear.`
    });
  } catch (error) {
    console.error("Clear error:", error);
    return Response.json({ 
      error: error.message,
      message: "Failed to clear database"
    }, { status: 500 });
  }
}