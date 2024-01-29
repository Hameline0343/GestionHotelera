/* Librerías */
const express = require('express');
const auth = require(__dirname + '/../auth/auth.js');

const Limpieza = require(__dirname + "/../models/limpieza.js");

const router = express.Router();

/* Limpiezas de una habitación */
router.get('/:id', async (req, res) => {
  try {
    const limpiezas = await Limpieza.find({ idHabitacion: req.params.id }).sort({ fechaHora: -1 });
    if (limpiezas.length === 0) {
        return res.status(500).send({ error: 'No hay limpiezas registradas para esa habitación' });
    }
    res.status(200).send({ resultado: limpiezas });
  } catch (error) {            
    res.status(500).send({ error: 'No hay limpiezas registradas para esa habitación' });
  }    
}); 

/* Estado de limpieza actual de una habitación */
router.get('/:id/estadolimpieza', async (req, res) => {    
  try {
    const resultado = await Limpieza.find({ idHabitacion: req.params.id }).sort('-fechaHora');
    let estado = "limpia";

    if (resultado.length === 0) {
        estado = "pendiente de limpieza";
    } else {
        let fecha = resultado[0].fechaHora;
        let hoy = new Date();
        if (fecha.getFullYear() !== hoy.getFullYear() ||
            fecha.getMonth() !== hoy.getMonth() ||
            fecha.getDate() !== hoy.getDate()) 
            {
              estado = "pendiente de limpieza";
            }
    }
    res.status(200).send({ resultado: estado });
  } catch (err) {
    res.status(400).send({ error: "Error obteniendo estado de limpieza" });
  }
});

/* Actualizar limpieza */
router.post('/:id', auth.protegerRuta, async (req, res) => {
  try {
    let nuevaLimpieza = new Limpieza({ idHabitacion: req.params.id });

    if (req.body.observaciones) {
        nuevaLimpieza.observaciones = req.body.observaciones;
    }

    const resultado = await nuevaLimpieza.save();
    res.status(200).send({ resultado: resultado });
  } catch (error) {    
    res.status(400).send({ error: 'Error actualizando limpieza' });
  }
});

module.exports = router;

    