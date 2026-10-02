const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../db/userRepository');

function register(req, res) {
  const { name, email, password, role } = req.body;

  // Перевірка, що всі поля прийшли
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Заповніть усі поля: name, email, password, role' });
  }

  if (!['student', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'role має бути student або admin' });
  }

  // Чи email вже зайнятий
  const existing = userRepository.findByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Користувач з таким email вже існує' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = userRepository.createUser({ name, email, passwordHash, role });

  res.status(201).json({ message: 'Користувача створено', user });
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Вкажіть email і password' });
  }

  const user = userRepository.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Невірний email або пароль' });
  }

  const passwordMatches = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Невірний email або пароль' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

module.exports = { register, login };