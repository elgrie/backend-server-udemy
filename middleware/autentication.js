//importamos la libreria del token
var jwt = require('jsonwebtoken')
    //importamos la semilla que se encunetra en config
var SEED = require('../config/config').SEED;
//=============================================
//Obtener Token
//=============================================
//exportamos la funcion en princiopio a usuario.js
exports.verificaToken = function(req, res, next) {
    //para lleer el token creamos la siguiente variable
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: true,
                mensaje: 'Token incorrecto',
                errors: err
            })
        }
        req.usuario = decoded.usuario;

        /* res.status(201).json({
                 ok: true,
                 // usuario: usuarioGuardado,
                 usuarioToken: decoded.usuario,
             })*/
        next();
    })
}