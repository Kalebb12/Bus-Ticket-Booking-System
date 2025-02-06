const mongoose = require("mongoose");
const Ride = require("./rideModel");
const AppError = require("../utils/appError");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A booking must belong to a user"],
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: [true, "A booking must belong to a ride"],
    },
    seatsBooked: {
      type: Number,
      required: [true, "Please specify the number of seats booked"],
      min: [1, "You must book at least one seat"],
    },
    totalPrice: {
      type: Number,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "approved", "canceled", "completed"],
      default: "pending",
    },
    qrCode: {
      type: String,
    },
    notes: {
      type: String,
      default: "",
      maxlength: [200, "Notes must be less than 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Add pre save middleware to calculate total price
bookingSchema.pre("save", async function (next) {
  if (!this.isModified("seatsBooked")) return next();

  const session = await mongoose.startSession(); // Start a new session
  session.startTransaction(); // Begin transaction

  try {
    // Step 1: Find the ride and check available seats
    const ride = await Ride.findOne(
      { _id: this.ride, availableSeats: { $gte: this.seatsBooked } },
      null, // No projection
      { session } // Execute inside the transaction
    );

    if (!ride) {
      await session.abortTransaction(); // Cancel the transaction
      session.endSession();
      return next(
        new AppError("Ride not found or not enough seats available", 400)
      );
    }

    // Step 3: Calculate and store total price
    this.totalPrice = ride.pricePerSeat * this.seatsBooked;

    // If it's an update (not a new booking)
    if (!this.isNew) {
      const originalBooking = await Bookings.findById(this._id).session(session);
      if (originalBooking) {
        // Restore the original number of seats first
        ride.availableSeats += originalBooking.seatsBooked;
      }
    }

    // Step 2: Update the availableSeats
    ride.availableSeats -= this.seatsBooked;
    await ride.save({ session });

    // Step 4: Commit the transaction
    await session.commitTransaction();
    session.endSession();
    next();
  } catch (error) {
    await session.abortTransaction(); // Rollback if something goes wrong
    session.endSession();
    next(new AppError("An error occurred while processing your request", 500));
  }
});

const Bookings = mongoose.model("Bookings", bookingSchema);
module.exports = Bookings;
