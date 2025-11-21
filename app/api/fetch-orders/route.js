import { google } from "googleapis";
import { verifyToken } from "../../../utils/jwt";
import { connectDB } from "../../../utils/db";

/**
 * Extract ALL parts of email including nested multipart
 */
function extractAllEmailParts(payload) {
  let textParts = [];
  let htmlParts = [];
  
  function traverseParts(part) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      textParts.push(Buffer.from(part.body.data, "base64").toString());
    } else if (part.mimeType === "text/html" && part.body?.data) {
      htmlParts.push(Buffer.from(part.body.data, "base64").toString());
    }
    
    // Recursively check nested parts (multipart/alternative, multipart/related, etc.)
    if (part.parts) {
      part.parts.forEach(traverseParts);
    }
  }
  
  // Start traversal
  if (payload.body?.data) {
    if (payload.mimeType === "text/plain") {
      textParts.push(Buffer.from(payload.body.data, "base64").toString());
    } else if (payload.mimeType === "text/html") {
      htmlParts.push(Buffer.from(payload.body.data, "base64").toString());
    }
  }
  
  if (payload.parts) {
    payload.parts.forEach(traverseParts);
  }
  
  return {
    text: textParts.join("\n\n"),
    html: htmlParts.join("\n\n")
  };
}

/**
 * Extract text and structured data from HTML
 */
function parseHTML(html) {
  if (!html) return "";
  
  // Extract text from HTML tables (common in order emails)
  let text = html;
  
  // Convert table rows to text
  text = text.replace(/<tr[^>]*>/gi, "\n");
  text = text.replace(/<\/tr>/gi, "\n");
  text = text.replace(/<td[^>]*>/gi, " ");
  text = text.replace(/<\/td>/gi, " | ");
  text = text.replace(/<th[^>]*>/gi, " ");
  text = text.replace(/<\/th>/gi, " | ");
  
  // Convert breaks to newlines
  text = text.replace(/<br[^>]*>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n");
  
  // Remove style and script tags
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  
  // Convert HTML entities
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&#8377;/gi, "₹");
  text = text.replace(/&rsquo;/gi, "'");
  text = text.replace(/&hellip;/gi, "...");
  
  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, " ");
  text = text.replace(/ \| \|/g, " |");
  text = text.replace(/\|\s*\|/g, "|");
  text = text.replace(/\n\s*\n\s*\n/g, "\n\n");
  
  return text.trim();
}

/**
 * Enhanced parser for both platforms
 */
