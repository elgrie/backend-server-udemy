var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');


//ruta principal
app.get('/:tipo/:img', (req, res, next) => {

    var img = req.params.img;
    var tipo = req.params.tipo;
    var pathImage = path.resolve(__dirname, `../upload/${tipo}/${img}`);

    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }
})

//exportamos la ruta para luego importarlo dentro del otro app.js
module.exports = app;