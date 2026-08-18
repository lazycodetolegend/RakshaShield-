const express = require('express');
const multer = require('multer');
const { checkVoice } = require('../controllers/checkVoiceController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max for audio
  fileFilter: (req, file, cb) => {
    // Accept audio mimetypes or audio extensions
    const isAudio =
      file.mimetype.startsWith('audio/') ||
      file.originalname.match(/\.(mp3|wav|ogg|opus|m4a|aac|flac|wma)$/i);
    if (isAudio) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files (.mp3, .wav, .ogg, .opus, .m4a) are allowed'), false);
    }
  },
});

router.post('/', upload.single('audio'), checkVoice);

module.exports = router;
