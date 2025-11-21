import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

export function signToken(data) {
  try {
    return jwt.sign(data, JWT_SECRET, { 
      expiresIn: "7d",
      algorithm: "HS256"
    });
  } catch (error) {
    console.error("JWT sign error:", error);
    throw new Error("Failed to sign token");
  }
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"]
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw error;
  }
}

export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
}