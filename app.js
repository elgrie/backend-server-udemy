//Librerias requeridas
var express = require('express');
var mongoose = require('mongoose');

//importar rutas
var appRoutes = require('./rutas/app');
var usuarioRoutes = require('./rutas/usuario');
var loginRoutes = require('./rutas/login');
var hospitalRoutes = require('./rutas/hospital');
var medicoRoutes = require('./rutas/medico');
var busquedaRoutes = require('./rutas/busqueda');
var uploadRoutes = require('./rutas/upload');
var imagenesRoutes = require('./rutas/imagenes');
//Inicializar variables

var app = express();
//
//

//Body parser
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
//estos son middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos:\x1b[32m%s\x1b[0m', ' online');

})

//importar rutas
//estos son midelware
app.use('/usuario', usuarioRoutes);
app.use('/img', imagenesRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/login', loginRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/', appRoutes);



app.listen(3000, () => {

    console.log('Express server puerto 3000:\x1b[32m%s\x1b[0m', ' online');

})