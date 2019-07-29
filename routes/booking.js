//Load app server using Express
const express = require('express')
const app = express()
const mysql = require('mysql')
const dbConfig = require('../config')

// Global Variable
var globalNamaPemilik, globalAlamat, globalTanggalService;

// Db
var conn = mysql.createConnection({
    host: dbConfig.database.host,
    user: dbConfig.database.user,
    password: dbConfig.database.password,
    port: dbConfig.database.port,
    database: dbConfig.database.database
})

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

app.route('/editBooking')
    .get((req, res) => {
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
    .post((req, res) => {
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

function dateAndTimeChecking(time, date) {
    return new Promise(resolve => {
        conn.query("SELECT waktuService, tanggalService FROM bookingList WHERE tanggalService = '" + date + "' AND waktuService= '" + time + "'; ", function (err, rows, fields) {
            err ? console.log(err) : resolve(rows)
        })
    })
}

app.post('/priceChecking', async (req, res) => {
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

    getTime = req.body.waktuService

    let log = await dateAndTimeChecking(getTime, globalTanggalService)

    if (log.length > 0) {
        var error_msg = "Tanggal dan waktu bookingan anda tidak tersedia. Silahkan untuk menginput kembali."
        req.flash('error', error_msg)
        res.redirect('/editBooking')
    } else {
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
    }
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
                    res.redirect('/thankyou')
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

module.exports = app;