const User = require("../models/userModels");
const bcrypt = require("bcryptjs");
const createSignToken = require("../utils/createSignToken");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const AppError = require("../utils/appError");
const sendVerificationEmail = require("../templates/emailVerificationTemplate");
const isTokenExpired = require("../utils/istokenExpired");

const BASE_URL =
  process.env.NODE_ENV !== "production"
    ? process.env.DEV_URL
    : process.env.PROD_URL4;
// register controller
exports.register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  const newUser = await User.create({ username, email, password });
  //  Create a token for the user
  const token = createSignToken(newUser._id, "30m");
  newUser.verificationToken = token;
  // newUser.verificationTokenExpiresIn = Date.now() + 3600000; // 1 hour
  await newUser.save();

  const template = sendVerificationEmail(
    username,
    `${BASE_URL}api/users/verify/${token}`
  );

  await sendEmail(
    {
      to: newUser.email,
      subject: "Verify Account",
      text: `Hi ${newUser.username}, you just registed your account.`,
      html: template,
    },
    next
  );

  // Send the token to the user in a cookie
  // res.cookie("token", token, {
  //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  //   secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
  //   httpOnly: true,
  // });

  res.status(201).json({
    status: "success",
    data: {
      userId: newUser._id,
    },
  });
});

// login controller
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide email and password",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.isVerified) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid Credentials",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid Credentials",
    });
  }

  const token = createSignToken(user._id);
  // Send the token to the user in a cookie
  res.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      userId: user._id,
    },
  });
});

// logout controller
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    status: "success",
    message: "User logged out",
  });
};

// profile controller
exports.profile = catchAsync(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// update profile controller
exports.updateProfile = catchAsync(async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }
  if (username) user.username = username;
  if (email) user.email = email;
  await user.save({ validateBeforeSave: true });
  res.status(200).json({
    status: "success",
    message: "User updated successfully",
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  let token = req.params.token;
  if (!token) {
    return next(new AppError("No token provided", 400));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    token = createSignToken(user._id);
    await user.save();
  } catch (error) {
    return next(new AppError("Invalid token", 401));
  }

  // Send the token to the user in a cookie
  res.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
    httpOnly: true,
  });

  // redirect to homepage
  // res.redirect('')
  res.status(200).json({
    status: "success",
    message: "Email verified successfully",
    token,
  });
});

exports.resendToken = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new AppError("User not found", 404));
  if (user.isVerified) return next(new AppError("User already verified", 400));

  // Generate new verification token
  const token = createSignToken(user._id, "30m");

  // Update user document efficiently
  await User.updateOne({ _id: user._id }, { verificationToken: token });

  // Generate email verification template
  const template = sendVerificationEmail(user.username, `${BASE_URL}api/users/verify/${token}`);

  // Send verification email
  await sendEmail({
    to: user.email,
    subject: "Verify Your Account",
    html: template,
  });

  res.status(200).json({
    status: "success",
    message: "Verification email sent successfully",
  });
});

exports.validateToken = catchAsync(async (req,res,next) => {
  const { token } = req.cookies;
  if (!token) return next(new AppError("No token provided", 400));

  const isExpired = isTokenExpired(token);
  if (isExpired) return next(new AppError("Token expired", 400));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError("User not found", 404));
    res.status(200).json({
      status: "success",
      message: "Token is valid",
    });
  } catch (error) {
    return next(new AppError("Invalid token", 401));
  }
})
// todo: add update password controller and email confimation
