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
        con.query('SELECT * FROM bookingList WHERE done_flag = "N"').then(rows => {
                res.render('indexPanel', {
                    totalBooking: "-",
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

app.route('/showDetails/(:id)')
    .get((req, res, next) => {
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
                        done_flag: rows[0].done_flag
                    })
                }
            })
        })
    })
    .put((req, res, next) => {
        req.assert('done_flag', 'Require Status Perawatan!').notEmpty()

        var errors = req.validationErrors()
        if (!errors) {
            var bookingStatus = {
                done_flag: 'Y'
            }
            mysql.createConnection(config.database).then(function (con) {
                    con.query('UPDATE bookingList SET ? WHERE id = ' + req.params.id, bookingStatus).then(rows => {
                        res.redirect('/panel/dashboard')
                    })
                })
                .catch(err => {
                    res.render('bookingDetailsPanel', {
                        id: req.params.id,
                        namaPemilik: req.body.namaPemilik,
                        alamat: req.body.alamat,
                        nomorTelepon: req.body.nomorTelepon,
                        tanggalService: req.body.tanggalService,
                        waktuService: req.body.waktuService,
                        merkMobil: req.body.merkMobil,
                        tipeMobil: req.body.tipeMobil,
                        jenisPerawatan: req.body.jenisPerawatan,
                        detailPerawatan: req.body.detailPerawatan,
                        harga: req.body.harga,
                        done_flag: req.body.done_flag,
                    })
                })
        } else {
            var error_msg = ''
            errors.forEach(function (error) {
                error_msg += error.msg + '</br>'
            })
            req.flash('error', error_msg)
            console.log(req.body.harga)
            res.render('bookingDetailsPanel', {
                id: req.params.id,
                namaPemilik: req.body.namaPemilik,
                alamat: req.body.alamat,
                nomorTelepon: req.body.nomorTelepon,
                tanggalService: req.body.tanggalService,
                waktuService: req.body.waktuService,
                merkMobil: req.body.merkMobil,
                tipeMobil: req.body.tipeMobil,
                jenisPerawatan: req.body.jenisPerawatan,
                detailPerawatan: req.body.detailPerawatan,
                harga: req.body.harga,
                done_flag: req.body.done_flag,
            })
        }
    })

app.get('/bookingList', (req, res) => {
    mysql.createConnection(config.database).then(function (con) {
        con.query('SELECT * FROM bookingList').then(rows => {
                res.render('tablesPanel', {
                    bookingList: rows
                })
            })
            .catch(err => {
                res.render('tablesPanel', {
                    bookingList: ''
                })
            })
    })
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

// Logout
app.post('/logout', redirectLogin, function (req, res) {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/panel/dashboard')
        }
        res.clearCookie('sid')
        res.redirect('/panel')
    })
})

module.exports = app