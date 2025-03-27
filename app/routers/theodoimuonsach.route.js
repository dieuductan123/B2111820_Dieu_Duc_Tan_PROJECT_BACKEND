const express = require("express");
const trackBookBorrowing = require("../controllers/theodoimuonsach.controller");

const router = express.Router();

router
  .route("/")
  .get(trackBookBorrowing.findAll)
  .post(trackBookBorrowing.create);

router.route("/update/:id").post(trackBookBorrowing.update);

router.route("/detail").get(trackBookBorrowing.findOne);

router.route("/damuon").get(trackBookBorrowing.findBorrowedOfReader);

router.route("/history/:id").get(trackBookBorrowing.getHistoryOfReader);

router.route("/masach/:masach").get(trackBookBorrowing.findByMaSach);

router.route("/:id").delete(trackBookBorrowing.delete);

module.exports = router;