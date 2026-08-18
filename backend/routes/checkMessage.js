const express = require('express');
const multer = require('multer');
const { checkMessage, checkMessageOCR } = require('../controllers/checkMessageController');

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

router.post('/', checkMessage);
router.post('/ocr', upload.single('image'), checkMessageOCR);

module.exports = router;
