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

//Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//==================================================
//Autenticacion de Google.
//==================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mesaje: 'Token no valido!!'
            })

        })
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(403).json({
                ok: false,
                mesaje: 'Token no valido!!'
            })
        }
        if (usuarioDB) {
            //si este usuario no fue autenticado por google
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mesaje: 'debe usuar su autenticacion normal'
                })
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) //4 horas


                res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token: token,
                    id: usuarioDB.id
                })
            }
        } else {
            //el usuario no existe hay que crearlo
            var usuario = new Usuario;
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';
            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) //4 horas
                res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token: token,
                    id: usuarioDB.id
                })

            })
        }

    })
})


//==================================================
//Autenticacion normal
//==================================================
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