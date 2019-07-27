//Load app server using Express
const express = require('express')
const app = express()

// Default
app.get('/', (req, res) => {
    res.render('index');
})

app.get('/bookingDetails', (req, res) => {
    res.render('bookingDetails', {
        namaPemilik: '',
        alamat: '',
        tanggalService: ''
    })
})

app.post('/book1', (req, res) => {
    res.render('bookingDetails', {
        namaPemilik: req.body.namaPemilik,
        alamat: req.body.alamat,
        nomorTelepon: '',
        tanggalService: req.body.tanggalService,
        waktuService: '',
        merkMobil: '',
        tipeMobil: '',
        jenisPerawatan: '',
        detailPerawatan: ''
    })
})

app.post('/priceChecking', (req, res) => {
    var clientCar = {
        merkMobil: req.body.merkMobil,
        tipeMobil: req.body.tipeMobil,
        jenisPerawatan: req.body.jenisPerawatan,
        detailPerawatan: req.body.detailPerawatan
    }
    req.getConnection(function (err, con) {
        con.query("SELECT harga FROM carTreatment WHERE merkMobil = '" + clientCar.merkMobil + "' AND tipeMobil= '" + clientCar.tipeMobil + "' AND jenisPerawatan= '" + clientCar.jenisPerawatan + "' AND detailPerawatan= '" + clientCar.detailPerawatan + "'; ", function (err, rows, fields) {
            if (err) {
                throw err
            } else {
                res.render('pricingDetails', {
                    namaPemilik: req.body.namaPemilik,
                    alamat: req.body.alamat,
                    nomorTelepon: req.body.nomorTelepon,
                    tanggalService: req.body.tanggalService,
                    waktuService: req.body.waktuService,
                    merkMobil: req.body.merkMobil,
                    tipeMobil: req.body.tipeMobil,
                    jenisPerawatan: req.body.jenisPerawatan,
                    detailPerawatan: req.body.detailPerawatan,
                    harga: rows[0].harga
                })
            }
        })
    })
})

app.post('/book1/details', (req, res) => {
    // Input Form Validation
    req.assert('namaPemilik', 'Required Nama Pemilik!').notEmpty()
    req.assert('merkMobil', 'Require Merk Mobil!').notEmpty()
    req.assert('tanggalService', 'Require Tanggal Service!').notEmpty()

    var errors = req.validationErrors()

    if (!errors) {
        var clientData = {
            namaPemilik: req.sanitize('namaPemilik').escape().trim(),
            merkMobil: req.sanitize('merkMobil').escape().trim(),
            tanggalService: req.sanitize('tanggalService').escape().trim(),
        }
        req.getConnection(function (err, con) {
            con.query('INSERT INTO clientOrder SET ?', clientData, function (err, result) {
                // If Throw Error
                if (err) {
                    req.flash('error', err)
                    res.render('bookingDetails', {
                        namaPemilik: clientData.namaPemilik,
                        merkMobil: clientData.merkMobil,
                        tanggalService: clientData.tanggalService,
                    })
                } else {
                    req.flash('success', 'Client Service Data Input Successfully!')
                    res.redirect('/bookingDetails')
                }
            })
        })
    } else {
        // When error occurs, the message will show.
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '</br>'
        })
        req.flash('error', error_msg)
        res.render('bookingDetails', {
            namaPemilik: req.body.namaPemilik,
            merkMobil: req.body.merkMobil,
            tanggalService: req.body.tanggalService,
        })
    }
})

module.exports = app;