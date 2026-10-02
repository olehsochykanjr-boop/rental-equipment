require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); // дозволяє читати JSON з тіла запиту (req.body)

// Тестовий маршрут - перевірка, що сервер живий
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Сервер працює' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено: http://localhost:${PORT}`);
});