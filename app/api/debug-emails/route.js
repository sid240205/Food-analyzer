import { google } from "googleapis";
import { verifyToken } from "../../../utils/jwt";

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

    const samples = {
      swiggy: null,
      zomato: null
    };

    // Get one Swiggy email
    const swiggyList = await gmail.users.messages.list({ 
      userId: "me", 
      q: "from:swiggy.in",
      maxResults: 1
    });

    if (swiggyList.data.messages && swiggyList.data.messages.length > 0) {
      const raw = await gmail.users.messages.get({ 
        userId: "me", 
        id: swiggyList.data.messages[0].id,
        format: "full"
      });

      let emailBody = "";
      const payload = raw.data.payload;

      if (payload.body?.data) {
        emailBody = Buffer.from(payload.body.data, "base64").toString();
      } else if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === "text/plain" && part.body?.data) {
            emailBody += Buffer.from(part.body.data, "base64").toString();
          } else if (part.mimeType === "text/html" && part.body?.data) {
            emailBody += "\n[HTML PART]\n" + Buffer.from(part.body.data, "base64").toString();
          }
        }
      }

      samples.swiggy = {
        subject: payload.headers.find(h => h.name === "Subject")?.value,
        preview: emailBody.substring(0, 2000),
        fullLength: emailBody.length,
        hasHTML: emailBody.includes("<html"),
        containsRupee: emailBody.includes("₹") || emailBody.includes("Rs"),
        containsTotal: emailBody.toLowerCase().includes("total")
      };
    }

    // Get one Zomato email
    const zomatoList = await gmail.users.messages.list({ 
      userId: "me", 
      q: "from:zomato.com",
      maxResults: 1
    });

    if (zomatoList.data.messages && zomatoList.data.messages.length > 0) {
      const raw = await gmail.users.messages.get({ 
        userId: "me", 
        id: zomatoList.data.messages[0].id,
        format: "full"
      });

      let emailBody = "";
      const payload = raw.data.payload;

      if (payload.body?.data) {
        emailBody = Buffer.from(payload.body.data, "base64").toString();
      } else if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === "text/plain" && part.body?.data) {
            emailBody += Buffer.from(part.body.data, "base64").toString();
          } else if (part.mimeType === "text/html" && part.body?.data) {
            emailBody += "\n[HTML PART]\n" + Buffer.from(part.body.data, "base64").toString();
          }
        }
      }

      samples.zomato = {
        subject: payload.headers.find(h => h.name === "Subject")?.value,
        preview: emailBody.substring(0, 2000),
        fullLength: emailBody.length,
        hasHTML: emailBody.includes("<html"),
        containsRupee: emailBody.includes("₹") || emailBody.includes("Rs"),
        containsTotal: emailBody.toLowerCase().includes("total")
      };
    }

    return Response.json(samples);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}