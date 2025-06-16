const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

// Configure multer for image uploads
const uploadImage = multer({
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

// Configure multer for PDF uploads
const uploadPDF = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for PDFs
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF files are allowed."));
    }
  },
});

// Routes
router.post(
  "/image",
  authMiddleware,
  uploadImage.single("image"),
  uploadController.uploadImage
);

router.post(
  "/pdf",
  authMiddleware,
  uploadPDF.single("pdf"),
  uploadController.uploadPDF
);

module.exports = router;
