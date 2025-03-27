const express = require("express");
const cors = require("cors");

const app = express();

const publisherRouter = require("./app/routers/nhaxuatban.route");
const readerRouter = require("./app/routers/docgia.route");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Borrow Book Application" });
});

app.use("/api/publisher", publisherRouter);
app.use("/api/reader", readerRouter);

app.use((req, res, next) => {
  return next(new ApiError(404, "404 not found"));
});

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

module.exports = app;