const express = require("express");
const reader = require("../controllers/docgia.controller");

const router = express.Router();

router
  .route("/")
  .get(reader.findAll)
  .post(reader.create)
  .delete(reader.deleteAll);

router.route("/login").post(reader.login);

router
  .route("/:id")
  .get(reader.findOne)
  .post(reader.update)
  .delete(reader.delete);

module.exports = router;
