const express = require("express");
const protect = require('../middlewares/protectMiddleware');
const userController = require("../controllers/userController");

const router = express.Router();

router.route("/register").post(userController.register);
router.route("/login").post(userController.login);
router.post("/logout", protect ,userController.logout);
router.route('/profile').get(protect, userController.profile).patch(protect, userController.updateProfile);
router.route('/verify/:token').get(userController.verifyEmail);

module.exports = router;