function parseOrderEmail(emailBody, emailDate) {
  const parsed = {
    amount: 0,
    restaurant: "Unknown",
    items: [],
    subtotal: 0,
    taxes: 0,
    deliveryFee: 0,
    discount: 0,
    date: new Date(emailDate),
    source: "unknown",
    rawText: emailBody
  };

  try {
    const lowerBody = emailBody.toLowerCase();
    const isSwiggy = lowerBody.includes("swiggy");
    const isZomato = lowerBody.includes("zomato");

    if (isSwiggy) {
      parsed.source = "swiggy";

      // Restaurant patterns for Swiggy
      const restaurantPatterns = [
        /order\s+(?:from|at)\s+([A-Z][^<>\n]{2,60}?)(?:\s+(?:was|has|is|delivered)|[.!]|\n)/i,
        /delivered\s+(?:from|by)\s+([A-Z][^<>\n]{2,60}?)(?:[.!]|\n)/i,
        /restaurant[:\s]+([^<>\n]{3,60}?)(?:[.!]|\n)/i,
        />([A-Z][A-Za-z\s&',.-]{3,50})<\/(?:b|strong|h\d)>/i,
        /from\s+<[^>]*>([^<]{3,50})<\//i
      ];
      
      for (const pattern of restaurantPatterns) {
        const match = emailBody.match(pattern);
        if (match && match[1]) {
          let name = match[1].trim().replace(/\s+/g, " ");
          name = name.replace(/\s+(was|has|is|delivered|successfully).*$/i, "");
          if (name.length >= 3 && name.length <= 60) {
            parsed.restaurant = name;
            break;
          }
        }
      }

      // Amount patterns - COMPREHENSIVE
      const amountPatterns = [
        // Standard formats
        /(?:Total|Grand\s*Total|Bill\s*Total|Amount\s*Paid|You\s*Paid|Paid)[:\s]*(?:Rs\.?|₹|INR)?\s*(\d[\d,]*\.?\d{0,2})/i,
        
        // Table cell formats
        /(?:Total|Paid)[^>]*>\s*(?:Rs\.?|₹|INR)?\s*(\d[\d,]*\.?\d{0,2})\s*</i,
        
        // With pipe separator (from table extraction)
        /(?:Total|Grand Total|Bill)[^|]*\|\s*(?:Rs\.?|₹|INR)?\s*(\d[\d,]*\.?\d{0,2})/i,
        
        // Reverse format
        /₹\s*(\d[\d,]*\.?\d{0,2})\s*(?:Total|Paid|was|is|bill)/i,
        
        // In spans/divs
        /(?:Total|Paid)[^₹]{0,30}₹\s*(\d[\d,]*\.?\d{0,2})/i
      ];

      for (const pattern of amountPatterns) {
        const match = emailBody.match(pattern);
        if (match && match[1]) {
          const amount = parseFloat(match[1].replace(/,/g, ""));
          if (amount >= 20 && amount <= 50000) {
            parsed.amount = amount;
            break;
          }
        }
      }

      // Delivery fee
      const deliveryMatch = emailBody.match(/(?:Delivery|Handling|Partner)\s*(?:Charge|Fee|Tip)?[:\s|]*(?:Rs\.?|₹)?\s*(\d[\d,]*\.?\d{0,2})/i);
      if (deliveryMatch) {
        const fee = parseFloat(deliveryMatch[1].replace(/,/g, ""));
        if (fee > 0 && fee < 500) parsed.deliveryFee = fee;
      }

      // Discount
      const discountMatch = emailBody.match(/(?:Discount|Coupon|Offer|Saved|Savings)[:\s|]*(?:Rs\.?|₹)?\s*(\d[\d,]*\.?\d{0,2})/i);
      if (discountMatch) {
        const disc = parseFloat(discountMatch[1].replace(/,/g, ""));
        if (disc > 0 && disc < 5000) parsed.discount = disc;
      }

      // Items - look for quantity × item format
      const itemRegex = /(?:^|\n|\|)\s*(\d+)\s*[×x]\s*([A-Za-z][^₹\n|<]{2,70}?)(?=\s*(?:₹|\||<|\n|$))/gi;
      let match;
      while ((match = itemRegex.exec(emailBody)) !== null) {
        const qty = parseInt(match[1]);
        let name = match[2].trim().replace(/\s+/g, " ");
        if (name && qty > 0 && qty < 50 && name.length > 2) {
          parsed.items.push({ name, quantity: qty, price: 0 });
        }
      }

    } else if (isZomato) {
      parsed.source = "zomato";

      // Restaurant patterns for Zomato
      const restaurantPatterns = [
        /order\s+from\s+([A-Z][^<>\n]{2,60}?)(?:\n|<|$)/i,
        /from\s+<[^>]*>([^<]{3,50})<\/[^>]*>/i,
        />([A-Z][A-Za-z\s&',.-]{3,50})<\/(?:b|strong|h\d)>/i,
        /restaurant[:\s]+([^<>\n]{3,60}?)(?:[.!<]|\n)/i
      ];
      
      for (const pattern of restaurantPatterns) {
        const match = emailBody.match(pattern);
        if (match && match[1]) {
          parsed.restaurant = match[1].trim().replace(/\s+/g, " ");
          break;
        }
      }

      // Amount patterns
      const amountPatterns = [
        /(?:Total|Grand\s*Total|Bill|Amount)[:\s]*(?:Rs\.?|₹)?\s*(\d[\d,]*\.?\d{0,2})/i,
        /(?:Total|Paid)[^>]*>\s*(?:Rs\.?|₹)?\s*(\d[\d,]*\.?\d{0,2})\s*</i,
        /(?:Total|Grand Total)[^|]*\|\s*(?:Rs\.?|₹)?\s*(\d[\d,]*\.?\d{0,2})/i,
        /₹\s*(\d[\d,]*\.?\d{0,2})\s*(?:Total|Paid|was)/i
      ];

      for (const pattern of amountPatterns) {
        const match = emailBody.match(pattern);
        if (match && match[1]) {
          const amount = parseFloat(match[1].replace(/,/g, ""));
          if (amount >= 20 && amount <= 50000) {
            parsed.amount = amount;
            break;
          }
        }
      }

      // Items
      const itemRegex = /(?:^|\n|\|)\s*(\d+)\s*[×x]\s*([A-Za-z][^₹\n|<]{2,70}?)(?=\s*(?:₹|\||<|\n|$))/gi;
      let match;
      while ((match = itemRegex.exec(emailBody)) !== null) {
        const qty = parseInt(match[1]);
        let name = match[2].trim().replace(/\s+/g, " ");
        if (name && qty > 0 && qty < 50 && name.length > 2) {
          parsed.items.push({ name, quantity: qty, price: 0 });
        }
      }

      // Delivery
      const deliveryMatch = emailBody.match(/Delivery[:\s|]*(?:Rs\.?|₹)?\s*(\d[\d,]*\.?\d{0,2})/i);
      if (deliveryMatch) {
        const fee = parseFloat(deliveryMatch[1].replace(/,/g, ""));
        if (fee > 0 && fee < 500) parsed.deliveryFee = fee;
      }

      // Discount
      const discountMatch = emailBody.match(/(?:Discount|Offer)[:\s|]*(?:Rs\.?|₹)?\s*(\d[\d,]*\.?\d{0,2})/i);
      if (discountMatch) {
        const disc = parseFloat(discountMatch[1].replace(/,/g, ""));
        if (disc > 0 && disc < 5000) parsed.discount = disc;
      }
    }

  } catch (error) {
    console.error("Parse error:", error);
  }

  return parsed;
}

export async function GET(req) {
  try {
    const auth = req.headers.get("cookie") || "";
    const tokenMatch = auth.match(/authtoken=([^;]+)/);
    
    if (!tokenMatch) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creds = verifyToken(tokenMatch[1]);
    const client = new google.auth.OAuth2();
    client.setCredentials(creds);
    const gmail = google.gmail({ version: "v1", auth: client });

    const queries = [
      "from:noreply@zomato.com",
      "from:zomato.com subject:order",
      "from:noreply@swiggy.in",
      "from:swiggy.in subject:order"
    ];

    let allMessages = [];
    for (const query of queries) {
      try {
        const list = await gmail.users.messages.list({ 
          userId: "me", 
          q: query,
          maxResults: 100
        });
        
        if (list.data.messages) {
          allMessages.push(...list.data.messages);
        }
      } catch (err) {
        console.log(`Query failed: ${query}`, err.message);
      }
    }

    const uniqueMessages = [...new Map(allMessages.map(m => [m.id, m])).values()];

    let collected = [];
    let processed = 0;
    let failed = 0;

    for (const msg of uniqueMessages) {
      try {
        const raw = await gmail.users.messages.get({ 
          userId: "me", 
          id: msg.id,
          format: "full"
        });

        const payload = raw.data.payload;
        
        // Extract ALL email parts properly
        const { text, html } = extractAllEmailParts(payload);
        
        // Parse HTML to text
        const htmlText = html ? parseHTML(html) : "";
        
        // Combine all text sources
        const emailBody = (text + "\n\n" + htmlText).trim();

        // Debug first email
        if (collected.length === 0 && emailBody) {
          console.log("=== FIRST EMAIL EXTRACTED ===");
          console.log("Length:", emailBody.length);
          console.log("Preview:", emailBody.substring(0, 500));
          console.log("Has ₹:", emailBody.includes("₹"));
          console.log("=============================");
        }

        if (!emailBody || emailBody.length < 50) {
          console.log(`Skipping email ${msg.id} - no body extracted`);
          failed++;
          continue;
        }

        const dateHeader = raw.data.payload.headers.find(h => h.name === "Date");
        const emailDate = dateHeader ? new Date(dateHeader.value) : new Date();

        const parsed = parseOrderEmail(emailBody, emailDate);

        if (parsed.amount > 0) {
          collected.push({
            ...parsed,
            emailId: msg.id,
            threadId: msg.threadId,
            processed: new Date()
          });
          processed++;
        } else {
          // Log why it failed
          if (collected.length < 3) {
            console.log("=== FAILED TO PARSE AMOUNT ===");
            console.log("Source:", parsed.source);
            console.log("Restaurant:", parsed.restaurant);
            console.log("Body snippet:", emailBody.substring(0, 300));
            console.log("==============================");
          }
          failed++;
        }

      } catch (error) {
        console.error(`Failed to process ${msg.id}:`, error.message);
        failed++;
      }
    }

    if (collected.length > 0) {
      const db = await connectDB();
      
      for (const order of collected) {
        await db.collection("orders").updateOne(
          { emailId: order.emailId },
          { $set: order },
          { upsert: true }
        );
      }
    }

    const zomatoCount = collected.filter(o => o.source === "zomato").length;
    const swiggyCount = collected.filter(o => o.source === "swiggy").length;
    const totalAmount = collected.reduce((sum, o) => sum + o.amount, 0);

    return Response.json({ 
      success: true, 
      totalEmails: uniqueMessages.length,
      processed,
      failed,
      stored: collected.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      breakdown: { zomato: zomatoCount, swiggy: swiggyCount },
      message: `Processed ${processed} orders (${zomatoCount} Zomato, ${swiggyCount} Swiggy). Total: ₹${totalAmount.toFixed(2)}` 
    });

  } catch (error) {
    console.error("Fetch error:", error);
    return Response.json({ 
      error: error.message,
      details: "Failed to fetch orders" 
    }, { status: 500 });
  }
}