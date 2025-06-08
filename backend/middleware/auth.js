const admin = require("../config/firebase-admin");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Find the user in MongoDB
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Attach user to request object
    req.user = user;
    req.firebaseUser = decodedToken;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

module.exports = authMiddleware;
