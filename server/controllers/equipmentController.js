const equipmentRepository = require('../db/equipmentRepository');

const CATEGORIES = ['laptop', 'camera', 'sensor', 'other'];
const MANUAL_STATUSES = ['available', 'maintenance'];

function list(req, res) {
  const { category, status } = req.query; // query-параметри: ?category=laptop&status=available
  const items = equipmentRepository.findAll({ category, status });
  res.json(items);
}

function getOne(req, res) {
  const item = equipmentRepository.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Техніку не знайдено' });
  }
  res.json(item);
}

function create(req, res) {
  const { name, category, inventoryNumber, description, imageUrl } = req.body;

  if (!name || !category || !inventoryNumber) {
    return res.status(400).json({ error: 'Заповніть name, category, inventoryNumber' });
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category має бути одним з: ${CATEGORIES.join(', ')}` });
  }

  try {
    const item = equipmentRepository.create({ name, category, inventoryNumber, description, imageUrl });
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Техніка з таким інвентарним номером вже існує' });
    }
    throw err;
  }
}

function update(req, res) {
  const existing = equipmentRepository.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Техніку не знайдено' });
  }

  const { name, category, description, imageUrl, status } = req.body;

  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category має бути одним з: ${CATEGORIES.join(', ')}` });
  }

  // Зміна статусу вручну: лише available <-> maintenance.
  // Статус rented змінюється тільки через заявки (approve / return).
  if (status !== undefined) {
    if (!MANUAL_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Вручну можна встановити лише available або maintenance' });
    }
    if (existing.status === 'rented') {
      return res.status(400).json({ error: 'Техніка видана: спочатку прийміть повернення' });
    }
    return res.json(equipmentRepository.updateStatus(req.params.id, status));
  }

  const item = equipmentRepository.update(req.params.id, {
    name: name || existing.name,
    category: category || existing.category,
    description: description !== undefined ? description : existing.description,
    imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
  });
  res.json(item);
}

module.exports = { list, getOne, create, update };