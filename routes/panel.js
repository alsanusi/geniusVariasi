const express = require('express')
const app = express()
const mysql = require('promise-mysql')
const config = require('../config')

// Admin Credentials
const admin = {
    id: '1',
    username: 'nyzam',
    pass: '123'
}

app.post('/login', (req, res) => {
    var username = req.body.username
    var password = req.body.password
    if (username == admin.username && password == admin.pass){
        console.log('Success Login!')
    } else {
        console.log('Failed Login!')
    }
})

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

app.get('/login', (req, res) => {
    res.render('panelLogin')
})

app.get('/tablesPanel', (req, res) => {
    res.render('tablesPanel')
})

app.get('/showDetails', (req, res) => {
    res.render('bookingDetailsPanel')
})

app.get('/showDetails/(:id)', (req, res, next) => {
    req.getConnection(function (err, con) {
        con.query('SELECT * FROM clientOrder WHERE id = ?', [req.params.id], function (err, rows, fields) {
            if (err) {
                throw err
            } else {
                res.render('showBookingDetails', {
                    id: rows[0].id,
                    namaPemilik: rows[0].namaPemilik,
                    merkMobil: rows[0].merkMobil,
                    tanggalService: rows[0].tanggalService
                })
            }
        })
    })
})

app.get('/listBooking', (req, res) => {
    res.render('listBooking')
})

app.get('/editBooking', (req, res) => {
    res.render('editBooking')
})

// Delete
app.delete('/deleteDetails/(:id)', (req, res) => {
    var clientId = {
        id: req.params.id
    }

    req.getConnection(function (err, con) {
        con.query('DELETE FROM clientOrder WHERE id = ' + req.params.id, clientId, function (err, result) {
            if (err) {
                throw err
            } else {
                res.redirect('/panel')
            }
        })
    })
})

//Car Treatment
app.get('/carTreatmentList', (req, res) => {
    req.getConnection(function (err, con) {
        con.query('SELECT * FROM carTreatment', function (err, rows, fields) {
            if (err) {
                throw err
            } else {
                res.json(rows)
            }
        })
    })
})

module.exports = app