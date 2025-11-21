import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { connectDB } from "../../../utils/db";

export async function GET() {
  try {
    // Fetch data from database
    const db = await connectDB();
    const orders = await db.collection("orders").find().sort({ date: -1 }).toArray();

    // Check if we have any orders
    if (orders.length === 0) {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 400]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      page.drawText("No Orders Found", {
        x: 50,
        y: 300,
        size: 20,
        font: font
      });
      
      page.drawText("Please sync your Gmail first to fetch orders.", {
        x: 50,
        y: 270,
        size: 12,
        font: font
      });
      
      const pdfBytes = await pdfDoc.save();
      return new Response(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=no-data.pdf"
        }
      });
    }

    // Create PDF with data
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page1 = pdfDoc.addPage([600, 800]);
    const { width, height } = page1.getSize();

    // Header
    page1.drawText("Food Spending Report", {
      x: 50,
      y: height - 50,
      size: 22,
      font: boldFont,
      color: rgb(0.937, 0.267, 0.267)
    });

    page1.drawText(`Generated: ${new Date().toLocaleDateString('en-IN')}`, {
      x: 50,
      y: height - 75,
      size: 10,
      font: font
    });

    // Stats
    const totalSpent = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalOrders = orders.length;
    const avgOrder = totalSpent / totalOrders;
    const zomato = orders.filter(o => o.source === "zomato").length;
    const swiggy = orders.filter(o => o.source === "swiggy").length;

    let yPos = height - 110;
    page1.drawText("Summary", { x: 50, y: yPos, size: 16, font: boldFont });
    
    yPos -= 25;
    const stats = [
      `Total Orders: ${totalOrders} (Zomato: ${zomato}, Swiggy: ${swiggy})`,
      `Total Spent: ₹${totalSpent.toFixed(2)}`,
      `Average Order: ₹${avgOrder.toFixed(2)}`
    ];

    stats.forEach(stat => {
      page1.drawText(stat, { x: 70, y: yPos, size: 11, font: font });
      yPos -= 20;
    });

    // Top Restaurants
    yPos -= 20;
    page1.drawText("Top Restaurants", { x: 50, y: yPos, size: 16, font: boldFont });
    
    const restaurants = {};
    orders.forEach(o => {
      const name = o.restaurant || "Unknown";
      restaurants[name] = (restaurants[name] || 0) + (o.amount || 0);
    });

    const topRest = Object.entries(restaurants)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    yPos -= 20;
    topRest.forEach(([name, amt], idx) => {
      page1.drawText(`${idx + 1}. ${name.substring(0, 30)}`, {
        x: 70,
        y: yPos,
        size: 10,
        font: font
      });
      page1.drawText(`₹${amt.toFixed(2)}`, {
        x: 450,
        y: yPos,
        size: 10,
        font: boldFont
      });
      yPos -= 16;
    });

    // Order History
    const page2 = pdfDoc.addPage([600, 800]);
    yPos = height - 50;

    page2.drawText("Order History", { x: 50, y: yPos, size: 18, font: boldFont });
    yPos -= 30;

    // Headers
    page2.drawText("Date", { x: 50, y: yPos, size: 9, font: boldFont });
    page2.drawText("Restaurant", { x: 130, y: yPos, size: 9, font: boldFont });
    page2.drawText("Source", { x: 350, y: yPos, size: 9, font: boldFont });
    page2.drawText("Amount", { x: 480, y: yPos, size: 9, font: boldFont });
    yPos -= 20;

    const recent = orders.slice(0, 35);
    recent.forEach(order => {
      if (yPos < 50) return;
      
      const date = new Date(order.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      });

      page2.drawText(date, { x: 50, y: yPos, size: 8, font: font });
      page2.drawText((order.restaurant || "?").substring(0, 28), {
        x: 130,
        y: yPos,
        size: 8,
        font: font
      });
      page2.drawText((order.source || "?").toUpperCase(), {
        x: 350,
        y: yPos,
        size: 7,
        font: boldFont,
        color: order.source === "swiggy" ? rgb(1, 0.5, 0) : rgb(0.937, 0.267, 0.267)
      });
      page2.drawText(`₹${(order.amount || 0).toFixed(2)}`, {
        x: 480,
        y: yPos,
        size: 8,
        font: boldFont
      });

      yPos -= 15;
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=report-${new Date().toISOString().split('T')[0]}.pdf`
      }
    });

  } catch (error) {
    console.error("PDF error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
