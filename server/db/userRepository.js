const db = require('./connection');

function findByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email); // .get() повертає один рядок або undefined
}

function findById(id) {
  const stmt = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?');
  return stmt.get(id);
}

function createUser({ name, email, passwordHash, role }) {
  const stmt = db.prepare(
    'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(name, email, passwordHash, role);
  return findById(result.lastInsertRowid); // lastInsertRowid - id щойно вставленого рядка
}

module.exports = { findByEmail, findById, createUser };