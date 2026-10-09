require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Маршрути API
app.use(express.static(path.join(__dirname, '../client')));
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/rentals', rentalRoutes);

// Тестовий маршрут - перевірка, що сервер живий
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер працює' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});