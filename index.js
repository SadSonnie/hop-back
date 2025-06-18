const express = require("express");
require("dotenv").config();
const cors = require("cors");
const errorMiddleware = require("./middleware/errorMiddleware.js");
const session = require("express-session");
const db = require("./models/index.js");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const {
  userRoutes,
  feedRoutes,
  tagRoutes,
  categoriesRoutes,
  proposalsRoutes,
  filtersRoutes,
  moderationRoutes,
  placesRouter,
  searchRoutes,
  profileRoutes,
  collectionsRouter,
  metricsRouter,
  favoritePlacesRouter,
  reviewRoutes,
  chatRoutes,
  checklistRoutes,
  featureRoutes,
  contextualTagsRouter,
  placeContextualTagsRouter,
  placeUserPhotosTitleRouter,
  clickRoutes,
  articleRoutes
} = require("./routes");
const sessionMiddleware = require("./middleware/sessionMiddleware.js");
const tgMiddleware = require("./middleware/tgMiddleware.js")

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  credentials: true
}));

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 5 * 60 * 1000,
      httpOnly: true,
    },
  }),
);

// Serve static files from uploads directory - должно быть до middleware аутентификации
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Упрощенный формат логирования
const customFormat = ":method :url :status - :response-time ms";

const logStream = fs.createWriteStream(path.join(__dirname, "logs/http.log"), {
  flags: "a",
});

// Логируем только ошибки
app.use(morgan(customFormat, { 
  skip: function (req, res) { return res.statusCode < 400 },
  stream: logStream 
}));

// Public routes that don't require authentication
app.use("/api/articles", articleRoutes); // Public articles API
app.use("/api", clickRoutes); // Public clicks API

// Debug middleware
app.use((req, res, next) => {
    console.error('\x1b[31m%s\x1b[0m', '!!! [1] First debug middleware !!!');
    console.error('URL:', req.url);
    console.error('Method:', req.method);
    next();
});

console.error('\x1b[31m%s\x1b[0m', '!!! Mounting feature routes !!!');
app.use("/api", (req, res, next) => {
    console.error('\x1b[31m%s\x1b[0m', '!!! [2] Before features middleware !!!');
    console.error('URL:', req.url);
    // Если это запрос к features, обрабатываем его здесь
    if (req.url.startsWith('/features')) {
        return featureRoutes(req, res, next);
    }
    // Иначе пропускаем
    next();
});
console.error('\x1b[31m%s\x1b[0m', '!!! Feature routes mounted !!!');

// Apply global middleware for protected routes
app.use((req, res, next) => {
    console.error('\x1b[31m%s\x1b[0m', '!!! [3] Before auth middleware !!!');
    console.error('URL:', req.url);
    next();
});

app.use(tgMiddleware);
app.use(sessionMiddleware);

app.use((req, res, next) => {
    console.error('\x1b[31m%s\x1b[0m', '!!! [4] After auth middleware !!!');
    console.error('URL:', req.url);
    next();
});

// Protected API routes
app.use("/api", userRoutes);
app.use("/api", feedRoutes);
app.use("/api", tagRoutes);
app.use("/api", categoriesRoutes);
app.use("/api", proposalsRoutes);
app.use("/api", filtersRoutes);
app.use("/api", moderationRoutes);
app.use("/api", placesRouter);
app.use("/api", searchRoutes);
app.use("/api", profileRoutes);
app.use("/api", collectionsRouter);
app.use("/api", metricsRouter);
app.use("/api", favoritePlacesRouter);
app.use("/api", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", checklistRoutes);
app.use("/api", featureRoutes);
app.use("/api/contextual-tags", contextualTagsRouter);
app.use("/api/place-contextual-tags", placeContextualTagsRouter);
app.use("/api", placeUserPhotosTitleRouter);

app.use(errorMiddleware);

// Синхронизация моделей с базой данных
db.sequelize
  .sync({ alter: true }) // Опция alter обновляет таблицы без удаления данных
  .then(() => {
    console.log("База данных успешно синхронизирована.");
  })
  .catch((error) => {
    console.error("Ошибка при синхронизации базы данных:", error);
  });

app.listen(PORT, () => {
  console.log("Server run");
});
