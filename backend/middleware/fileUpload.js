const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadPath = path.join(__dirname, '../../data/uploads');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Use timestamp + original name to avoid overwriting
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to allow only ZIP files
const fileFilter = (req, file, cb) => {
  // Accept only zip files
  if (file.mimetype === 'application/zip' || 
      file.mimetype === 'application/x-zip-compressed' ||
      file.originalname.endsWith('.zip')) {
    cb(null, true);
  } else {
    cb(new Error('Only ZIP files are allowed'), false);
  }
};

// File size limit: 35MB (35 * 1024 * 1024 bytes)
const limits = {
  fileSize: 35 * 1024 * 1024
};

// Export the configured multer middleware
module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});