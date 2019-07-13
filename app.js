const express = require('express')
const app = express()

// Testing Root
app.get('/', (req, res) => {
    res.send('Hello');
})

//Localhost:3003
app.listen(3000, () => {
    console.log('Serve Running at Port 3000: http://127.0.0.1:3000')
})