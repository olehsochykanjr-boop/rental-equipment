const db = require('./connection');

// Рахує рядки по статусах і додає загальну суму
function toCounts(rows) {
  const result = { total: 0 };
  rows.forEach((r) => {
    result[r.status] = r.count;
    result.total += r.count;
  });
  return result;
}

function getStats(today) {
  const equipment = toCounts(
    db.prepare('SELECT status, COUNT(*) AS count FROM equipment GROUP BY status').all()
  );
  const rentals = toCounts(
    db.prepare('SELECT status, COUNT(*) AS count FROM rentals GROUP BY status').all()
  );

  // Прострочені: видані, але термін повернення вже минув
  rentals.overdue = db
    .prepare(`SELECT COUNT(*) AS count FROM rentals WHERE status = 'approved' AND dueDate < ?`)
    .get(today).count;

  // За видом техніки: скільки разів її видавали
  const byCategory = db
    .prepare(
      `SELECT equipment.category AS category, COUNT(*) AS count
       FROM rentals JOIN equipment ON rentals.equipmentId = equipment.id
       WHERE rentals.status IN ('approved', 'returned')
       GROUP BY equipment.category
       ORDER BY count DESC`
    )
    .all();

  // За місяцем: кількість поданих заявок (YYYY-MM)
  const byMonth = db
    .prepare(
      `SELECT substr(requestedAt, 1, 7) AS month, COUNT(*) AS count
       FROM rentals
       GROUP BY month
       ORDER BY month`
    )
    .all();

  // За користувачем: топ-5 за кількістю заявок
  const topUsers = db
    .prepare(
      `SELECT users.name AS name, COUNT(*) AS count
       FROM rentals JOIN users ON rentals.userId = users.id
       GROUP BY users.id
       ORDER BY count DESC
       LIMIT 5`
    )
    .all();

  return { equipment, rentals, byCategory, byMonth, topUsers };
}

module.exports = { getStats };