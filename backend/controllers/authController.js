const admin = require("../config/firebase-admin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

      // Create a custom token for immediate authentication
      const customToken = await admin.auth().createCustomToken(userRecord.uid);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        customToken, // Add this to allow immediate login
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
          // Fix: Use email as fallback if name is not available
          displayName:
            decodedToken.name || decodedToken.email.split("@")[0] || "User",
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
    console.log("Updating role for user:", req.user._id);
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

  // Update profile method (used by profile setup pages)
  async updateProfile(req, res) {
    try {
      const { profile } = req.body;
      const userId = req.user._id;

      if (!profile) {
        return res.status(400).json({
          success: false,
          error: "Profile data is required",
        });
      }

      console.log("Received profile data:", profile);

      // Transform the profile data based on the structure
      let transformedProfile = { ...profile };

      // Handle social links - convert simple strings to socialLinks object
      if (profile.github || profile.linkedin || profile.portfolio) {
        transformedProfile.socialLinks = {
          github: profile.github || "",
          linkedin: profile.linkedin || "",
          portfolio: profile.portfolio || "",
          twitter: profile.twitter || "",
        };

        // Remove the individual fields
        delete transformedProfile.github;
        delete transformedProfile.linkedin;
        delete transformedProfile.portfolio;
        delete transformedProfile.twitter;
      }

      // For judges, merge expertise into skills
      if (profile.expertise && Array.isArray(profile.expertise)) {
        transformedProfile.skills = [
          ...(profile.skills || []),
          ...profile.expertise,
        ];
        delete transformedProfile.expertise;
      }

      // Ensure skills is an array of strings
      if (
        transformedProfile.skills &&
        !Array.isArray(transformedProfile.skills)
      ) {
        transformedProfile.skills = [];
      }

      console.log("Transformed profile data:", transformedProfile);

      // Update user profile
      const user = await User.findByIdAndUpdate(
        userId,
        {
          profile: transformedProfile,
          profileCompleted: true,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).select("displayName email role profile profileCompleted");

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
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          profile: user.profile,
          profileCompleted: user.profileCompleted,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  },

  // Verify token method
  async verifyToken(req, res) {
    try {
      const idToken = req.headers.authorization?.split(" ")[1];

      if (!idToken) {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email } = decodedToken;

      // Find or create user in your database
      let user = await User.findOne({ firebaseUid: uid });

      if (!user) {
        // Create new user if doesn't exist
        user = new User({
          firebaseUid: uid,
          email: email,
          name: decodedToken.name || email.split("@")[0],
          role: "participant", // Default role
        });
        await user.save();
      }

      // Generate JWT token for your backend
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  },
};

module.exports = authController;
