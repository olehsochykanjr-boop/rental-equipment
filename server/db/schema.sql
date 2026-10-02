PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin'))
);

CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('laptop', 'camera', 'sensor', 'other')),
    inventoryNumber TEXT NOT NULL UNIQUE,
    description TEXT,
    imageUrl TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance'))
);

CREATE TABLE IF NOT EXISTS rentals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    equipmentId INTEGER NOT NULL,
    requestedAt TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    returnedAt TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled','returned')),
    rejectionReason TEXT,
    notes TEXT,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (equipmentId) REFERENCES equipment(id)
);