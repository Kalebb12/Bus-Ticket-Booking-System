const Bookings = require("../models/bookingModels");
const Ride = require("../models/rideModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateQRCode = require("../utils/generateQRCode");

exports.createBookings = catchAsync(async (req, res, next) => {
  const { rideId, seatsBooked, notes } = req.body;
  const ride = await Ride.findById(rideId);
  if (!ride) {
    return next(new AppError("No ride found with that ID", 404));
  }
  if (ride.availableSeats < seatsBooked) {
    return next(new AppError("Not enough seats available", 400));
  }

  const booking = await Bookings.create({
    user: req.userId,
    ride: rideId,
    seatsBooked,
    notes,
  });

  await booking.save({
    isNew: true,
  });
  const qrCode = await generateQRCode(booking._id.toString());

  booking.qrCode = qrCode;
  await booking.save({
    isNew: true,
  });

  // Populate ride and user details for the ticket
  // const populatedBooking = await Booking.findById(booking._id)
  //   .populate("user", "email")
  //   .populate("ride", "name route.from route.to");

  // Send the ticket to the user's email
  // await sendTicket(populatedBooking.user.email, qrCode, populatedBooking);

  res.status(201).json({
    status: "success",
    data: booking,
  });
});

exports.getBookings = catchAsync(async (req, res, next) => {
  const bookings = await Bookings.find();
  res.status(200).json({
    status: "success",
    length: bookings.length,
    data: bookings,
  });
});

exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Bookings.findById(req.params.id)
    .populate("user", "username email")
    .populate(
      "ride",
      "name route.from route.to status parkingAddress schedule"
    );
  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: booking,
  });
});

exports.getUserBookings = catchAsync(async (req, res, next) => {
  const bookings = await Bookings.find({ user: req.userId });
  res.status(200).json({
    status: "success",
    length: bookings.length,
    data: bookings,
  });
});

exports.updateBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { notes, seatsBooked } = req.body;
  if (!notes && !seatsBooked) {
    return next(new AppError("Please provide notes or seatsBooked", 400));
  }
  const booking = await Bookings.findById(id);
  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }
  if(notes){
    booking.notes = notes.trim();
  }
  if(seatsBooked){
    booking.seatsBooked = seatsBooked;
  }
  await booking.save();
  res.status(200).json({
    status: "success",
    data: booking,
  });
});
