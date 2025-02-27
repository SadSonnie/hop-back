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
} = require("./routes");
const sessionMiddleware = require("./middleware/sessionMiddleware.js");
const tgMiddleware = require("./middleware/tgMiddleware.js")

const PORT = process.env.PORT || 8080;
const app = express();

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

const customFormat =
  ":method :url :status :res[content-length] - :response-time ms :date[iso]";

const logStream = fs.createWriteStream(path.join(__dirname, "logs/http.log"), {
  flags: "a",
});

app.use(morgan(customFormat, { stream: logStream }));

app.use(express.json());

app.use(tgMiddleware);
app.use(sessionMiddleware);

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
