require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); 
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const equipmentRoutes = require('./routes/equipmentRoutes');
app.use('/api/equipment', equipmentRoutes);


// Тестовий маршрут - перевірка, що сервер живий
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Сервер працює' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено: http://localhost:${PORT}`);
});