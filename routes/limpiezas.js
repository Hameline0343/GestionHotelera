/* Librerías */
const express = require('express');
const auth = require(__dirname + "/../utils/auth.js");
const Limpieza = require(__dirname + "/../models/limpieza.js");
const Habitacion = require(__dirname + "/../models/habitacion.js");

const router = express.Router();

router.get('/nueva/:id', auth.autenticacion, async (req, res) => {
  const habitacion = await Habitacion.findById(req.params.id);
  res.render('limpiezas_nueva', { 
    numeroHabitacion: habitacion.numero,
    idHabitacion: req.params.id
  });
});

/* Limpiezas de una habitación */
router.get('/:id', async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.id);
    const limpiezas = await Limpieza.find({ idHabitacion: req.params.id });
    
    res.render('limpiezas_listado', { limpiezas, idHabitacion: req.params.id , numeroHabitacion: habitacion.numero });
  }
  catch (error) {
    res.render('error', { error: 'Error buscando las limpiezas: ' + error })
  }
});

/* Actualizar limpieza */
router.post('/:id', auth.autenticacion, async (req, res) => {
  try {
    const nuevaLimpieza = new Limpieza({
      idHabitacion: req.params.id,
      fechaHora: req.body.fechaHora,
      observaciones: req.body.observaciones
    });
    
    await nuevaLimpieza.save();
    
    const limpiezaMasReciente = await Limpieza.find({idHabitacion: req.params.id})
      .sort({fechaHora: -1})
      .limit(1);

    const habitacion = await Habitacion.findByIdAndUpdate(req.params.id, {ultimaLimpieza: limpiezaMasReciente[0].fechaHora});
    const limpiezas = await Limpieza.find({idHabitacion: req.params.id});

    res.render('limpiezas_listado', { limpiezas, idHabitacion: req.params.id , numeroHabitacion: habitacion.numero });
  }
  catch(error) {
    res.render('error', {error})
  }
});

module.exports = router;

