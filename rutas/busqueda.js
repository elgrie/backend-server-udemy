var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medicos = require('../models/medico');
var Usuarios = require('../models/usuario');


//===================================================
//Busqueda por coleccion
//===================================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var exprereg2 = new RegExp(tabla, 'i');
    var exprereg = new RegExp(busqueda, 'i');
    var promesa;

    //buscamos de la siguiente forma el nombre para que sea insensible osea busque de mauscula o minuscula
    //creamo una expresion regular

    //Forma 1
    //=================================================== 
    switch (tabla) {

        case 'hospitales':
            promesa = buscarHospitales(busqueda, exprereg);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, exprereg);
            break;
        case 'usuarios':
            promesa = buscarUsuario(busqueda, exprereg);
            break;
        default:
            return res.status(200).json({
                ok: false,
                mensaje: 'tabla no valida. Las tablas que puede usar son usuarios,medicos,hospitales',
                error: { message: 'tipo de tabla no valida' }

            });
    }
    promesa.then(data => {


        res.status(200).json({
            ok: true,
            tabla: data
        });

    });

    //Forma 2
    //===================================================
    /*
    var exprereg2 = new RegExp(tabla, 'i');
    var exprereg = new RegExp(busqueda, 'i');

    if (tabla == "medicos") {
        //Esto se usa para una busqueda
        buscarMedicos(busqueda, exprereg)
            .then(medicos => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos
                })
            })
    }
    if (tabla == "hospitales") {
        //Esto se usa para una busqueda
        buscarHospitales(busqueda, exprereg)
            .then(hospitales => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales
                })
            })

    }
    if (tabla == "usuarios") {
        //Esto se usa para una busqueda
        buscarUsuario(busqueda, exprereg)
            .then(usuarios => {
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                })
            })

    } else {
        return res.status(200).json({
            ok: false,
            mensaje: 'Error, tabla inexistente',

        })
    }

*/
})


//===================================================
//Busqueda general
//===================================================
//ruta principal
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    //buscamos de la siguiente forma el nombre para que sea insensible osea busque de mauscula o minuscula
    //creamo una expresion regular
    var exprereg = new RegExp(busqueda, 'i');

    //Para muchas busquedas utilizamos:
    Promise.all([buscarHospitales(busqueda, exprereg),
            buscarMedicos(busqueda, exprereg),
            buscarUsuario(busqueda, exprereg)

        ])
        .then(respuesta => {

            res.status(200).json({
                ok: true,
                hospitales: respuesta[0],
                medicos: respuesta[1],
                usuarios: respuesta[2]

            })

        })





    //Esto se usa para una busqueda
    //buscarHospitales(busqueda, exprereg)
    //    .then(hospitales => {
    //        res.status(200).json({
    //            ok: true,
    //            hospitales: hospitales
    //        })
    //    })
})

function buscarHospitales(busqueda, exprereg) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: exprereg })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('erro al cargar el usuario', err)
                } else {
                    resolve(hospitales)
                }
            })
    })

}

function buscarMedicos(busqueda, exprereg) {

    return new Promise((resolve, reject) => {
        Medicos.find({ nombre: exprereg })
            .populate('usuario', 'nombre email')
            .exec((err, medicos) => {

                if (err) {
                    reject('erro al cargar el usuario', err)
                } else {
                    resolve(medicos)
                }
            })
    })

}


function buscarUsuario(busqueda, exprereg) {

    return new Promise((resolve, reject) => {
        Usuarios.find({ nombre: exprereg }, 'nombre email role')
            .or([{ 'nombre': exprereg }, { 'email': exprereg }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('erro al cargar el usuario', err)
                } else {
                    resolve(usuarios)
                }
            })
    })

}
//exportamos la ruta para luego importarlo dentro del otro app.js
module.exports = app;