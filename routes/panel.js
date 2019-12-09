const express = require('express')
const app = express()

// Panel Controller
const panelController = require('../controller/panel')

app.get('/', panelController.showIndex)
app.post('/login', panelController.redirectHome, panelController.postLogin)
app.get('/dashboard', panelController.redirectLogin, panelController.showDashboard)
app.post('/report', panelController.redirectLogin, panelController.postReport)
app.route('/pricingList', panelController.redirectLogin)
    .get(panelController.showPricingList)
    .post(panelController.postPricingList)
app.put('/pricingListDetails', panelController.redirectLogin, panelController.updatePricingList)
app.route('/showDetails/(:id)', panelController.redirectLogin)
    .get(panelController.showDetailBasedOnId)
    .put(panelController.updateDetailBasedOnId)
app.get('/bookingList', panelController.redirectLogin, panelController.showBookingList)
app.delete('/deleteDetails/(:id)', panelController.redirectLogin, panelController.removeDetailBasedOnId)
app.post('/logout', panelController.redirectLogin, panelController.logout)

module.exports = app;