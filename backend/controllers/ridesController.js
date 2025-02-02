const catchAsync = require("../utils/catchAsync");
const Bus = require("../models/rideModel");
const AppError = require("../utils/appError");

exports.availableRides = catchAsync(async (req, res) => {
  // get rides with status not canceled or completed and schedule is greater than current date
  const buses = await Bus.find({
    status: { $nin: ["canceled", "completed"] },
    schedule: { $gte: new Date() },
  }).select("-__v");
  res.status(200).json({
    status: "success",
    length: buses.length,
    data: buses,
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
  const newBus = await Bus.create({
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
    data: newBus,
  });
});

exports.cancelRide = catchAsync(async (req, res, next) => {
  const bus = await Bus.findById(req.params.id);

  if (!bus) {
    next(new AppError("No bus found with that ID", 404));
  }

  // Mark the bus as canceled
  bus.status = "canceled";
  await bus.save();

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

  // Update the bus document
  const updatedBus = await Bus.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedBus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  res.status(200).json({
    status: "success",
    data: updatedBus,
  });
});

exports.searchRides = catchAsync(async (req, res, next) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return next(
      new AppError("Please provide both 'from' and 'to' parameters", 400)
    );
  }

  const buses = await Bus.find({
    "route.from": from.toUpperCase(),
    "route.to": to.toUpperCase(),
    status: "active", // Exclude canceled/completed buses
    availableSeats: { $gt: 0 }, // Only show buses with available seats
  });

  if (!buses.length) {
    return next(new AppError("No buses found for the specified route", 404));
  }

  res.status(200).json({ length: buses.length, success: true, data: buses });
});


exports.getRide = catchAsync(async (req, res, next) => {
  const bus = await Bus.findById(req.params.id);
  if (!bus) {
    return next(new AppError("No bus found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: bus,
  });
})