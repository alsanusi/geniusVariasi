//Load app server using Express
const express = require('express')
const app = express()

// Testing Root
app.get('/', (req, res) => {
    res.render('index');
})

module.exports = app;