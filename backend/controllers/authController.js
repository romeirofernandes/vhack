const User = require("../models/User");
const admin = require("../config/firebase-admin");

const authController = {
  // Register method
  async register(req, res) {
    try {
      const { email, password, displayName } = req.body;

      // Create user in Firebase
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
      });

      // Create user in MongoDB
      const user = new User({
        firebaseUid: userRecord.uid,
        email,
        displayName,
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Registration failed",
      });
    }
  },

  // Login method
  async login(req, res) {
    try {
      const { idToken } = req.body;

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Find or create user in MongoDB
      let user = await User.findOne({ firebaseUid: decodedToken.uid });

      if (!user) {
        user = new User({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email,
          displayName: decodedToken.name,
          photoURL: decodedToken.picture,
        });
        await user.save();
      }

      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: user.role,
          profileCompleted: user.profileCompleted,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({
        success: false,
        error: "Authentication failed",
      });
    }
  },

  // Authenticate existing user
  async authenticate(req, res) {
    try {
      // The auth middleware already verified the token and attached the user
      const user = req.user;

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: user.role,
          profile: user.profile,
          profileCompleted: user.profileCompleted,
        },
      });
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(401).json({
        success: false,
        error: "Authentication failed",
      });
    }
  },

  // Update role method
  async updateRole(req, res) {
    try {
      const { role } = req.body;
      const userId = req.user._id;

      if (!role || !["participant", "judge", "organizer"].includes(role)) {
        return res.status(400).json({
          success: false,
          error: "Valid role is required (participant, judge, or organizer)",
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          role,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Role updated successfully",
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: user.role,
          profileCompleted: user.profileCompleted,
        },
      });
    } catch (error) {
      console.error("Role update error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update role",
      });
    }
  },

  // Update profile method
  async updateProfile(req, res) {
    try {
      const { profile } = req.body;
      const userId = req.user._id;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          profile,
          profileCompleted: true,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: user.role,
          profile: user.profile,
          profileCompleted: user.profileCompleted,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  },
};

module.exports = authController;
