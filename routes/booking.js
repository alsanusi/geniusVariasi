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
    namaPemilik: "",
    email: "",
    alamat: "",
    nomorTelepon: "",
    tanggalService: "",
    waktuService: "",
    merkMobil: "",
    tipeMobil: "",
    jenisPerawatan: "",
    detailPerawatan: "",
    kuantiti: "",
    harga: "",
    jenisPerawatan1: "",
    detailPerawatan1: "",
    kuantiti1: "",
    harga1: "",
    jenisPerawatan2: "",
    detailPerawatan2: "",
    kuantiti2: "",
    harga2: "",
    totalHarga: "",
    multiLine: "",
    perawatan1: "",
    perawatan2: ""
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
        email: '',
        alamat: req.body.alamat,
        nomorTelepon: '',
        tanggalService: req.body.tanggalService,
        waktuService: '',
        merkMobil: '',
        tipeMobil: '',
        jenisPerawatan: '',
        detailPerawatan: '',
        kuantiti: 1,
        deskripsiKerusakan: '',
        jenisPerawatan1: '',
        detailPerawatan1: '',
        kuantiti1: 0,
        jenisPerawatan2: '',
        detailPerawatan2: '',
        kuantiti2: 0
    })
})

app.route('/editBooking')
    .get((req, res) => {
        res.render('bookingDetails', {
            namaPemilik: globalBooking.namaPemilik,
            email: globalBooking.email,
            alamat: globalBooking.alamat,
            nomorTelepon: globalBooking.nomorTelepon,
            tanggalService: globalBooking.tanggalService,
            waktuService: '',
            merkMobil: '',
            tipeMobil: '',
            jenisPerawatan: '',
            detailPerawatan: '',
            kuantiti: 1,
            jenisPerawatan1: '',
            detailPerawatan1: '',
            kuantiti1: 0,
            jenisPerawatan2: '',
            detailPerawatan2: '',
            kuantiti2: 0,
        })
    })
    .post((req, res) => {
        res.render('bookingDetails', {
            namaPemilik: globalBooking.namaPemilik,
            email: globalBooking.email,
            alamat: globalBooking.alamat,
            nomorTelepon: '',
            tanggalService: globalBooking.tanggalService,
            waktuService: '',
            merkMobil: '',
            tipeMobil: '',
            jenisPerawatan: '',
            detailPerawatan: '',
            kuantiti: 1,
            harga: '',
            jenisPerawatan1: '',
            detailPerawatan1: '',
            kuantiti1: 0,
            harga1: 0,
            jenisPerawatan2: '',
            detailPerawatan2: '',
            kuantiti2: 0,
            harga2: 0
        })
    })

const dateAndTimeChecking = (time, date) => {
    return new Promise(resolve => {
        conn.query("SELECT waktuService, tanggalService FROM bookingList WHERE tanggalService = '" + date + "' AND waktuService= '" + time + "'; ", (err, rows, fields) => {
            err ? console.log(err) : resolve(rows)
        })
    })
}

const priceChecking1 = (merkMobil, tipeMobil, jenisPerawatan, detailPerawatan) => {
    return new Promise(resolve => {
        conn.query("SELECT harga FROM carTreatment WHERE merkMobil = '" + merkMobil + "' AND tipeMobil= '" + tipeMobil + "' AND jenisPerawatan= '" + jenisPerawatan + "' AND detailPerawatan= '" + detailPerawatan + "'; ", (err, rows, fields) => {
            err ? console.log(err) : resolve(rows);
        })
    })
}

const priceChecking2 = (merkMobil, tipeMobil, jenisPerawatan, detailPerawatan) => {
    return new Promise(resolve => {
        conn.query("SELECT harga FROM carTreatment WHERE merkMobil = '" + merkMobil + "' AND tipeMobil= '" + tipeMobil + "' AND jenisPerawatan= '" + jenisPerawatan + "' AND detailPerawatan= '" + detailPerawatan + "'; ", (err, rows, fields) => {
            err ? console.log(err) : resolve(rows);
        })
    })
}

const priceChecking3 = (merkMobil, tipeMobil, jenisPerawatan, detailPerawatan) => {
    return new Promise(resolve => {
        conn.query("SELECT harga FROM carTreatment WHERE merkMobil = '" + merkMobil + "' AND tipeMobil= '" + tipeMobil + "' AND jenisPerawatan= '" + jenisPerawatan + "' AND detailPerawatan= '" + detailPerawatan + "'; ", (err, rows, fields) => {
            err ? console.log(err) : resolve(rows);
        })
    })
}

