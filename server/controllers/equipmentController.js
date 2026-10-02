const equipmentRepository = require('../db/equipmentRepository');

const CATEGORIES = ['laptop', 'camera', 'sensor', 'other'];

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

  const item = equipmentRepository.create({ name, category, inventoryNumber, description, imageUrl });
  res.status(201).json(item);
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

  let item;
  if (status) {
    item = equipmentRepository.updateStatus(req.params.id, status);
  } else {
    item = equipmentRepository.update(req.params.id, {
      name: name || existing.name,
      category: category || existing.category,
      description,
      imageUrl,
    });
  }

  res.json(item);
}

module.exports = { list, getOne, create, update };