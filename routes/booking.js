//Load app server using Express
const express = require('express')
const app = express()

// Var
var globalNamaPemilik, globalAlamat, globalTanggalService;

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

app.post('/editBooking', (req, res) => {
    res.render('bookingDetails', {
        namaPemilik: globalNamaPemilik,
        alamat: globalAlamat,
        nomorTelepon: '',
        tanggalService: globalTanggalService,
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

    // Set Global Variable
    globalNamaPemilik = req.body.namaPemilik
    globalAlamat = req.body.alamat
    globalTanggalService = req.body.tanggalService

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
                    harga: rows[0].harga,
                })
            }
        })
    })
})

app.post('/booked', (req, res) => {
    //Input Form Validation
    req.assert('namaPemilik', 'Silahkan Input Nama Lengkap Anda!').notEmpty()
    req.assert('alamat', 'Silahkan Input Alamat Anda!').notEmpty()
    req.assert('nomorTelepon', 'Silahkan Input Nomor Telepon Anda!').notEmpty()
    req.assert('tanggalService', 'Silahkan Pilih Tanggal Service Anda!').notEmpty()
    req.assert('waktuService', 'Silahkan Pilih Waktu Service Anda!').notEmpty()
    req.assert('merkMobil', 'Silahkan Pilih Merk Mobil Anda!').notEmpty()
    req.assert('tipeMobil', 'Silahkan Pilih Tipe Mobil Anda!').notEmpty()
    req.assert('jenisPerawatan', 'Silahkan Pilih Jenis Perawatan Mobil Anda!').notEmpty()
    req.assert('detailPerawatan', 'Silahkan Pilih Detail Perawatan Mobil Anda!').notEmpty()

    var errors = req.validationErrors()
    console.log(errors)

    if (!errors) {
        var clientData = {
            namaPemilik: req.sanitize('namaPemilik').escape().trim(),
            alamat: req.sanitize('alamat').escape().trim(),
            nomorTelepon: req.sanitize('nomorTelepon').escape().trim(),
            tanggalService: req.sanitize('tanggalService').escape().trim(),
            waktuService: req.sanitize('waktuService').escape().trim(),
            merkMobil: req.sanitize('merkMobil').escape().trim(),
            tipeMobil: req.sanitize('tipeMobil').escape().trim(),
            jenisPerawatan: req.sanitize('jenisPerawatan').escape().trim(),
            detailPerawatan: req.sanitize('detailPerawatan').escape().trim(),
            harga: req.sanitize('harga').escape().trim(),
            done_flag: 'N'
        }
        req.getConnection(function (err, con) {
            con.query('INSERT INTO bookingList SET ?', clientData, function (err, result) {
                if (err) {
                    req.flash('error', err)
                    res.redirect('/bookingDetails')
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
        res.redirect('/bookingDetails')
    }
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