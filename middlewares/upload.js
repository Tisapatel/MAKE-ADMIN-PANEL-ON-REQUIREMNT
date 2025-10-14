const multer = require("multer");
const cloudinary = require("../configs/cloudinary");
const { Readable } = require("stream");

// 🔹 Multer setup (no local saving)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 🔹 Upload single file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

// 🔹 Middleware for single image upload
const singleCloud = (fieldName = "image", folder = "uploads") => [
  upload.single(fieldName),
  async (req, res, next) => {
    try {
      if (!req.file) return next();
      const result = await uploadToCloudinary(req.file.buffer, folder);
      req.file = {
        url: result.secure_url,
        public_id: result.public_id
      };
      next();
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      next(err);
    }
  }
];

// 🔹 Middleware for multiple image upload
const multipleCloud = (fieldName = "images", maxCount = 5, folder = "uploads") => [
  upload.array(fieldName, maxCount),
  async (req, res, next) => {
    try {
      if (!req.files?.length) return next();
      const uploads = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.buffer, folder))
      );
      req.files = uploads.map(u => ({
        url: u.secure_url,
        public_id: u.public_id
      }));
      next();
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      next(err);
    }
  }
];

module.exports = { singleCloud, multipleCloud };
