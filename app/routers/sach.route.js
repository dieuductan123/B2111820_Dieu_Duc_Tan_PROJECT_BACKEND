const express = require("express");
const books = require("../controllers/sach.controller");

const router = express.Router();

router.route("/").get(books.findAll).post(books.create).delete(books.deleteAll);

router.route("/count").get(books.countAll);

router.route("/update-quantity").post(books.updateQuantity);

router.route("/:id").get(books.findOne).post(books.update).delete(books.delete);

module.exports = router;