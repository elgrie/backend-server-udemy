var express = require('express');

var app = express();


//ruta principal
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada con exito'
    })
})

//exportamos la ruta para luego importarlo dentro del otro app.js
module.exports = app;