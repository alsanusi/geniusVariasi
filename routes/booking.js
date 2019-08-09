//Load app server using Express
const express = require('express')
const app = express()
const mysql = require('mysql')
const dbConfig = require('../config')
const nodeMailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')

// SingleUse Database Connection
var conn = mysql.createConnection({
    host: dbConfig.database.host,
    user: dbConfig.database.user,
    password: dbConfig.database.password,
    port: dbConfig.database.port,
    database: dbConfig.database.database
})

// Global Variable
var globalBooking = {
    namaPemilik: '',
    alamat: '',
    nomorTelepon: '',
    tanggalService: '',
    waktuService: '',
    merkMobil: '',
    tipeMobil: '',
    jenisPerawatan: '',
    detailPerawatan: '',
    totalHarga: ''
}

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
    // customerEmailNotifier()
    // setTimeout(function() {
    //     adminEmailNotifier()
    // }, 5000)
})

app.route('/editBooking')
    .get((req, res) => {
        res.render('bookingDetails', {
            namaPemilik: globalBooking.namaPemilik,
            alamat: globalBooking.alamat,
            nomorTelepon: '',
            tanggalService: globalBooking.tanggalService,
            waktuService: '',
            merkMobil: '',
            tipeMobil: '',
            jenisPerawatan: '',
            detailPerawatan: ''
        })
    })
    .post((req, res) => {
        res.render('bookingDetails', {
            namaPemilik: globalBooking.namaPemilik,
            alamat: globalBooking.alamat,
            nomorTelepon: '',
            tanggalService: globalBooking.tanggalService,
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
    // Set Global Variable
    globalBooking = {
        namaPemilik: req.body.namaPemilik,
        alamat: req.body.alamat,
        tanggalService: req.body.tanggalService,
        waktuService: req.body.waktuService,
        nomorTelepon: req.body.nomorTelepon,
        merkMobil: req.body.merkMobil,
        tipeMobil: req.body.tipeMobil,
        jenisPerawatan: req.body.jenisPerawatan,
        detailPerawatan: req.body.detailPerawatan,
        totalHarga: ''
    }

    var clientCar = {
        waktuService: req.body.waktuService,
        merkMobil: req.body.merkMobil,
        tipeMobil: req.body.tipeMobil,
        jenisPerawatan: req.body.jenisPerawatan,
        detailPerawatan: req.body.detailPerawatan
    }

    if (clientCar.waktuService === undefined) {
        var error_msg = "Silahkan mengisi waktu booking servis anda."
        req.flash('error', error_msg)
        res.redirect('/editBooking')
    } else if (clientCar.merkMobil === undefined || clientCar.tipeMobil === undefined || clientCar.jenisPerawatan === undefined || clientCar.detailPerawatan === undefined) {
        var error_msg = "Silahkan mengisi data mobil anda."
        req.flash('error', error_msg)
        res.redirect('/editBooking')
    } else {
        let log = await dateAndTimeChecking(clientCar.waktuService, globalBooking.tanggalService)

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
                        globalBooking.totalHarga = rows[0].harga
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
    }
})

function adminEmailNotifier() {
    let transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'malkautsars@gmail.com',
            pass: 'Sesar181196'
        }
    });

    const handlebarOptions = {
        viewEngine: {
            extName: '.handlebars',
            partialsDir: './views',
            layoutsDir: './views',
            defaultLayout: 'adminTemplate.handlebars',
        },
        viewPath: './views',
        extName: '.handlebars',
    };

    transporter.use('compile', hbs(handlebarOptions));

    let mailOptions = {
        from: 'malkautsars@gmail.com',
        to: 'malkautsars@gmail.com',
        subject: "New Incoming Booking!",
        context: {
            name: globalBooking.namaPemilik,
            address: globalBooking.alamat,
            date: globalBooking.tanggalService,
            time: globalBooking.waktuService,

        },
        template: 'adminTemplate'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

function customerEmailNotifier() {
    let transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'malkautsars@gmail.com',
            pass: 'Sesar181196'
        }
    });

    const handlebarOptions = {
        viewEngine: {
            extName: '.handlebars',
            partialsDir: './views',
            layoutsDir: './views',
            defaultLayout: 'customerTemplate.handlebars',
        },
        viewPath: './views',
        extName: '.handlebars',
    };

    transporter.use('compile', hbs(handlebarOptions));

    let mailOptions = {
        from: 'malkautsars@gmail.com',
        to: 'malkautsars@gmail.com',
        subject: "Booking Service Detail",
        context: {
            name: globalBooking.namaPemilik,
            address: globalBooking.alamat,
            date: globalBooking.tanggalService,
            time: globalBooking.waktuService,
            phoneNumber: globalBooking.nomorTelepon,
            carBrand: globalBooking.merkMobil,
            carType: globalBooking.tipeMobil,
            careType: globalBooking.jenisPerawatan,
            careDetail: globalBooking.detailPerawatan,
            totalPrice:  globalBooking.totalHarga

        },
        template: 'customerTemplate'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

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
                    customerEmailNotifier()
                    adminEmailNotifier()
                    setTimeout(_ => res.render('thankyou'), 5000)
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