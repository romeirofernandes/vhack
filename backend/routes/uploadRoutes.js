const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        )
      );
    }
  },
});

// Routes
router.post(
  "/image",
  authMiddleware,
  upload.single("image"),
  uploadController.uploadImage
);

// Test route
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Upload route is working" });
});

module.exports = router;
