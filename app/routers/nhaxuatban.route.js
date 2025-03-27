const express = require("express");
const publisher = require("../controllers/nhaxuatban.controller");

const router = express.Router();

router
  .route("/")
  .get(publisher.findAll)
  .post(publisher.create)
  .delete(publisher.deleteAll);

router
  .route("/:id")
  .get(publisher.findOne)
  .post(publisher.update)
  .delete(publisher.delete);

module.exports = router;
