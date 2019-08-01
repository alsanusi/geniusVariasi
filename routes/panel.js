const express = require('express')
const app = express()
const mysql = require('promise-mysql')
const config = require('../config')

// Global Variable
var globalId

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

function filterBookingDone(bStatus) {
    var doneStatus
    doneStatus = bStatus.filter(obj => {
        return obj.done_flag === "Y"
    })
    return doneStatus.length
}

function filterBookingNotDone(bStatus) {
    var notDoneStatus
    notDoneStatus = bStatus.filter(obj => {
        return obj.done_flag === "N"
    })
    return notDoneStatus.length
}

function filterIncome(price) {
    var income, totalIncome
    income = price.map(obj => {
        return obj.harga
    })
    totalIncome = income.reduce((a, b) => a + b, 0)
    return totalIncome
}

function showDoneBooking(bStatus) {
    var doneStatus
    doneStatus = bStatus.filter(obj => {
        return obj.done_flag === "Y"
    })
    return doneStatus
}

function showNotDoneBooking(bStatus) {
    var notDoneStatus
    notDoneStatus = bStatus.filter(obj => {
        return obj.done_flag === "N"
    })
    return notDoneStatus
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
                // Table Pagination
                var totalOnGoingBooking = filterBookingNotDone(rows),
                    pageSize = 8,
                    pageCount = totalOnGoingBooking / 8,
                    currentPage = 1,
                    onGoingBookingArray = [],
                    onGoingBookingList = [],
                    onGoingBooking = JSON.parse(JSON.stringify(showNotDoneBooking(rows)))

                // Split to groups
                while (onGoingBooking.length > 0) {
                    onGoingBookingArray.push(onGoingBooking.splice(0, pageSize))
                }

                // Set current page
                if (typeof req.query.page != 'undefined') {
                    currentPage = +req.query.page
                }

                // Show list of not done booking
                onGoingBookingList = onGoingBookingArray[+currentPage - 1];

                res.render('indexPanel', {
                    totalBooking: rows.length,
                    doneBooking: filterBookingDone(rows),
                    notDoneBooking: filterBookingNotDone(rows),
                    totalIncome: filterIncome(rows),
                    bookingList: onGoingBookingList,
                    pageSize: pageSize,
                    totalOnGoingBooking: totalOnGoingBooking,
                    pageCount: pageCount,
                    currentPage: currentPage
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

app.post('/report', (req, res) => {
    // Split Month and Year
    userInput = req.body.inputDate
    resultDate = userInput.split("-")
    year = resultDate[0]
    month = resultDate[1]
    
    mysql.createConnection(config.database).then(function (con) {
        con.query("SELECT * FROM bookingList WHERE month(tanggalService)= '" + month + "' AND year(tanggalService)= '" + year + "';").then(rows => {
                console.log(rows)
            })
            .catch(err => {
                console.log(err);
            })
    })

    // Continue to generate report
})

app.route('/pricingList')
    .get((req, res, next) => {
        res.render('updatePricePanel', {
            merkMobil: '',
            tipeMobil: '',
            jenisPerawatan: '',
            detailPerawatan: ''
        })
    })
    .post((req, res, next) => {
        var clientCar = {
            merkMobil: req.body.merkMobil,
            tipeMobil: req.body.tipeMobil,
            jenisPerawatan: req.body.jenisPerawatan,
            detailPerawatan: req.body.detailPerawatan
        }

        mysql.createConnection(config.database).then(function (con) {
                con.query("SELECT harga, id FROM carTreatment WHERE merkMobil = '" + clientCar.merkMobil + "' AND tipeMobil= '" + clientCar.tipeMobil + "' AND jenisPerawatan= '" + clientCar.jenisPerawatan + "' AND detailPerawatan= '" + clientCar.detailPerawatan + "'").then(rows => {
                    globalId = rows[0].id
                    res.render('updatePriceDetailsPanel', {
                        merkMobil: req.body.merkMobil,
                        tipeMobil: req.body.tipeMobil,
                        jenisPerawatan: req.body.jenisPerawatan,
                        detailPerawatan: req.body.detailPerawatan,
                        harga: rows[0].harga
                    })
                })
            })
            .catch(err => {
                res.render('updatePriceDetailsPanel', {
                    merkMobil: req.body.merkMobil,
                    tipeMobil: req.body.tipeMobil,
                    jenisPerawatan: req.body.jenisPerawatan,
                    detailPerawatan: req.body.detailPerawatan,
                    harga: ""
                })
            })
    })

app.put('/pricingListDetails', (req, res) => {
    req.assert('merkMobil', 'Require Merk Mobil!').notEmpty()
    req.assert('tipeMobil', 'Require Tipe Mobil!').notEmpty()
    req.assert('jenisPerawatan', 'Require Jenis Perawatan!').notEmpty()
    req.assert('detailPerawatan', 'Require Detail Perawatan!').notEmpty()
    req.assert('harga', 'Require Harga!').notEmpty()

    var errors = req.validationErrors()
    if (!errors) {
        var bookingStatus = {
            merkMobil: req.body.merkMobil,
            tipeMobil: req.body.tipeMobil,
            jenisPerawatan: req.body.jenisPerawatan,
            detailPerawatan: req.body.detailPerawatan,
            harga: req.body.harga
        }
        mysql.createConnection(config.database).then(function (con) {
                con.query('UPDATE carTreatment SET ? WHERE id = ' + globalId, bookingStatus).then(rows => {
                    res.redirect('/panel/pricingList')
                })
            })
            .catch(err => {
                res.render('updatePricePanel', {
                    merkMobil: req.body.merkMobil,
                    tipeMobil: req.body.tipeMobil,
                    jenisPerawatan: req.body.jenisPerawatan,
                    detailPerawatan: req.body.detailPerawatan,
                    harga: req.body.harga
                })
            })
    } else {
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '</br>'
        })
        req.flash('error', error_msg)
        res.render('updatePricePanel', {
            merkMobil: req.body.merkMobil,
            tipeMobil: req.body.tipeMobil,
            jenisPerawatan: req.body.jenisPerawatan,
            detailPerawatan: req.body.detailPerawatan,
            harga: req.body.harga,
        })
    }

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
                // Table Pagination
                var totalDoneBooking = filterBookingDone(rows),
                    pageSize = 8,
                    pageCount = totalDoneBooking / 8,
                    currentPage = 1,
                    doneBookingsArray = [],
                    doneBookingList = [],
                    doneBooking = JSON.parse(JSON.stringify(showDoneBooking(rows)))

                // Split to groups
                while (doneBooking.length > 0) {
                    doneBookingsArray.push(doneBooking.splice(0, pageSize))
                }

                // Set current page
                if (typeof req.query.page != 'undefined') {
                    currentPage = +req.query.page
                }

                // Show list of not done booking
                doneBookingList = doneBookingsArray[+currentPage - 1];

                res.render('tablePanel', {
                    doneTable: doneBookingList,
                    pageSize: pageSize,
                    totalDoneBooking: totalDoneBooking,
                    pageCount: pageCount,
                    currentPage: currentPage
                })
            })
            .catch(err => {
                res.render('tablePanel', {
                    doneTable: doneBookingList,
                    pageSize: '',
                    totalDoneBooking: '',
                    pageCount: '',
                    currentPage: ''
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