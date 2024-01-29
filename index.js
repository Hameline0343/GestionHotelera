/* Librerías */
const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");

const habitaciones = require(__dirname + "/routes/habitaciones");
const limpiezas = require(__dirname + "/routes/limpiezas");
const auth = require(__dirname + "/routes/auth");

dotenv.config();

/* Conexión a la BD */
mongoose.connect(process.env.URLBD);

let app = express();
app.use(express.json());
app.use("/habitaciones", habitaciones);
app.use("/limpiezas", limpiezas);
app.use("/auth", auth);

app.listen(process.env.PUERTO);