app.post('/priceChecking', async (req, res) => {
    // Set Global Variable
    bookingData = {
        namaPemilik: req.body.namaPemilik,
        email: req.body.email,
        alamat: req.body.alamat,
        tanggalService: req.body.tanggalService,
        waktuService: req.body.waktuService,
        nomorTelepon: req.body.nomorTelepon,
        merkMobil: req.body.merkMobil,
        tipeMobil: req.body.tipeMobil,
        jenisPerawatan: req.body.jenisPerawatan,
        detailPerawatan: req.body.detailPerawatan,
        kuantiti: req.body.kuantiti,
        jenisPerawatan1: req.body.jenisPerawatan1 ? req.body.jenisPerawatan1 : "-",
        detailPerawatan1: req.body.detailPerawatan1 ? req.body.detailPerawatan1 : "-",
        kuantiti1: req.body.kuantiti1,
        jenisPerawatan2: req.body.jenisPerawatan2 ? req.body.jenisPerawatan2 : "-",
        detailPerawatan2: req.body.detailPerawatan2 ? req.body.detailPerawatan2 : "-",
        kuantiti2: req.body.kuantiti2,
        totalHarga: '',
        deskripsiKerusakan: req.body.deskripsiKerusakan
    }

    var priceTotal;
    var rawTotal1, rawTotal2, rawTotal3;
    var priceTotal1, priceTotal2, priceTotal3;

    var clientCar = {
        waktuService: req.body.waktuService,
        merkMobil: [req.body.merkMobil],
        tipeMobil: [req.body.tipeMobil],
        jenisPerawatan: [req.body.jenisPerawatan],
        detailPerawatan: [req.body.detailPerawatan]
    }

    // Set GlobalVariable
    globalBooking.namaPemilik = bookingData.namaPemilik;
    globalBooking.nomorTelepon = bookingData.nomorTelepon;
    globalBooking.alamat = bookingData.alamat;
    globalBooking.tanggalService = bookingData.tanggalService;
    globalBooking.email = bookingData.email;
    globalBooking.waktuService = bookingData.waktuService;

    // Validation
    if (clientCar.merkMobil.length > 1 || clientCar.tipeMobil.length > 1 || clientCar.jenisPerawatan.length > 1 || clientCar.detailPerawatan.length > 1) {
        res.redirect('/editBooking')
    } else if (clientCar.waktuService === undefined) {
        var error_msg = "Silahkan mengisi waktu booking servis anda."
        req.flash('error', error_msg)
        res.redirect('/editBooking')
    } else if (typeof clientCar.merkMobil[0] === 'undefined' || typeof clientCar.tipeMobil[0] === 'undefined' || typeof clientCar.jenisPerawatan[0] === 'undefined') {
        var error_msg = "Silahkan mengisi data mobil anda."
        req.flash('error', error_msg)
        res.redirect('/editBooking')
    } else if (typeof clientCar.detailPerawatan[0] === 'undefined') {
        // Set Description
        globalBooking.multiLine = 'Y';
        globalBooking.merkMobil = bookingData.merkMobil;
        globalBooking.tipeMobil = bookingData.tipeMobil;
        globalBooking.jenisPerawatan = bookingData.jenisPerawatan;
        globalBooking.detailPerawatan = bookingData.deskripsiKerusakan;
        globalBooking.kuantiti = 0;
        globalBooking.totalHarga = 0;

        res.render('pricingDetails', {
            namaPemilik: req.body.namaPemilik,
            email: req.body.email,
            alamat: req.body.alamat,
            nomorTelepon: req.body.nomorTelepon,
            tanggalService: req.body.tanggalService,
            waktuService: req.body.waktuService,
            merkMobil: req.body.merkMobil,
            tipeMobil: req.body.tipeMobil,
            jenisPerawatan: req.body.jenisPerawatan,
            detailPerawatan: req.body.deskripsiKerusakan,
            multiLine: "Y",
            perawatan1: "N",
            perawatan2: "N",
            kuantiti: 0,
            totalHarga: 0
        })
    } else {
        // Date and Time Booking Checking
        const log = await dateAndTimeChecking(clientCar.waktuService, bookingData.tanggalService)

        if (log.length > 0) {
            var error_msg = "Tanggal dan waktu bookingan anda tidak tersedia. Silahkan untuk menginput kembali."
            req.flash('error', error_msg)
            res.redirect('/editBooking')
        } else if (bookingData.jenisPerawatan1 === "-" || bookingData.detailPerawatan1 === "-") {
            // Price Checking
            const log1 = await priceChecking1(bookingData.merkMobil, bookingData.tipeMobil, bookingData.jenisPerawatan, bookingData.detailPerawatan)

            // Total Price = (Quantity * Price)
            rawTotal1 = bookingData.kuantiti * log1[0].harga;

            priceTotal1 = rawTotal1 ? rawTotal1 : 0;

            // Exact Total Price
            priceTotal = priceTotal1;

            // Set Global MultiLine
            globalBooking.multiLine = 'N';
            globalBooking.merkMobil = bookingData.merkMobil;
            globalBooking.tipeMobil = bookingData.tipeMobil;
            globalBooking.jenisPerawatan = bookingData.jenisPerawatan;
            globalBooking.detailPerawatan = bookingData.detailPerawatan;
            globalBooking.kuantiti = bookingData.kuantiti;
            globalBooking.totalHarga = priceTotal;

            // Render Booking Details
            res.render('pricingDetails', {
                namaPemilik: req.body.namaPemilik,
                email: req.body.email,
                alamat: req.body.alamat,
                nomorTelepon: req.body.nomorTelepon,
                tanggalService: req.body.tanggalService,
                waktuService: req.body.waktuService,
                merkMobil: req.body.merkMobil,
                tipeMobil: req.body.tipeMobil,
                jenisPerawatan: req.body.jenisPerawatan,
                detailPerawatan: req.body.detailPerawatan,
                kuantiti: req.body.kuantiti,
                harga: priceTotal,
                multiLine: "N",
                perawatan1: "N",
                perawatan2: "N",
                totalHarga: priceTotal
            })
        } else if (bookingData.jenisPerawatan2 === "-" || bookingData.detailPerawatan2 === "-") {
            // Price Checking
            const log1 = await priceChecking1(bookingData.merkMobil, bookingData.tipeMobil, bookingData.jenisPerawatan, bookingData.detailPerawatan)
            const log2 = await priceChecking2(bookingData.merkMobil, bookingData.tipeMobil, bookingData.jenisPerawatan1, bookingData.detailPerawatan1)

            // Total Price = (Quantity * Price)
            rawTotal1 = bookingData.kuantiti * log1[0].harga;
            rawTotal2 = bookingData.kuantiti1 * log2[0].harga;

            priceTotal1 = rawTotal1 ? rawTotal1 : 0;
            priceTotal2 = rawTotal2 ? rawTotal2 : 0;

            // Exact Total Price
            priceTotal = priceTotal1 + priceTotal2;

            // Set Global MultiLine
            globalBooking.multiLine = "N";
            globalBooking.merkMobil = bookingData.merkMobil;
            globalBooking.tipeMobil = bookingData.tipeMobil;
            globalBooking.jenisPerawatan = bookingData.jenisPerawatan;
            globalBooking.detailPerawatan = bookingData.detailPerawatan;
            globalBooking.kuantiti = bookingData.kuantiti;
            globalBooking.harga = priceTotal1;
            globalBooking.jenisPerawatan1 = bookingData.jenisPerawatan1;
            globalBooking.detailPerawatan1 = bookingData.detailPerawatan1;
            globalBooking.kuantiti1 = bookingData.kuantiti1;
            globalBooking.harga1 = priceTotal2;
            globalBooking.totalHarga = priceTotal;
            globalBooking.perawatan1 = "Y";

            // Render Booking Details
            res.render('pricingDetails', {
                namaPemilik: req.body.namaPemilik,
                email: req.body.email,
                alamat: req.body.alamat,
                nomorTelepon: req.body.nomorTelepon,
                tanggalService: req.body.tanggalService,
                waktuService: req.body.waktuService,
                merkMobil: req.body.merkMobil,
                tipeMobil: req.body.tipeMobil,
                jenisPerawatan: req.body.jenisPerawatan,
                detailPerawatan: req.body.detailPerawatan,
                kuantiti: req.body.kuantiti,
                harga: priceTotal1,
                jenisPerawatan1: req.body.jenisPerawatan1,
                detailPerawatan1: req.body.detailPerawatan1,
                kuantiti1: req.body.kuantiti1,
                harga1: priceTotal2,
                multiLine: "N",
                perawatan1: "Y",
                perawatan2: "N",
                totalHarga: priceTotal
            })
        } else {
            // Price Checking
            const log1 = await priceChecking1(bookingData.merkMobil, bookingData.tipeMobil, bookingData.jenisPerawatan, bookingData.detailPerawatan)
            const log2 = await priceChecking2(bookingData.merkMobil, bookingData.tipeMobil, bookingData.jenisPerawatan1, bookingData.detailPerawatan1)
            const log3 = await priceChecking3(bookingData.merkMobil, bookingData.tipeMobil, bookingData.jenisPerawatan2, bookingData.detailPerawatan2)

            // Total Price = (Quantity * Price)
            rawTotal1 = bookingData.kuantiti * log1[0].harga;
            rawTotal2 = bookingData.kuantiti1 * log2[0].harga;
            rawTotal3 = bookingData.kuantiti2 * log3[0].harga;

            priceTotal1 = rawTotal1 ? rawTotal1 : 0;
            priceTotal2 = rawTotal2 ? rawTotal2 : 0;
            priceTotal3 = rawTotal3 ? rawTotal3 : 0;

            // Exact Total Price
            priceTotal = priceTotal1 + priceTotal2 + priceTotal3;

            // Set Global MultiLine
            globalBooking.multiLine = "N";
            globalBooking.merkMobil = bookingData.merkMobil;
            globalBooking.tipeMobil = bookingData.tipeMobil;
            globalBooking.jenisPerawatan = bookingData.jenisPerawatan;
            globalBooking.detailPerawatan = bookingData.detailPerawatan;
            globalBooking.kuantiti = bookingData.kuantiti;
            globalBooking.harga = priceTotal1;
            globalBooking.jenisPerawatan1 = bookingData.jenisPerawatan1;
            globalBooking.detailPerawatan1 = bookingData.detailPerawatan1;
            globalBooking.kuantiti1 = bookingData.kuantiti1;
            globalBooking.harga1 = priceTotal2;
            globalBooking.jenisPerawatan2 = bookingData.jenisPerawatan2;
            globalBooking.detailPerawatan2 = bookingData.detailPerawatan2;
            globalBooking.kuantiti2 = bookingData.kuantiti2;
            globalBooking.harga2 = priceTotal3;
            globalBooking.totalHarga = priceTotal;
            globalBooking.perawatan1 = "Y";
            globalBooking.perawatan2 = "Y";

            // Render Booking Details
            res.render('pricingDetails', {
                namaPemilik: req.body.namaPemilik,
                email: req.body.email,
                alamat: req.body.alamat,
                nomorTelepon: req.body.nomorTelepon,
                tanggalService: req.body.tanggalService,
                waktuService: req.body.waktuService,
                merkMobil: req.body.merkMobil,
                tipeMobil: req.body.tipeMobil,
                jenisPerawatan: req.body.jenisPerawatan,
                detailPerawatan: req.body.detailPerawatan,
                kuantiti: req.body.kuantiti,
                harga: priceTotal1,
                jenisPerawatan1: req.body.jenisPerawatan1,
                detailPerawatan1: req.body.detailPerawatan1,
                kuantiti1: req.body.kuantiti1,
                harga1: priceTotal2,
                jenisPerawatan2: req.body.jenisPerawatan2,
                detailPerawatan2: req.body.detailPerawatan2,
                kuantiti2: req.body.kuantiti2,
                harga2: priceTotal3,
                multiLine: "N",
                perawatan1: "Y",
                perawatan2: "Y",
                totalHarga: priceTotal
            })
        }
    }
})

