const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', equipmentController.list);          // гість, студент, адмін - усім відкрито
router.get('/:id', equipmentController.getOne);      // так само
router.post('/', authenticate, requireAdmin, equipmentController.create);  // лише адмін
router.put('/:id', authenticate, requireAdmin, equipmentController.update); // лише адмін

module.exports = router;