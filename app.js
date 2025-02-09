const express = require('express')
const app = express()

// Express Validator Middleware for Form Validation
const expressValidator = require('express-validator')
app.use(expressValidator())

//Setting up templaing view engine - EJS
app.set('view engine', 'ejs')
app.use(express.static("views"))

// body-parser is used to read HTTP POST data from Form Input.
var bodyParser = require('body-parser')
// bodyParser.urlencoded() parses the text as URL encoded data.
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

// Flash messages in order to show success or error message.
const flash = require('express-flash')
app.use(flash())

// Flash require Session
// Express-Session
const session = require('express-session');
app.use(session({
    cookie: {
        maxAge: 6000
    },
    secret: 'weuw',
    resave: false,
    saveUninitialized: false
}))

// Method-Override
var methodOverride = require('method-override')
// Custom logic for overriding method
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

// Routes
const bookingRoute = require('./routes/booking')
const adminPanel = require('./routes/panel')
app.use('/', bookingRoute)
app.use('/panel', adminPanel)

//Localhost:3003
app.listen(3003, () => {
    console.log('Serve Running at Port 3003: http://127.0.0.1:3003')
})