const catchAsync = require("../utils/catchAsync");
const Rides = require("../models/rideModel");
const AppError = require("../utils/appError");

exports.availableRides = catchAsync(async (req, res) => {
  // get rides with status not canceled or completed and schedule is greater than current date
  const rides = await Rides.find({
    status: { $nin: ["canceled", "completed"] },
    schedule: { $gte: new Date() },
  }).select("-__v");
  res.status(200).json({
    status: "success",
    length: rides.length,
    data: rides,
  });
});

exports.createRide = catchAsync(async (req, res) => {
  const {
    name,
    plateNumber,
    route,
    totalSeats,
    availableSeats,
    schedule,
    pricePerSeat,
    arrivalAddress,
    parkingAddress,
    parkingCoordinates,
  } = req.body;
  const newRide = await Rides.create({
    name,
    plateNumber,
    route,
    totalSeats,
    availableSeats,
    schedule,
    pricePerSeat,
    parkingCoordinates,
    parkingAddress,
    arrivalAddress,
  });
  res.status(201).json({
    status: "success",
    data: newRide,
  });
});

exports.cancelRide = catchAsync(async (req, res, next) => {
  const ride = await Rides.findById(req.params.id);
  if (!ride) {
    return next(new AppError("No ride found with that ID", 404));
  }
  
  // Mark the ride as canceled
  ride.status = "canceled";
  await ride.save();

  // Optionally, update all bookings for this bus
  //  await Booking.updateMany({ busId: bus._id }, { $set: { status: 'canceled' } });

  res.status(200).json({
    status: "success",
    message: "Ride canceled successfully",
  });
});

exports.updateRide = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const allowedUpdates = [
    "schedule",
    "name",
    "pricePerSeat",
    "totalSeats",
    "availableSeats",
    "plateNumber",
    "parkingAddress",
    "arrivalAddress",
    "parkingCoordinates",
  ];

  // Only update allowed fields
  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Update the ride document
  const updatedRide = await Rides.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedRide) {
    return res.status(404).json({ message: "Ride not found" });
  }

  res.status(200).json({
    status: "success",
    data: updatedRide,
  });
});

exports.searchRides = catchAsync(async (req, res, next) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return next(
      new AppError("Please provide both 'from' and 'to' parameters", 400)
    );
  }

  const rides = await Rides.find({
    "route.from": from.toUpperCase(),
    "route.to": to.toUpperCase(),
    status: "active", // Exclude canceled/completed rides
    availableSeats: { $gt: 0 }, // Only show rides with available seats
  });

  if (!rides.length) {
    return next(new AppError("No rides found for the specified route", 404));
  }

  res.status(200).json({ length: rides.length, success: true, data: rides });
});


exports.getRide = catchAsync(async (req, res, next) => {
  const ride = await Rides.findById(req.params.id);
  if (!ride) {
    return next(new AppError("No ride found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: ride,
  });
})