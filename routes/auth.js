/* Enrutador para usuarios */

const express = require("express");
const Usuario = require(__dirname + "/../models/usuario.js");
const Habitacion = require(__dirname + "/../models/habitacion.js");

let router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    try {
        let login = req.body.login;
        let password = req.body.password;

        const usuario = await Usuario.findOne({'login': login, 'password': password});
        if (usuario)
        {
            req.session.usuario = usuario.login;
            res.redirect('/habitaciones/');
        } 
        else
            res.render('login', {error: "Usuario o contraseña incorrectos"});
    }
    catch(error) {
        res.render('login', {error: "Usuario o contraseña incorrectos"});
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.locals.session.usuario = undefined;
    res.render('login');
});

module.exports = router;