const adminEmailNotifier = () => {
    return new Promise((resolve, reject) => {
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
            error ? reject(console.log(error)) : resolve(console.log('Message %s sent: %s', info.messageId, info.response));
        });
    })

}

const customerEmailNotifier = () => {
    return new Promise((resolve, reject) => {
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
            to: globalBooking.email,
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
                kuantiti: globalBooking.kuantiti,
                price: globalBooking.harga.toLocaleString('id'),
                careType1: globalBooking.jenisPerawatan1,
                careDetail1: globalBooking.detailPerawatan1,
                kuantiti1: globalBooking.kuantiti1,
                price1: globalBooking.harga1.toLocaleString('id'),
                careType2: globalBooking.jenisPerawatan2,
                careDetail2: globalBooking.detailPerawatan2,
                kuantiti2: globalBooking.kuantiti2,
                price2: globalBooking.harga2.toLocaleString('id'),
                totalPrice: globalBooking.totalHarga.toLocaleString('id'),
                perawatan1: globalBooking.perawatan1,
                perawatan2: globalBooking.perawatan2
            },
            template: 'customerTemplate'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            error ? reject(console.log(error)) : resolve(console.log('Message %s sent: %s', info.messageId, info.response));
        });
    })
}

const customerMultiServiceNotifier = () => {
    return new Promise((resolve, reject) => {
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
                defaultLayout: 'customerMultiServiceTemplate.handlebars',
            },
            viewPath: './views',
            extName: '.handlebars',
        };

        transporter.use('compile', hbs(handlebarOptions));

        let mailOptions = {
            from: 'malkautsars@gmail.com',
            to: globalBooking.email,
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
                totalPrice: "Kami akan segara menghubungi anda."
            },
            template: 'customerMultiServiceTemplate'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            error ? reject(console.log(error)) : resolve(console.log('Message %s sent: %s', info.messageId, info.response));
        });
    })
}

