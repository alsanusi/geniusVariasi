// Database Connection
const dbConnection = require('./db-connection')

// Pdf Generator
const pdfPrinter = require('pdfmake')
const fs = require('fs')

// Global Variable
let globalId, pdfJson, globalTotalPrice;

// Admin Credentials
const admin = {
    id: '1',
    username: 'admin',
    pass: '123'
}

//Font Files
let fonts = {
    Roboto: {
        normal: 'fonts/Roboto-Regular.ttf',
        bold: 'fonts/Roboto-Medium.ttf',
        italics: 'fonts/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
}
const printer = new pdfPrinter(fonts)

//Session Checking
exports.redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/panel')
    } else {
        next()
    }
}

exports.redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/panel/dashboard')
    } else {
        next()
    }
}

const filterBookingDone = bStatus => {
    var doneStatus
    doneStatus = bStatus.filter(obj => {
        return obj.done_flag === "Y"
    })
    return doneStatus.length
}

const filterBookingNotDone = bStatus => {
    var notDoneStatus
    notDoneStatus = bStatus.filter(obj => {
        return obj.done_flag === "N"
    })
    return notDoneStatus.length
}

const filterIncome = price => {
    var income, totalIncome, statusDone
    statusDone = price.filter(obj => {
        return obj.done_flag === "Y"
    })
    income = statusDone.map(obj => {
        return obj.totalHarga
    })
    totalIncome = income.reduce((prev, curr) => {
        return (Number(prev) || 0) + (Number(curr) || 0)
    })

    return totalIncome
}

const showDoneBooking = bStatus => {
    var doneStatus
    doneStatus = bStatus.filter(obj => {
        return obj.done_flag === "Y"
    })
    return doneStatus
}

const showNotDoneBooking = bStatus => {
    var notDoneStatus
    notDoneStatus = bStatus.filter(obj => {
        return obj.done_flag === "N"
    })
    return notDoneStatus
}

const monthYearReport = (month, year) => {
    return new Promise(resolve => {
        dbConnection.con.query("SELECT * FROM bookingList WHERE month(tanggalService)= '" + month + "' AND year(tanggalService)= '" + year + "' AND done_flag = 'Y' ", (err, rows, fields) => {
            resolve(rows)
        })
    })
}

//GeneratePdf
async function generatePdf(tableLayout) {
    //Build the PDF
    var pdfDoc = printer.createPdfKitDocument(tableLayout)
    //Writing to disk
    pdfDoc.pipe(fs.createWriteStream('./report/monthlyReport.pdf'))
    pdfDoc.end()
}

exports.showIndex = (req, res) => {
    res.render('panelLogin', {
        lg: req.body
    })
}

exports.postLogin = (req, res) => {
    let username = req.body.username
    let password = req.body.password
    if (username === admin.username && password === admin.pass) {
        req.session.userId = admin.id
        return res.redirect('/panel/dashboard')
    } else {
        let error_msg = "Wrong Username and Password"
        req.flash('error', error_msg)
        res.render('panelLogin', {
            lg: req.query
        })
    }
}

exports.showDashboard = (req, res) => {
    dbConnection.con.query('SELECT * FROM bookingList ORDER BY ID DESC', (err, rows) => {
        if (rows) {
            // Table Pagination
            let totalOnGoingBooking = filterBookingNotDone(rows),
                pageSize = 8,
                pageCount = totalOnGoingBooking / 4,
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
        } else {
            res.render('indexPanel', {
                totalBooking: '',
                bookingList: '',
                pageSize: '',
                totalOnGoingBooking: '',
                pageCount: '',
                currentPage: ''
            })
        }
    })
}

