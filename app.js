const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const ridesRouter = require("./routes/ridesRoutes");
const bookingRouter = require("./routes/bookingsRoutes");
const adminRouter = require("./routes/adminRoutes");
const cors = require('cors')
const globalErrorHandler = require("./controllers/errorController");

dotenv.config();
const app = express();

const whitelist = ['http://localhost:3000', 'http://localhost:8080']; // Add your localhost ports

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true); // Allow requests from whitelisted origins or local host
    } else {
      callback(new Error('Not allowed by CORS')); // Reject requests from other origins
    }
  },
  credentials: true, // Required for cookie/HTTP authentication
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());



app.use("/api/users", userRouter);
app.use('/api/rides', ridesRouter)
app.use('/api/bookings', bookingRouter)
app.use("/api/admin", adminRouter);

app.all('*',(req , res,next)=>{
    const err = new AppError(`Can't find ${req.originalUrl} on this server`,404);
    next(err);
})

app.use(globalErrorHandler)

module.exports = app;