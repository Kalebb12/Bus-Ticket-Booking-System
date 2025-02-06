const express = require('express')
const router = express.Router()
const restrictTo = require('../middlewares/restrictAccessMiddleware')
const isAuthenticated = require('../middlewares/protectMiddleware')
const bookingsController = require('../controllers/bookingsController')


router.use(isAuthenticated,restrictTo(['admin'])) 
router.route('/allBookings').get(bookingsController.allBookings)


module.exports = router