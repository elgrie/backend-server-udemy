var express = require('express');
//importamos el modulo de file upload
const fileUpload = require('express-fileupload');
//Esto es para poder manejar los archivos como por ejemplo eliminarlos
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());
//ruta principal
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'tipo de coleccion no valida  ',
            errors: { message: 'Tipo de coleccion no es valida' }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }

        });
    }

    //Obtener nombre del archivo imagen es el nombre que se le puso en el req de postman.
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado.pop();
    var extPermitidas = ['jpeg', 'png', 'gif', 'jpg'];

    if (extPermitidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son' + extPermitidas.join(', ') }
        });

    }
    //Nombre dle archivo
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //Mover el archivo temporal a un path
    var path = `./upload/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err

            })
        }
        //res.status(200).json({
        //   ok: true,
        //   mensaje: 'Archivo movido',
        //   extension: extension
        //})
        subirPorTipo(tipo, id, nombreArchivo, res);
    })



})

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            var pathViejo = './upload/usuarios/' + usuario.img;
            //si existe elimina la imagen anterior.
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizada',
                    usuario: usuarioActualizado
                })
            })
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            var pathViejo = './upload/medicos/' + medico.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizada',
                    medico: medicoActualizado
                })
            })

        })
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            var pathViejo = './upload/hospitales/' + hospital.img;
            //si existe elimina la imagen anterior.
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizada',
                    hospital: hospitalActualizado
                })
            })
        });
    }
}
//exportamos la ruta para luego importarlo dentro del otro app.js
module.exports = app;