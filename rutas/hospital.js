//importamos las librerias de express, las mismas me permitiran manejar los middlewares
var express = require('express');
var app = express();
//importamos la libreria del token
var jwt = require('jsonwebtoken')
    //importamos la semilla que se encunetra en config
    //var SEED = require('../config/config').SEED;
var Hospital = require('../models/hospital');
//importamos el middleware
//=============================================
//Obtenemos un Hospital
//=============================================
var mdAutentication = require('../middleware/autentication');
//ruta principal
app.get('/', (req, res, next) => {

        //si viene algo desde la url lo toma en caos de que no venga ningun parametro le pone 0
        var desde = req.query.desde || 0;
        //le digo que ese desde si o si sea un numero
        desde = Number(desde);
        //obtengo los datos que quiero en este caso nombre mail img y role
        //Lo obtenido se guarda en la variable hospital

        Hospital.find({})
            .skip(desde)
            .limit(5)
            .populate('usuario', 'nombre email')
            .exec(

                //en caso de error se ejecuta
                (err, hospitales) => {

                    if (err) {
                        return res.status(500).json({
                            ok: true,
                            mensaje: 'Error cargando Hospitales',
                            errors: err
                        })
                    }
                    Hospital.count({}, (err, conteo) => {

                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: conteo
                        })

                    })

                })
    })
    //=============================================
    //Crear u nuevo Hospital  //utilizamos la funcion token
    //=============================================

//la funcion token se envia como parametro solos e va a ajecutar cuando sea llamada, cuando es por parametro no se llama
app.post('/', mdAutentication.verificaToken, (req, res) => {

    var body = req.body;

    //creamos un hospital para obtener la data dle post
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
    });

    //guardamos el hospital en la base
    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Error al crear usuario',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            //usuarioToken: req.usuario
        })

    })


});

//=============================================
//Actualizar Hospital
//=============================================

app.put('/:id', mdAutentication.verificaToken, (req, res) => {

    var id = req.params.id;
    //con esta variable obtenemos los datos del usuario
    var body = req.body;

    //Llamo al modelo y busco los datos.
    //(err,hospital) ese "hospital" vendria a ser la respuesta
    Hospital.findById(id, (err, hospital) => {
        //si hay un hospital vacio no aplica pra el error 500 aplica para el 400
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al buscar hospital',
                errors: err
            })
        }
        if (!hospital) {
            return res.status(400).json({
                ok: true,
                mensaje: 'El hospital con el' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese id' }
            })
        }

        hospital.nombre = body.nombre;


        hospital.save((err, hospitalGuardado) => {

            if (err) {
                //Puede haber campos vacios entonces deber ir un error 400
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                })
            }
            //Como ocultar la password

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                usuario: req.usuario._id

            })
        });

    });

})

//=============================================
//Eliminar Hospital
//=============================================
app.delete('/:id', mdAutentication.verificaToken, (req, res) => {

    //obtengo los datos que quiero en este caso nombre mail img y role
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al remover Hospital',
                errors: err
            })
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: true,
                mensaje: 'No existe ese hospital',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            usuario: req.usuario._id
        })

    })

})

//exportamos la ruta para luego importarlo dentro del otro app.js
module.exports = app;