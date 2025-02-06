const AppError = require("../utils/appError");
const restrictTo = (arrayOfRoles) => {
  return async function (req, res, next) {
    const { userRole } = req;

    if (arrayOfRoles.includes(userRole)) {
      return next();
    }

    next(
      new AppError("You do not have permission to perform this action", 403)
    );
  };
};

module.exports = restrictTo;
