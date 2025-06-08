const admin = require("../config/firebase-admin");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const { userId } = req.body; // For simple auth fallback

    console.log("Auth middleware - authHeader:", authHeader);
    console.log("Auth middleware - userId:", userId);

    // Check if Firebase token is provided
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Firebase authentication
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
      req.authType = 'firebase';

      console.log("Firebase auth successful for user:", user._id);
      return next();
    }
    
    // Fallback to simple auth for non-Firebase users
    if (userId) {
      console.log("Trying simple auth with userId:", userId);
      const user = await User.findById(userId);

      if (!user) {
        console.log("User not found with ID:", userId);
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      req.user = user;
      req.authType = 'simple';
      
      console.log("Simple auth successful for user:", user._id);
      return next();
    }

    // No valid authentication method provided
    console.log("No valid authentication provided");
    return res.status(401).json({
      success: false,
      error: "No valid authentication provided. Include either Authorization header or userId in body.",
    });

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

module.exports = authMiddleware;