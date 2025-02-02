const User = require("../models/userModels");
const AppError = require("../utils/appError");
const restrictTo = (arrayOfRoles) => {
  return async function (req, res, next) {
    const { userId } = req;
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (arrayOfRoles.includes(user.role)) {
      return next();
    }

    next(
      new AppError("You do not have permission to perform this action", 403)
    );
  };
};

module.exports = restrictTo;
