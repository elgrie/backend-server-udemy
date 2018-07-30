//importamos las librerias de express, las mismas me permitiran manejar los middlewares
var express = require('express');
var app = express();
//importamos la libreria del token
var jwt = require('jsonwebtoken')
    //importamos la semilla que se encunetra en config
    //var SEED = require('../config/config').SEED;
var Medico = require('../models/medico');

//importamos la libreria del token
var jwt = require('jsonwebtoken')
    //importamos la semilla que se encunetra en config
    //var SEED = require('../config/config').SEED;


//importamos el middleware para hacer la autenticacion
var mdAutentication = require('../middleware/autentication');
//ruta principal


//=============================================
//Obtener Usuario
//=============================================
app.get('/', (req, res, next) => {

    //si viene algo desde la url lo toma en caos de que no venga ningun parametro le pone 0
    var desde = req.query.desde || 0;
    //le digo que ese desde si o si sea un numero
    desde = Number(desde);
    //obtengo los datos que quiero en este caso nombre mail img y role
    //Lo obtenido se guarda en la variable usuarios
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'email nombre')
        .populate('hospital')
        .exec(


            //en caso de error se ejecuta
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error cargando Usuarios',
                        errors: err
                    })
                }
                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    })
                })

            })
})

//exportamos la ruta para luego importarlo dentro del otro app.js
module.exports = app;




//=============================================
//Crear u nuevo Hospital  //utilizamos la funcion token
//=============================================

//la funcion token se envia como parametro solos e va a ajecutar cuando sea llamada, cuando es por parametro no se llama
app.post('/', mdAutentication.verificaToken, (req, res) => {

    var body = req.body;

    //creamos un hospital para obtener la data dle post
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    //guardamos el hospital en la base
    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Error al crear usuario',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
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
    Medico.findById(id, (err, medico) => {
        //si hay un hospital vacio no aplica pra el error 500 aplica para el 400
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al buscar hospital',
                errors: err
            })
        }
        if (!medico) {
            return res.status(400).json({
                ok: true,
                mensaje: 'El hospital con el' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese id' }
            })
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;


        medico.save((err, medicoGuardado) => {

            if (err) {
                //Puede haber campos vacios entonces deber ir un error 400
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                })
            }
            //Como ocultar la password

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
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
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al remover Hospital',
                errors: err
            })
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: true,
                mensaje: 'No existe ese hospital',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            usuario: req.usuario._id
        })

    })

})