const express = require("express");
const isAuthenticated = require("../middlewares/protectMiddleware");
const bookingsController = require("../controllers/bookingsController");
const restrictTo = require("../middlewares/restrictAccessMiddleware");
const protectBooking = require("../middlewares/protectBooking");
const router = express.Router();

router
  .route("/")
  .post(isAuthenticated, bookingsController.createBookings)
  .get(isAuthenticated, bookingsController.getUserBookings);

router
  .route("/:id")
  .get(isAuthenticated,protectBooking ,bookingsController.getBooking)
  .patch(isAuthenticated, protectBooking, bookingsController.updateBooking);


router.get("/verify/:bookingId",bookingsController.verifyBooking);


module.exports = router;