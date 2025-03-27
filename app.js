const express = require("express");
const cors = require("cors");

const app = express();

const publisherRouter = require("./app/routers/nhaxuatban.route");
const readerRouter = require("./app/routers/docgia.route");
const staffRouter = require("./app/routers/nhanvien.route");
const bookRouter = require("./app/routers/sach.route");
const trackingBookRouter = require("./app/routers/theodoimuonsach.route");
const ApiError = require("./app/api-error");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Borrow Book Application" });
});

app.use("/api/staff", staffRouter);
app.use("/api/book", bookRouter);
app.use("/api/publisher", publisherRouter);
app.use("/api/reader", readerRouter);
app.use("/api/borrowed-book-tracking", trackingBookRouter);

app.use((req, res, next) => {
  return next(new ApiError(404, "404 not found"));
});

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

module.exports = app;