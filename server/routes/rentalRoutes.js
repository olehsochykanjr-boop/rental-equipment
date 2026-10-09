const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Усі маршрути заявок потребують входу
router.use(authenticate);

router.post('/', rentalController.create);
router.get('/', rentalController.list);
router.get('/:id', rentalController.getOne);
router.put('/:id', rentalController.update);
router.delete('/:id', rentalController.cancel);

// Лише адмін
router.patch('/:id/approve', requireAdmin, rentalController.approve);
router.patch('/:id/reject', requireAdmin, rentalController.reject);
router.patch('/:id/return', requireAdmin, rentalController.returnItem);

module.exports = router;