const equipmentRepository = require('../db/equipmentRepository');
const rentalRepository = require('../db/rentalRepository');

function createRental({ userId, equipmentId, dueDate, notes }) {
  const equipment = equipmentRepository.findById(equipmentId);
  if (!equipment) {
    return { error: { status: 404, message: 'Техніку не знайдено' } };
  }
  if (equipment.status !== 'available') {
    return { error: { status: 400, message: 'Ця техніка зараз недоступна' } };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) {
    return { error: { status: 400, message: 'Дата повернення не може бути в минулому' } };
  }

  const rental = rentalRepository.create({ userId, equipmentId, dueDate, notes });
  return { rental };
}

function approveRental(rentalId) {
  const rental = rentalRepository.findById(rentalId);
  if (!rental) return { error: { status: 404, message: 'Заявку не знайдено' } };
  if (rental.status !== 'pending') {
    return { error: { status: 400, message: 'Можна підтвердити лише заявку в статусі pending' } };
  }

  const updated = rentalRepository.updateStatus(rentalId, 'approved');
  equipmentRepository.updateStatus(rental.equipmentId, 'rented');
  return { rental: updated };
}

function rejectRental(rentalId, reason) {
  const rental = rentalRepository.findById(rentalId);
  if (!rental) return { error: { status: 404, message: 'Заявку не знайдено' } };
  if (rental.status !== 'pending') {
    return { error: { status: 400, message: 'Можна відхилити лише заявку в статусі pending' } };
  }

  const updated = rentalRepository.updateStatus(rentalId, 'rejected', { rejectionReason: reason || 'Без причини' });
  return { rental: updated };
}

function returnRental(rentalId) {
  const rental = rentalRepository.findById(rentalId);
  if (!rental) return { error: { status: 404, message: 'Заявку не знайдено' } };
  if (rental.status !== 'approved') {
    return { error: { status: 400, message: 'Повернути можна лише видану техніку (approved)' } };
  }

  const returnedAt = new Date().toISOString().slice(0, 10);
  const updated = rentalRepository.updateStatus(rentalId, 'returned', { returnedAt });
  equipmentRepository.updateStatus(rental.equipmentId, 'available');
  return { rental: updated };
}

function cancelRental(rentalId, userId) {
  const rental = rentalRepository.findById(rentalId);
  if (!rental) return { error: { status: 404, message: 'Заявку не знайдено' } };
  if (rental.userId !== userId) {
    return { error: { status: 403, message: 'Це не ваша заявка' } };
  }
  if (rental.status !== 'pending') {
    return { error: { status: 400, message: 'Скасувати можна лише заявку в статусі pending' } };
  }

  const updated = rentalRepository.updateStatus(rentalId, 'cancelled');
  return { rental: updated };
}

module.exports = { createRental, approveRental, rejectRental, returnRental, cancelRental };