const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const rentalController = require('../controllers/rentalController');

router.get('/:id/history', authenticate, requireAdmin, rentalController.equipmentHistory);
router.get('/', equipmentController.list);          // гість, студент, адмін - усім відкрито
router.get('/:id', equipmentController.getOne);      // так само
router.post('/', authenticate, requireAdmin, equipmentController.create);  // лише адмін
router.put('/:id', authenticate, requireAdmin, equipmentController.update); // лише адмін

module.exports = router;