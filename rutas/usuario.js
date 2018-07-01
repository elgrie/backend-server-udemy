var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();

//importo el modelo con el cual vamos a trabajr para os usuarios desde models
var Usuario = require('../models/usuario');



//importamos la libreria del token
var jwt = require('jsonwebtoken')
    //importamos la semilla que se encunetra en config
    //var SEED = require('../config/config').SEED;


//importamos el middleware

var mdAutentication = require('../middleware/autentication');
//ruta principal

//=============================================
//Obtener Usuario
//=============================================
app.get('/', (req, res, next) => {

    //obtengo los datos que quiero en este caso nombre mail img y role
    //Lo obtenido se guarda en la variable usuarios

    Usuario.find({}, 'nombre email img role').exec(

        //en caso de error se ejecuta
        (err, usuarios) => {

            if (err) {
                return res.status(500).json({
                    ok: true,
                    mensaje: 'Error cargando Usuarios',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios
            })
        })
})



//=============================================
//Crear u nuevo usuario  //utilizamos la funcion token
//=============================================

//la funcion token se envia como parametro solos e va a ajecutar cuando sea llamada, cuando es por parametro no se llama
app.post('/', mdAutentication.verificaToken, (req, res) => {

    var body = req.body;

    //creamos un usuairo para obtener la data dle post
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    //guardamos el usuario en la base
    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Error al crear usuario',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        })

    })


});


//=============================================
//Actualizar Usuario
//=============================================

app.put('/:id', (req, res) => {

    var id = req.params.id;
    //con esta variable obtenemos los datos del usuario
    var body = req.body;

    //Llamo al modelo y busco los datos.
    //(err,usuario) ese "usuario" vendria a ser la respuesta
    Usuario.findById(id, (err, usuario) => {
        //si hay un usuario vacio no aplica pra el error 500 aplica para el 400
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
                mensaje: 'El usuario con el' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese id' }
            })
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                //Puede haber campos vacios entonces deber ir un error 400
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                })
            }
            //Como ocultar la password
            usuarioGuardado.password = ':)'
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,

            })
        });

    });

})


//=============================================
//Eliminar Usuario
//=============================================
app.delete('/:id', (req, res) => {

    //obtengo los datos que quiero en este caso nombre mail img y role
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al remover Usuarios',
                errors: err
            })
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: true,
                mensaje: 'No existe ese usuario',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        })

    })

})


//exportamos la ruta para luego importarlo dentro del otro app.js
module.exports = app;