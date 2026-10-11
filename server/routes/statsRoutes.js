const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, statsController.get);

module.exports = router;