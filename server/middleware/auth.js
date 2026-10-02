const jwt = require('jsonwebtoken');

// Перевіряє, що користувач взагалі увійшов (є валідний токен)
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization; // очікуємо "Bearer <токен>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Потрібна авторизація' });
  }

  const token = authHeader.split(' ')[1]; // беремо частину після "Bearer "

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role }; // прикріплюємо дані до запиту
    next(); // усе добре, йдемо далі до контролера
  } catch (err) {
    return res.status(401).json({ error: 'Невалідний або прострочений токен' });
  }
}

// Перевіряє, що роль користувача - admin. Використовувати ПІСЛЯ authenticate
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступно лише адміністратору' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };