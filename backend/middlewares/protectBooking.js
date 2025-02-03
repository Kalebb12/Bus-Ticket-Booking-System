const Booking = require("../models/bookingModels"); // Import Booking model
const AppError = require("../utils/appError"); // Custom error handling
const catchAsync = require("../utils/catchAsync");

const protectBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id); // Get booking by ID
  //   console.log(req.userId)

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  // Check if user is the creator of the booking OR an admin
  if (
    booking.user.toString() !== req.userId.toString() &&
    req.userRole !== "admin"
  ) {
    return next(new AppError("Not authorized to modify this booking", 403));
  }

  next(); // User is authorized, continue
});

module.exports = protectBooking;
