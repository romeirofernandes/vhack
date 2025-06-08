const admin = require("../config/firebase-admin");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = req.body?.userId;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split("Bearer ")[1];

      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const user = await User.findOne({ firebaseUid: decodedToken.uid });

        if (!user) {
          return res.status(401).json({
            success: false,
            error: "User not found",
          });
        }

        req.user = user;
        req.firebaseUser = decodedToken;
        req.authType = "firebase";

        return next();
      } catch (tokenError) {
        throw tokenError;
      }
    }

    if (userId) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      req.user = user;
      req.authType = "simple";

      return next();
    }

    return res.status(401).json({
      success: false,
      error:
        "No valid authentication provided. Include either Authorization header or userId in body.",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

module.exports = authMiddleware;
