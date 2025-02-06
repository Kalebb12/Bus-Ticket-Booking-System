const mongoose = require("mongoose");
const app = require("./app");

const port = process.env.PORT || 5000;

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit the process if connection fails
  }
};

// Call the function to connect
connectDB();

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION ���� terminating server..");
  console.log(err.name, err.message);
  process.exit(1);
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION 👋👋 terminating server..");
  server.close(() => {
    process.exit(1);
  });
});

module.exports = connectDB;