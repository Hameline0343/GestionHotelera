/* Enrutador para usuarios */

const express = require("express");
const auth = require(__dirname + '/../auth/auth');
const Usuario = require(__dirname + "/../models/usuario.js");

let router = express.Router();

router.post('/login', (req, res) => {
    let login = req.body.login;
    let password = req.body.password;
    Usuario.findOne({'login': login, 'password': password}).then(resultado => {
        if(resultado) {
            res.status(200).send({resultado: auth.generarToken(login)});
        } else
            throw new Error();
    }).catch(error => {
        res.status(401).send({error: "Login incorrecto"});
    });
});

module.exports = router;


