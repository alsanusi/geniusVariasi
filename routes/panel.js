const express = require('express')
const app = express()
const mysql = require('promise-mysql')
const config = require('../config')

app.get('/', (req, res) => {
    mysql.createConnection(config.database).then(function (con) {
        con.query('SELECT * FROM clientOrder').then(rows => {
                res.render('indexPanel', {
                    totalBooking: rows.length,
                    bookingList: rows
                })
            })
            .catch(err => {
                res.render('indexPanel', {
                    totalBooking: '',
                    bookingList: ''
                })
            })
    })
})

app.get('/editBooking', (req, res) => {
    res.render('editBooking')
})

app.get('/listBooking', (req, res) => {
    res.render('listBooking')
})

module.exports = app