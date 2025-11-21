import { google } from "googleapis";
import { signToken } from "../../../../utils/jwt";



export async function GET(req) {
  try {
    const code = new URL(req.url).searchParams.get("code");
    
    if (!code) {
      return Response.redirect(new URL("/", req.url).toString());
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Sign JWT with tokens
    const jwtToken = signToken(tokens);
    
    // Set secure cookie
    const cookie = `authtoken=${jwtToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
        "Set-Cookie": cookie
      }
    });

  } catch (error) {
    console.error("Callback error:", error);
    return new Response(
      `<html><body><h1>Authentication Failed</h1><p>${error.message}</p><a href="/">Go Home</a></body></html>`,
      { 
        status: 500,
        headers: { "Content-Type": "text/html" }
      }
    );
  }
}