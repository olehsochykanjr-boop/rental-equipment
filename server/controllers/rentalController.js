const rentalRepository = require('../db/rentalRepository');
const rentalService = require('../services/rentalService');

// Допоміжна функція: перетворює результат сервісу на HTTP-відповідь
function sendResult(res, result, successStatus = 200) {
  if (result.error) {
    return res.status(result.error.status).json({ error: result.error.message });
  }
  res.status(successStatus).json(result.rental);
}

// POST /api/rentals - студент подає заявку
function create(req, res) {
  const { equipmentId, dueDate, notes } = req.body;

  if (!equipmentId || !dueDate) {
    return res.status(400).json({ error: 'Вкажіть equipmentId і dueDate (формат YYYY-MM-DD)' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return res.status(400).json({ error: 'dueDate має бути у форматі YYYY-MM-DD' });
  }

  const result = rentalService.createRental({
    userId: req.user.id, // беремо з токена, а НЕ з тіла запиту
    equipmentId,
    dueDate,
    notes,
  });
  sendResult(res, result, 201);
}

// GET /api/rentals - студент бачить свої, адмін бачить усі
function list(req, res) {
  if (req.user.role === 'admin') {
    const rentals = rentalRepository.findAll({ status: req.query.status });
    return res.json(rentals);
  }
  res.json(rentalRepository.findByUser(req.user.id));
}

// GET /api/rentals/:id
function getOne(req, res) {
  const rental = rentalRepository.findById(req.params.id);
  if (!rental) {
    return res.status(404).json({ error: 'Заявку не знайдено' });
  }
  if (req.user.role !== 'admin' && rental.userId !== req.user.id) {
    return res.status(403).json({ error: 'Це не ваша заявка' });
  }
  res.json(rental);
}

// PUT /api/rentals/:id - студент змінює свою заявку (поки pending)
function update(req, res) {
  const rental = rentalRepository.findById(req.params.id);
  if (!rental) {
    return res.status(404).json({ error: 'Заявку не знайдено' });
  }
  if (rental.userId !== req.user.id) {
    return res.status(403).json({ error: 'Це не ваша заявка' });
  }
  if (rental.status !== 'pending') {
    return res.status(400).json({ error: 'Змінити можна лише заявку в статусі pending' });
  }

  const { dueDate, notes } = req.body;
  const newDueDate = dueDate || rental.dueDate;
  const today = new Date().toISOString().slice(0, 10);
  if (newDueDate < today) {
    return res.status(400).json({ error: 'Дата повернення не може бути в минулому' });
  }

  const updated = rentalRepository.updateDetails(rental.id, { dueDate: newDueDate, notes });
  res.json(updated);
}

// DELETE /api/rentals/:id - студент скасовує свою заявку
function cancel(req, res) {
  const result = rentalService.cancelRental(Number(req.params.id), req.user.id);
  sendResult(res, result);
}

// PATCH /api/rentals/:id/approve - тільки адмін
function approve(req, res) {
  sendResult(res, rentalService.approveRental(Number(req.params.id)));
}

// PATCH /api/rentals/:id/reject - тільки адмін
function reject(req, res) {
  sendResult(res, rentalService.rejectRental(Number(req.params.id), req.body.reason));
}

// PATCH /api/rentals/:id/return - тільки адмін
function returnItem(req, res) {
  sendResult(res, rentalService.returnRental(Number(req.params.id)));
}

// GET /api/equipment/:id/history - тільки адмін
function equipmentHistory(req, res) {
  res.json(rentalRepository.findByEquipment(req.params.id));
}

module.exports = { create, list, getOne, update, cancel, approve, reject, returnItem, equipmentHistory };