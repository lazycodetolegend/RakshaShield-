const express = require('express');
const multer = require('multer');
const { checkUPI, checkUPIQR } = require('../controllers/checkUPIController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.post('/', checkUPI);
router.post('/qr', upload.single('image'), checkUPIQR);

module.exports = router;
