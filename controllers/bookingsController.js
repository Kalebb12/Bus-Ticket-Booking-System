const Bookings = require("../models/bookingModels");
const Ride = require("../models/rideModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendTicketConfirmationEmail = require("../templates/emailTickets");
const sendEmail = require("../utils/sendEmail");
const  generateQRCodeBuffer = require('../utils/generateQrCodeBuffer')

const BASE_URL =
  process.env.NODE_ENV !== "production"
    ? process.env.DEV_URL
    : process.env.PROD_URL;

exports.createBookings =  catchAsync(async (req, res, next) => {
  const { rideId, seatsBooked, notes } = req.body;
  
  // 1. Find the ride and validate constraints
  const ride = await Ride.findOne({
    _id: rideId,
    status: { $nin: ["canceled", "completed"] },
    schedule: { $gte: new Date() },
  });

  if (!ride) return next(new AppError("No ride found with that ID", 404));

  if (ride.availableSeats < seatsBooked) {
    return next(new AppError("Not enough seats available", 400));
  }

  // 2. Create booking document (do not save yet)
  const booking = new Bookings({
    user: req.userId,
    ride: rideId,
    seatsBooked,
    notes,
  });

  // 3. Generate QR code buffer asynchronously
  const verificationUrl = `${BASE_URL}api/bookings/verify/${booking._id}`
  const qrCodeBufferPromise = generateQRCodeBuffer(verificationUrl);

  // 5. Save booking first before QR code is ready
  await booking.save();

  // 6. Wait for QR Code buffer generation
  const qrCodeBuffer = await qrCodeBufferPromise;
  booking.qrCode = `data:image/png;base64,${qrCodeBuffer.toString("base64")}`;

  // 7. Save booking with QR Code
  await booking.save();

  // 8. Populate user and ride details
  const populatedBooking = await booking.populate([
    { path: "user", select: "username email" },
    { path: "ride", select: "name schedule route" },
  ]);

  // 9. Respond to user immediately (do not wait for email)
  res.status(201).json({
    status: "success",
    data: populatedBooking,
  });

  // 10. Send email asynchronously
  setImmediate(async () => {
    try {
      await sendEmail({
        to: req.userEmail,
        subject: "Ticket Booked Successfully",
        text: `Your ticket has been booked for ride: ${ride.name} from ${ride.route.from} to ${ride.route.to}.`,
        html: sendTicketConfirmationEmail(populatedBooking),
        attachments: [{
          filename: "ticket-qrcode.png",
          content: qrCodeBuffer,
          encoding: "base64",
          cid: "qrcodecid",
        }],
      });
    } catch (error) {
      console.error("Error sending email:", error.message);
      return next(new AppError(error.message , 404));
    }
  });

  // 11. Save ride update in the background
  await rideSavePromise;
});


exports.allBookings = catchAsync(async (req, res, next) => {
  // get all bookings
  const bookings = await Bookings.find()
    .populate("user", "username email")
    .populate("ride", "name route.from route.to");

  if (!bookings) {
    return next(new AppError("No bookings found", 404));
  }

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
  if (notes) {
    booking.notes = notes.trim();
  }
  if (seatsBooked) {
    booking.seatsBooked = seatsBooked;
  }
  await booking.save();
  res.status(200).json({
    status: "success",
    data: booking,
  });
});


exports.verifyBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  // Find the booking by ID
  const booking = await Bookings.findById(bookingId).populate("ride user", "name route username email");

  if (!booking) {
    return next(new AppError("Invalid or expired ticket", 404));
  }

  // Check if the ride is still valid
  if (booking.ride.schedule < new Date()) {
    return next(new AppError("Ticket expired, ride already departed", 400));
  }

  // If tickets are one-time use, check and mark as used
  if (booking.isUsed) {
    return next(new AppError("Ticket already used", 400));
  }

  // Respond with booking details
  res.status(200).json({
    status: "success",
    message: "Ticket verified successfully",
    data: {
      bookingId: booking._id,
      ride: booking.ride.name,
      route: `${booking.ride.route.from} to ${booking.ride.route.to}`,
      user: booking.user.username,
      email: booking.user.email,
      seatsBooked: booking.seatsBooked,
    },
  });
})