const express = require('express')
const app = express()
const mysql = require('promise-mysql')
const config = require('../config')

// Admin Credentials
const admin = {
    id: '1',
    username: 'admin',
    pass: '123'
}

//Session Checking
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/panel')
    } else {
        next()
    }
}

const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/panel/dashboard')
    } else {
        next()
    }
}

app.get('/', (req, res) => {
    res.render('panelLogin', {
        lg: req.body
    })
})

app.post('/login', redirectHome, (req, res) => {
    var username = req.body.username
    var password = req.body.password
    if (username === admin.username && password === admin.pass) {
        req.session.userId = admin.id
        return res.redirect('/panel/dashboard')
    } else {
        var error_msg = "Wrong Username and Password"
        req.flash('error', error_msg)
        res.render('panelLogin', {
            lg: req.query
        })
    }
})

app.get('/dashboard', (req, res) => {
    mysql.createConnection(config.database).then(function (con) {
        con.query('SELECT * FROM bookingList').then(rows => {
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

app.get('/tablesPanel', (req, res) => {
    res.render('tablesPanel')
})

app.get('/showDetails/(:id)', (req, res, next) => {
    req.getConnection(function (err, con) {
        con.query('SELECT * FROM bookingList WHERE id = ?', [req.params.id], function (err, rows, fields) {
            if (err) {
                throw err
            } else {
                res.render('bookingDetailsPanel', {
                    id: rows[0].id,
                    namaPemilik: rows[0].namaPemilik,
                    alamat: rows[0].alamat,
                    nomorTelepon: rows[0].nomorTelepon,
                    tanggalService: rows[0].tanggalService,
                    waktuService: rows[0].waktuService,
                    merkMobil: rows[0].merkMobil,
                    tipeMobil: rows[0].tipeMobil,
                    jenisPerawatan: rows[0].jenisPerawatan,
                    detailPerawatan: rows[0].detailPerawatan,
                    harga: rows[0].harga,
                    done_flag: rows[0].done_flag,
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
        con.query('DELETE FROM bookingList WHERE id = ' + req.params.id, clientId, function (err, result) {
            if (err) {
                throw err
            } else {
                res.redirect('/panel/dashboard')
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