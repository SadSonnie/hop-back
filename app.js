const express = require('express');
const app = express();

// Увеличиваем лимиты для обработки больших запросов
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ... остальной код ... 