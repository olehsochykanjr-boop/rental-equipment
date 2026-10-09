const db = require('./connection');

function findAll({ status } = {}) {
  let query = `
    SELECT rentals.*, users.name AS userName, equipment.name AS equipmentName
    FROM rentals
    JOIN users ON rentals.userId = users.id
    JOIN equipment ON rentals.equipmentId = equipment.id
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    query += ' AND rentals.status = ?';
    params.push(status);
  }
  query += ' ORDER BY rentals.requestedAt DESC';
  return db.prepare(query).all(...params);
}

function findByUser(userId) {
  return db.prepare(
    `SELECT rentals.*, equipment.name AS equipmentName
     FROM rentals
     JOIN equipment ON rentals.equipmentId = equipment.id
     WHERE rentals.userId = ?
     ORDER BY rentals.requestedAt DESC`
  ).all(userId);
}

function findByEquipment(equipmentId) {
  return db.prepare(
    `SELECT rentals.*, users.name AS userName
     FROM rentals
     JOIN users ON rentals.userId = users.id
     WHERE rentals.equipmentId = ?
     ORDER BY rentals.requestedAt DESC`
  ).all(equipmentId);
}

function findById(id) {
  return db.prepare('SELECT * FROM rentals WHERE id = ?').get(id);
}

function create({ userId, equipmentId, dueDate, notes }) {
  const requestedAt = new Date().toISOString().slice(0, 10); // формат YYYY-MM-DD
  const stmt = db.prepare(
    `INSERT INTO rentals (userId, equipmentId, requestedAt, dueDate, status, notes)
     VALUES (?, ?, ?, ?, 'pending', ?)`
  );
  const result = stmt.run(userId, equipmentId, requestedAt, dueDate, notes || null);
  return findById(result.lastInsertRowid);
}

function updateStatus(id, status, extra = {}) {
  const fields = ['status = ?'];
  const params = [status];

  if (extra.rejectionReason !== undefined) {
    fields.push('rejectionReason = ?');
    params.push(extra.rejectionReason);
  }
  if (extra.returnedAt !== undefined) {
    fields.push('returnedAt = ?');
    params.push(extra.returnedAt);
  }
  params.push(id);

  db.prepare(`UPDATE rentals SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  return findById(id);
}

function updateDetails(id, { dueDate, notes }) {
  db.prepare('UPDATE rentals SET dueDate = ?, notes = ? WHERE id = ?').run(dueDate, notes || null, id);
  return findById(id);
}

module.exports = { findAll, findByUser, findByEquipment, findById, create, updateStatus, updateDetails };