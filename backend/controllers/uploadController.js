const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadController = {
  // Upload image
  async uploadImage(req, res) {
    try {
      console.log("Upload request received");
      console.log("File:", req.file ? "Present" : "Missing");
      console.log("User:", req.user ? req.user._id : "Not authenticated");

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No image file provided",
        });
      }

      console.log("Starting Cloudinary upload...");
      console.log("File size:", req.file.size);
      console.log("File type:", req.file.mimetype);

      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "vhack/projects",
              use_filename: true,
              unique_filename: true,
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary error:", error);
                reject(error);
              } else {
                console.log("Cloudinary success:", result.secure_url);
                resolve(result);
              }
            }
          )
          .end(req.file.buffer);
      });

      res.status(200).json({
        success: true,
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          originalName: req.file.originalname,
        },
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({
        success: false,
        error: `Failed to upload image: ${error.message}`,
      });
    }
  },
};

module.exports = uploadController;
