const express = require('express');
const { checkLink } = require('../controllers/checkLinkController');

const router = express.Router();
router.post('/', checkLink);

module.exports = router;
