const db = require('./connection');

function findAll({ category, status } = {}) {
  let query = 'SELECT * FROM equipment WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY name';
  return db.prepare(query).all(...params); // .all() повертає масив усіх рядків
}

function findById(id) {
  return db.prepare('SELECT * FROM equipment WHERE id = ?').get(id);
}

function create({ name, category, inventoryNumber, description, imageUrl }) {
  const stmt = db.prepare(
    `INSERT INTO equipment (name, category, inventoryNumber, description, imageUrl, status)
     VALUES (?, ?, ?, ?, ?, 'available')`
  );
  const result = stmt.run(name, category, inventoryNumber, description || null, imageUrl || null);
  return findById(result.lastInsertRowid);
}

function updateStatus(id, status) {
  db.prepare('UPDATE equipment SET status = ? WHERE id = ?').run(status, id);
  return findById(id);
}

function update(id, { name, category, description, imageUrl }) {
  db.prepare(
    `UPDATE equipment SET name = ?, category = ?, description = ?, imageUrl = ? WHERE id = ?`
  ).run(name, category, description || null, imageUrl || null, id);
  return findById(id);
}

module.exports = { findAll, findById, create, update, updateStatus };