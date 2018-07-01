var express = require('express');
//lo utilizamos para desencriptar
var bcrypt = require('bcryptjs');

//importamos la libreria del token
var jwt = require('jsonwebtoken')

var app = express();

//importo el modelo con el cual vamos a trabajr para os usuarios desde models
var Usuario = require('../models/usuario');

//importamos la semilla que se encunetra en config
var SEED = require('../config/config').SEED;


app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al buscar usuario',
                errors: err
            })
        }
        if (!usuario) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            })
        }

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            })
        }
        //Crear un token
        //es se genera   en el backend
        usuario.password = ':)';
        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }) //4 horas


        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token,
            id: usuario.id
        })


    })



})

module.exports = app;