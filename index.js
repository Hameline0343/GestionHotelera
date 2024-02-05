const mongoose = require("mongoose");
const express = require("express");
const session = require('express-session');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');
const dotenv = require("dotenv");

const Habitacion = require(__dirname + "/models/habitacion.js");
const habitaciones = require(__dirname + "/routes/habitaciones");
const limpiezas = require(__dirname + "/routes/limpiezas");
const auth = require(__dirname + "/routes/auth");

dotenv.config();

mongoose.connect(process.env.URLBD);

let app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.set('view engine', 'njk');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: process.env.SECRETO,
    resave: true,
    saveUninitialized: false
}));
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    } 
}));
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use("/auth", auth);
app.use("/habitaciones", habitaciones);
app.use("/limpiezas", limpiezas);

app.get('/', async (req, res) => {
    try {
        const habitaciones = await Habitacion.find();
        if(habitaciones)
            res.render('habitaciones_listado', {habitaciones});
        else
            res.render('error', {error: 'Error obteniendo listado de habitaciones'});
    }
    catch(error) {
        res.render('error', {error: 'Error obteniendo listado de habitaciones'});
    }
});

app.listen(process.env.PUERTO);
