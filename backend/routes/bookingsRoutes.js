const express = require("express");
const protect = require("../middlewares/protectMiddleware");
const bookingsController = require("../controllers/bookingsController");
const restrictTo = require("../middlewares/restrictAccessMiddleware");
const protectBooking = require("../middlewares/protectBooking");
const router = express.Router();

router
  .route("/")
  .post(protect, bookingsController.createBookings)
  .get(protect, protect, bookingsController.getUserBookings);

router
  .route("/:id")
  .get(bookingsController.getBooking)
  .patch(protect ,protectBooking, bookingsController.updateBooking);

module.exports = router;

