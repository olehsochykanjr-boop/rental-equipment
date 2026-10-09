const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../db/userRepository');

function register(req, res) {
  // role навмисно НЕ читаємо з запиту: інакше будь-хто зареєструється адміном
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Заповніть усі поля: name, email, password' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Невірний формат email' });
  }

  if (password.length < 5) {
    return res.status(400).json({ error: 'Пароль має містити щонайменше 5 символів' });
  }

  const existing = userRepository.findByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Користувач з таким email вже існує' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = userRepository.createUser({ name, email, passwordHash, role: 'student' });

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