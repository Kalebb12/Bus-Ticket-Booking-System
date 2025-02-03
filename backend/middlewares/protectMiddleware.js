const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const User = require("../models/userModels");
const catchAsync = require("../utils/catchAsync");
module.exports = catchAsync(
  async(req, res, next) => {
    const token = req.cookies.token;
  
    if (!token) {
      return next(new appError("You are not logged in. Please log in to get access.", 401));
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
      if (!user) {
        return next(new appError("User not found", 404));
      }
      req.userId = user._id;
      req.userRole = user.role;
  
      next();
    } catch (error) {
      return next(new appError("Invalid token. Please log in again.", 401));
    }
  }
)