exports.postReport = async (req, res) => {
    // Split Month and Year
    userInput = req.body.inputDate
    resultDate = userInput.split("-")
    year = resultDate[0]
    month = resultDate[1]

    let getMonthYearReport = await monthYearReport(month, year)

    if (getMonthYearReport.length === 0) {
        let error_msg = "Tidak ada track record booking di bulan ini."
        req.flash('error', error_msg)
        res.redirect('/panel/dashboard')
    } else {
        pdfJson = getMonthYearReport

        let bodyData = []
        let priceTotal = []

        pdfJson.forEach(function (bookingData) {
            let dataRow = []
            dataRow.push(bookingData.id)
            dataRow.push(bookingData.namaPemilik)
            dataRow.push(bookingData.alamat)
            dataRow.push(bookingData.tanggalService)
            dataRow.push(bookingData.waktuService)
            dataRow.push(bookingData.merkMobil)
            dataRow.push(bookingData.tipeMobil)
            dataRow.push([bookingData.jenisPerawatan, bookingData.jenisPerawatan1, bookingData.jenisPerawatan2])
            dataRow.push([bookingData.detailPerawatan, bookingData.detailPerawatan1, bookingData.detailPerawatan2])
            dataRow.push(bookingData.totalHarga.toLocaleString('id'))
            priceTotal.push(bookingData.totalHarga.toLocaleString('id'))
            bodyData.push(dataRow)
        })

        let totalIncome = priceTotal.reduce((a, b) => a + b, 0)

        let myTableLayout = {
            pageOrientation: 'landscape',
            content: [{
                    image: './report/logo.png',
                    width: 150,
                    lineHeight: 2
                },
                {
                    text: 'Monthly Report',
                    style: 'header'
                },
                {
                    text: 'Cargenius Monthly Report',
                    style: 'subHeader',
                    lineHeight: 2
                },
                {
                    text: '// Report For Month and Year : ' + month + '-' + year,
                    style: 'subHeaderX',
                    lineHeight: 2
                },
                {
                    text: '// Total Income : Rp. ' + totalIncome,
                    style: 'subHeaderX',
                    lineHeight: 4
                },
                {
                    text: 'Id / Nama Pemilik / Alamat / Tanggal Service / Waktu Service / Merk Mobil / Tipe Mobil / Jenis Perawatan / Detail Perawatan / Harga',
                    style: 'subHeaderTable',
                    lineHeight: 2
                },
                {
                    layout: 'headerLineOnly',
                    table: {
                        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        lineHeight: 1,
                        heights: 20,
                        body: bodyData
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 25,
                    bold: true
                },
                subHeader: {
                    fontSize: 20
                },
                subHeaderTable: {
                    bold: true,
                    fontSize: 11.5
                },
                subHeaderX: {
                    fontSize: 13
                }
            }
        }

        async function donwloadGeneratePdf() {
            await generatePdf(myTableLayout)
            setTimeout(function () {
                let file = fs.createReadStream('./report/monthlyReport.pdf')
                let stat = fs.statSync('./report/monthlyReport.pdf')
                res.setHeader('Content-Length', stat.size);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=monthlyReport.pdf');
                file.pipe(res)
            }, 2000);
        }

        donwloadGeneratePdf()

    }
}

exports.showPricingList = (req, res) => {
    res.render('updatePricePanel', {
        merkMobil: '',
        tipeMobil: '',
        jenisPerawatan: '',
        detailPerawatan: ''
    })
}

exports.postPricingList = (req, res) => {
    let clientCar = {
        merkMobil: req.body.merkMobil,
        tipeMobil: req.body.tipeMobil,
        jenisPerawatan: req.body.jenisPerawatan,
        detailPerawatan: req.body.detailPerawatan
    }

    dbConnection.con.query("SELECT harga, id FROM carTreatment WHERE merkMobil = '" + clientCar.merkMobil + "' AND tipeMobil= '" + clientCar.tipeMobil + "' AND jenisPerawatan= '" + clientCar.jenisPerawatan + "' AND detailPerawatan= '" + clientCar.detailPerawatan + "'", (err, rows) => {
        if (rows) {
            globalId = rows[0].id
            res.render('updatePriceDetailsPanel', {
                merkMobil: req.body.merkMobil,
                tipeMobil: req.body.tipeMobil,
                jenisPerawatan: req.body.jenisPerawatan,
                detailPerawatan: req.body.detailPerawatan,
                harga: rows[0].harga
            })
        } else {
            res.render('updatePriceDetailsPanel', {
                merkMobil: req.body.merkMobil,
                tipeMobil: req.body.tipeMobil,
                jenisPerawatan: req.body.jenisPerawatan,
                detailPerawatan: req.body.detailPerawatan,
                harga: ""
            })
        }
    })
}

exports.updatePricingList = (req, res) => {
    // Input Validation
    req.assert('merkMobil', 'Require Merk Mobil!').notEmpty()
    req.assert('tipeMobil', 'Require Tipe Mobil!').notEmpty()
    req.assert('jenisPerawatan', 'Require Jenis Perawatan!').notEmpty()
    req.assert('detailPerawatan', 'Require Detail Perawatan!').notEmpty()
    req.assert('harga', 'Require Harga!').notEmpty()

    let errors = req.validationErrors()
    if (!errors) {
        let bookingStatus = {
            merkMobil: req.body.merkMobil,
            tipeMobil: req.body.tipeMobil,
            jenisPerawatan: req.body.jenisPerawatan,
            detailPerawatan: req.body.detailPerawatan,
            harga: parseFloat(req.body.harga.replace(/\./g, "").replace(",", "."))
        }
        dbConnection.con.query('UPDATE carTreatment SET ? WHERE id = ' + globalId, bookingStatus, (err, rows) => {
            if (rows) {
                res.redirect('/panel/pricingList')
            } else {
                res.render('updatePricePanel', {
                    merkMobil: req.body.merkMobil,
                    tipeMobil: req.body.tipeMobil,
                    jenisPerawatan: req.body.jenisPerawatan,
                    detailPerawatan: req.body.detailPerawatan,
                    harga: req.body.harga
                })
            }
        })
    } else {
        let error_msg = ''
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
}

exports.showDetailBasedOnId = (req, res) => {
    dbConnection.con.query('SELECT * FROM bookingList WHERE id = ?', [req.params.id], function (err, rows, fields) {
        if (err) {
            throw err
        } else {
            //Set Global Variable
            globalTotalPrice = parseFloat(rows[0].totalHarga.replace(/\./g, "").replace(",", "."));

            res.render('bookingDetailsPanel', {
                id: rows[0].id,
                namaPemilik: rows[0].namaPemilik,
                alamat: rows[0].alamat,
                email: rows[0].email,
                nomorTelepon: rows[0].nomorTelepon,
                tanggalService: rows[0].tanggalService,
                waktuService: rows[0].waktuService,
                merkMobil: rows[0].merkMobil,
                tipeMobil: rows[0].tipeMobil,
                jenisPerawatan: rows[0].jenisPerawatan,
                detailPerawatan: rows[0].detailPerawatan,
                kuantiti: rows[0].kuantiti,
                harga: rows[0].harga ? parseFloat(rows[0].harga.replace(/\./g, "").replace(",", ".")) : rows[0].totalHarga,
                jenisPerawatan1: rows[0].jenisPerawatan1 ? rows[0].jenisPerawatan1 : "-",
                detailPerawatan1: rows[0].detailPerawatan1 ? rows[0].detailPerawatan1 : "-",
                kuantiti1: rows[0].kuantiti1 ? rows[0].kuantiti1 : "-",
                harga1: rows[0].harga1 ? parseFloat(rows[0].harga1.replace(/\./g, "").replace(",", ".")) : "-",
                jenisPerawatan2: rows[0].jenisPerawatan2 ? rows[0].jenisPerawatan2 : "-",
                detailPerawatan2: rows[0].detailPerawatan2 ? rows[0].detailPerawatan2 : "-",
                kuantiti2: rows[0].kuantiti2 ? rows[0].kuantiti2 : "-",
                harga2: rows[0].harga2 ? parseFloat(rows[0].harga1.replace(/\./g, "").replace(",", ".")) : "-",
                totalHarga: parseFloat(rows[0].totalHarga.replace(/\./g, "").replace(",", ".")),
                done_flag: rows[0].done_flag,
                desc_perawatan: rows[0].desc_perawatan
            })
        }
    })
}

exports.updateDetailBasedOnId = (req, res) => {
    // Input Validation
    req.assert('done_flag', 'Require Status Perawatan!').notEmpty()

    let errors = req.validationErrors()
    if (!errors) {
        let bookingStatus = {
            totalHarga: req.body.totalHarga ? parseFloat(req.body.totalHarga.replace(/\./g, "").replace(",", ".")) : globalTotalPrice,
            done_flag: 'Y'
        }
        dbConnection.con.query('UPDATE bookingList SET ? WHERE id = ' + req.params.id, bookingStatus, (err, rows) => {
            if (rows) {
                res.redirect('/panel/dashboard')
            } else {
                res.render('bookingDetailsPanel', {
                    id: req.params.id,
                    namaPemilik: req.body.namaPemilik,
                    alamat: req.body.alamat,
                    email: req.body.email,
                    nomorTelepon: req.body.nomorTelepon,
                    tanggalService: req.body.tanggalService,
                    waktuService: req.body.waktuService,
                    merkMobil: req.body.merkMobil,
                    tipeMobil: req.body.tipeMobil,
                    jenisPerawatan: req.body.jenisPerawatan,
                    detailPerawatan: req.body.detailPerawatan,
                    kuantiti: req.body.kuantiti,
                    harga: req.body.harga,
                    jenisPerawatan1: req.body.jenisPerawatan1,
                    detailPerawatan1: req.body.detailPerawatan1,
                    kuantiti1: req.body.kuantiti1,
                    harga1: req.body.harga1,
                    jenisPerawatan2: req.body.jenisPerawatan2,
                    detailPerawatan2: req.body.detailPerawatan2,
                    kuantiti2: req.body.kuantiti2,
                    harga2: req.body.harga2,
                    totalHarga: req.body.totalHarga,
                    done_flag: req.body.done_flag,
                })
            }
        })
    } else {
        let error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '</br>'
        })
        req.flash('error', error_msg)
        res.render('bookingDetailsPanel', {
            id: req.params.id,
            namaPemilik: req.body.namaPemilik,
            alamat: req.body.alamat,
            email: req.body.email,
            nomorTelepon: req.body.nomorTelepon,
            tanggalService: req.body.tanggalService,
            waktuService: req.body.waktuService,
            merkMobil: req.body.merkMobil,
            tipeMobil: req.body.tipeMobil,
            jenisPerawatan: req.body.jenisPerawatan,
            detailPerawatan: req.body.detailPerawatan,
            kuantiti: req.body.kuantiti,
            harga: req.body.harga,
            jenisPerawatan1: req.body.jenisPerawatan1,
            detailPerawatan1: req.body.detailPerawatan1,
            kuantiti1: req.body.kuantiti1,
            harga1: req.body.harga1,
            jenisPerawatan2: req.body.jenisPerawatan2,
            detailPerawatan2: req.body.detailPerawatan2,
            kuantiti2: req.body.kuantiti2,
            harga2: req.body.harga2,
            totalHarga: req.body.totalHarga,
            done_flag: req.body.done_flag,
        })
    }
}

exports.showBookingList = (req, res) => {
    dbConnection.con.query('SELECT * FROM bookingList ORDER BY ID DESC', (err, rows) => {
        if (rows) {
            // Table Pagination
            let totalDoneBooking = filterBookingDone(rows),
                pageSize = 8,
                pageCount = totalDoneBooking / 4,
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
                doneBooking: filterBookingDone(rows),
                totalIncome: filterIncome(rows),
                doneTable: doneBookingList,
                pageSize: pageSize,
                totalDoneBooking: totalDoneBooking,
                pageCount: pageCount,
                currentPage: currentPage
            })
        } else {
            res.render('tablePanel', {
                doneTable: doneBookingList,
                pageSize: '',
                totalDoneBooking: '',
                pageCount: '',
                currentPage: ''
            })
        }
    })
}

exports.removeDetailBasedOnId = (req, res) => {
    let clientId = {
        id: req.params.id
    }

    dbConnection.con.query('DELETE FROM bookingList WHERE id = ' + req.params.id, clientId, function (err, result) {
        if (err) {
            throw err
        } else {
            res.redirect('/panel/dashboard')
        }
    })
}

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/panel/dashboard')
        }
        res.clearCookie('sid')
        res.redirect('/panel')
    })
}