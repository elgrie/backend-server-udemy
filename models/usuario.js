    //Importamos mongooss

    var mongoose = require('mongoose');
    var uniqueValidator = require('mongoose-unique-validator');


    //funcion de schema
    var Schema = mongoose.Schema;


    //Creamos una serie de roles los cuales si no se ingresa en el post un tipo de 
    //valor de ese estilo no va
    //a poder ser creado el usuario, esto se logra cn la palabra enum que 
    //esta dentro del schema en la variable rl
    var rolesValidos = {
        values: ['ADMIN_ROLE', 'USER_ROLE'],
        message: '{VALUE} no es un rol Permitido'
    }

    var usuarioSchema = new Schema({

        nombre: { type: String, unique: true, required: [true, 'El nombre es necesario'] },
        email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
        password: { type: String, required: [true, 'La contrasena es necesaria'] },
        img: { type: String, required: false },
        role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
        google: { type: Boolean, default: false }
    });

    usuarioSchema.plugin(uniqueValidator, { message: 'Error en el campo : {PATH} debe ser unico' });
    module.exports = mongoose.model('Usuario', usuarioSchema);