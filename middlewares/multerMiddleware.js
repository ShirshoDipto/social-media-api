const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileName = file.originalname;
    cb(null, true);
  },
});

module.exports = upload;
