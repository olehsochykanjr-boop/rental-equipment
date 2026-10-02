// Створює базу даних і заповнює її тестовими даними.
// Запуск: npm run db:init

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'rental.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Видаляємо стару базу, якщо є - щоб можна було перезапускати скрипт багато разів
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Стару базу видалено.');
}

const db = new Database(DB_PATH);

// Створюємо таблиці зі схеми
db.exec(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
console.log('Таблиці створено.');

// --- Користувачі ---
// Усі тестові користувачі мають пароль "password123"
const passwordHash = bcrypt.hashSync('password123', 10);

const insertUser = db.prepare(
  `INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)`
);

const users = [
  ['Олег Сочикан', 'oleh@example.com', passwordHash, 'admin'],
  ['Марія Коваль', 'maria@example.com', passwordHash, 'student'],
  ['Іван Петренко', 'ivan@example.com', passwordHash, 'student'],
  ['Анна Шевченко', 'anna@example.com', passwordHash, 'student'],
  ['Дмитро Бойко', 'dmytro@example.com', passwordHash, 'student'],
];
users.forEach((u) => insertUser.run(...u));
console.log(`Додано ${users.length} користувачів.`);

// --- Техніка ---
const insertEquipment = db.prepare(
  `INSERT INTO equipment (name, category, inventoryNumber, description, imageUrl, status)
   VALUES (?, ?, ?, ?, ?, ?)`
);

const equipment = [
  ['Dell Latitude 5420', 'laptop', 'INV-001', 'Ноутбук для роботи з документами', null, 'available'],
  ['MacBook Air M1', 'laptop', 'INV-002', 'Легкий ноутбук для відео', null, 'rented'],
  ['Canon EOS 2000D', 'camera', 'INV-003', 'Дзеркальна камера', null, 'rented'],
  ['GoPro Hero 10', 'camera', 'INV-004', 'Екшн-камера', null, 'rented'],
  ['Arduino Sensor Kit', 'sensor', 'INV-005', 'Набір датчиків для експериментів', null, 'rented'],
  ['Темп. датчик DHT22', 'sensor', 'INV-006', 'Датчик температури і вологості', null, 'available'],
  ['Lenovo ThinkPad T14', 'laptop', 'INV-007', 'Ноутбук для програмування', null, 'maintenance'],
  ['Sony Alpha a6000', 'camera', 'INV-008', 'Бездзеркальна камера', null, 'rented'],
];
equipment.forEach((e) => insertEquipment.run(...e));
console.log(`Додано ${equipment.length} одиниць техніки.`);

// --- Заявки ---
const insertRental = db.prepare(
  `INSERT INTO rentals (userId, equipmentId, requestedAt, dueDate, returnedAt, status, rejectionReason, notes)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);

const rentals = [
  [2, 1, '2026-09-01', '2026-09-10', '2026-09-09', 'returned', null, null],
  [3, 2, '2026-09-02', '2026-09-12', null, 'approved', null, 'для зйомки проєкту'],
  [4, 3, '2026-09-03', '2026-09-08', '2026-09-07', 'returned', null, null],
  [5, 4, '2026-09-04', '2026-09-14', null, 'approved', null, null],
  [2, 5, '2026-09-05', '2026-09-15', null, 'pending', null, 'для лабораторної'],
  [3, 6, '2026-09-05', '2026-09-09', null, 'rejected', 'Датчик вже заброньовано', null],
  [4, 8, '2026-09-06', '2026-09-16', null, 'approved', null, null],
  [5, 1, '2026-09-07', '2026-09-11', null, 'cancelled', null, 'передумав'],
  [2, 2, '2026-09-08', '2026-09-18', null, 'pending', null, null],
  [3, 3, '2026-09-09', '2026-09-13', '2026-09-13', 'returned', null, null],
  [4, 4, '2026-09-10', '2026-09-20', null, 'pending', null, null],
  [5, 5, '2026-09-11', '2026-09-21', null, 'approved', null, null],
  [2, 6, '2026-09-12', '2026-09-16', null, 'pending', null, null],
  [3, 8, '2026-09-13', '2026-09-17', '2026-09-16', 'returned', null, null],
  [4, 1, '2026-09-14', '2026-09-24', null, 'pending', null, null],
  [5, 2, '2026-09-15', '2026-09-19', null, 'rejected', 'Технічне обслуговування', null],
  [2, 3, '2026-09-16', '2026-09-26', null, 'approved', null, null],
  [3, 4, '2026-09-17', '2026-09-21', null, 'pending', null, null],
  [4, 5, '2026-09-18', '2026-09-28', null, 'cancelled', null, 'знайшов інше рішення'],
  [5, 6, '2026-09-19', '2026-09-23', null, 'pending', null, null],
];
rentals.forEach((r) => insertRental.run(...r));
console.log(`Додано ${rentals.length} заявок.`);

db.close();
console.log('Готово: server/db/rental.db створено і заповнено.');