app.post('/booked', (req, res) => {
    //Input Form Validation
    req.assert('namaPemilik', 'Silahkan Input Nama Lengkap Anda!').notEmpty()
    req.assert('email', 'Silahkan Input Email Anda!').notEmpty()
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
            email: req.sanitize('email').escape().trim(),
            alamat: req.sanitize('alamat').escape().trim(),
            nomorTelepon: req.sanitize('nomorTelepon').escape().trim(),
            tanggalService: req.sanitize('tanggalService').escape().trim(),
            waktuService: req.sanitize('waktuService').escape().trim(),
            merkMobil: req.sanitize('merkMobil').escape().trim(),
            tipeMobil: req.sanitize('tipeMobil').escape().trim(),
            jenisPerawatan: req.sanitize('jenisPerawatan').escape().trim(),
            detailPerawatan: globalBooking.detailPerawatan,
            kuantiti: globalBooking.kuantiti,
            harga: req.body.harga ? parseFloat(req.sanitize('harga').escape().trim().replace(/\./g,"").replace(",",".")) : globalBooking.totalHarga,
            jenisPerawatan1: req.body.jenisPerawatan1 ? req.sanitize('jenisPerawatan1').escape().trim() : "-",
            detailPerawatan1: req.body.detailPerawatan1 ? req.sanitize('detailPerawatan1').escape().trim() : "-",
            kuantiti1: req.body.kuantiti1 ? req.sanitize('kuantiti1').escape().trim() : 0,
            harga1: req.body.harga1 ? parseFloat(req.sanitize('harga1').escape().trim().replace(/\./g,"").replace(",",".")) : 0,
            jenisPerawatan2: req.body.jenisPerawatan2 ? req.sanitize('jenisPerawatan2').escape().trim() : "-",
            detailPerawatan2: req.body.detailPerawatan2 ? req.sanitize('detailPerawatan2').escape().trim() : "-",
            kuantiti2: req.body.kuantiti2 ? req.sanitize('kuantiti2').escape().trim() : 0,
            harga2: req.body.harga2 ? parseFloat(req.sanitize('harga2').escape().trim().replace(/\./g,"").replace(",",".")) : 0,
            totalHarga: globalBooking.totalHarga,
            done_flag: 'N',
            desc_perawatan: globalBooking.multiLine
        }

        console.log(clientData)

        req.getConnection(function (err, con) {
            con.query('INSERT INTO bookingList SET ?', clientData, function (err, result) {
                if (err) {
                    req.flash('error', err)
                    res.redirect('/bookingDetails')
                } else {
                    switch (globalBooking.multiLine) {
                        case "Y":
                            Promise.all([
                                customerMultiServiceNotifier(),
                                adminEmailNotifier()
                            ]).then(() => {
                                setTimeout(_ => res.render('thankyou'), 3000)
                            });
                            break;
                        default:
                            Promise.all([
                                customerEmailNotifier(),
                                adminEmailNotifier()
                            ]).then(() => {
                                setTimeout(_ => res.render('thankyou'), 3000)
                            });
                    }
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