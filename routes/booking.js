const express = require('express')
const app = express()
const bookingController = require('../controller/booking')

// EndPoint
app.get('/', bookingController.showIndex)
app.get('/bookingDetails', bookingController.showBookingDetail)
app.post('/book1', bookingController.postBook1)
app.route('/editBooking')
    .get(bookingController.showEditBooking)
    .post(bookingController.postEditBooking)
app.post('/priceChecking', bookingController.postPriceChecking)
app.post('/booked', bookingController.postBook)

module.exports = app;