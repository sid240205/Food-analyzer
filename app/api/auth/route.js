import { google } from "googleapis";

export async function GET() {
  try {
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI,
    });

    // ✅ ADD DEBUG LOGS HERE
    console.log("CLIENT_ID =", process.env.CLIENT_ID);
    console.log("CLIENT_SECRET =", process.env.CLIENT_SECRET);
    console.log("REDIRECT_URI =", process.env.REDIRECT_URI);

    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
      redirect_uri: process.env.REDIRECT_URI
    });

    console.log("AUTH URL =", url); // optional

    return Response.redirect(url);
  } catch (error) {
    console.error("Auth error:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
