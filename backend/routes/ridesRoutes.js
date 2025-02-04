const express = require("express");
const ridesController = require("../controllers/ridesController");
const protect = require("../middlewares/protectMiddleware");
const restrictTo = require("../middlewares/restrictAccessMiddleware");

const router = express.Router();

router
  .route("/")
  .get(ridesController.availableRides)
  .post(protect, restrictTo(["admin"]), ridesController.createRide);

router.route("/search").get(ridesController.searchRides);
router
  .route("/:id")
  .get(ridesController.getRide)
  .patch(protect, restrictTo(["admin"]), ridesController.cancelRide)
  .put(protect, restrictTo(["admin"]), ridesController.updateRide);

module.exports = router;
