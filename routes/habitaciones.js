/* Librerías */
const express = require("express");
const auth = require(__dirname + '/../auth/auth.js');
const Habitacion = require(__dirname + "/../models/habitacion.js");
const Limpieza = require(__dirname + "/../models/limpieza.js");

let router = express.Router();

/* Listado de todas las habitaciones */
router.get('/', async (req, res) => {
  try {
    const resultado = await Habitacion.find();
    if (!resultado || resultado.length == 0) 
        res.status(500).send({ error: "No hay habitaciones registradas en la aplicación" });
    else 
        res.status(200).send({ resultado: resultado });    
  } catch (err) {
    res.status(500).send({ error: "No hay habitaciones registradas en la aplicación" });
  }
});

/* Obtener detalles de una habitación concreta */
router.get('/:id', async (req, res) => {
  try {
    const resultado = await Habitacion.findById(req.params.id);
    if (!resultado) {
        return res.status(400).send({ error: 'No existe el número de habitación' });
    }
    res.status(200).send({ resultado: resultado });
  } catch (error) {
    res.status(400).send({ error: 'No existe el número de habitación' });
  }
});

/* Insertar una habitación */
router.post('/', auth.protegerRuta, (req, res) => {
  const nuevaHabitacion = new Habitacion({
    numero: req.body.numero,
    tipo: req.body.tipo,
    descripcion: req.body.descripcion,
    precio: req.body.precio
  });

  nuevaHabitacion.save().then(resultado => {
    res.status(200).send({ resultado: resultado });
  }).catch(error => {      
    res.status(400).send({ error: 'Error insertando la habitación' });
  })  
});

/* Actualizar TODAS las últimas limpiezas */
router.put('/ultimaLimpieza', async (req, res) => {
  try {
    // Obtenemos todas las habitaciones
    const habitaciones = await Habitacion.find();

    // Iteramos sobre cada habitación y actualizamos la última limpieza
    habitaciones.forEach(async habitacion => {
      const ultimaLimpieza = await Limpieza.findOne({idHabitacion: habitacion._id}).sort({ fechaHora: -1 });

      if (ultimaLimpieza) {
        habitacion.ultimaLimpieza = ultimaLimpieza.fechaHora;
        await habitacion.save();
      }
    });
    
    res.status(200).send({ resultado: 'Se han actualizado las ultimas limpiezas realizadas'});

  } catch (error) {
    res.status(400).send({ error: 'Error actualizando limpiezas' });
  } 
});

/* Actualizar los datos de una habitación */
router.put('/:id', auth.protegerRuta, async (req, res) => {
  try {
    const resultado = await Habitacion.findByIdAndUpdate(req.params.id, {
        numero: req.body.numero,
        tipo: req.body.tipo,
        descripcion: req.body.descripcion,
        ultimaLimpieza: req.body.ultimaLimpieza,
        precio: req.body.precio,
    }, { new: true, runValidators: true });

    if (!resultado) {
        return res.status(400).send({ error: 'Error actualizando los datos de la habitación' });
    }
    res.status(200).send({ resultado: resultado });
  } catch (error) {
      res.status(400).send({ error: 'Error actualizando los datos de la habitación' });
  }
});

/* Eliminar una habitación */
router.delete('/:id', auth.protegerRuta, async (req, res) => {
  try {
    const resultado = await Habitacion.findByIdAndDelete(req.params.id);
    if (!resultado) {
        return res.status(400).send({ error: 'Error eliminando la habitación' });
    }
    res.status(200).send({ resultado: resultado });
  } catch (error) {    
    res.status(400).send({ error: 'Error eliminando la habitación: '});
  }
});
  
/* Añadir una incidencia a una habitación */
router.post('/:id/incidencias', auth.protegerRuta, async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.id);
    if (!habitacion) {
      return res.status(400).send({ error: 'Error añadiendo la incidencia'});
    }

    const incidencia = { descripcion: req.body.descripcion, fechaInicio: new Date() };
    habitacion.incidencias.push(incidencia);

    const habitacionActualizada = await habitacion.save();
    res.status(200).send({ resultado: habitacionActualizada });
  } catch (error) {
    res.status(400).send({ error: 'Error añadiendo la incidencia: '});
  }
});

/* Actualizar el estado de una incidencia de una habitación */
router.put('/:idH/incidencias/:idI', auth.protegerRuta, async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.idH);
    if (!habitacion) {
      return res.status(400).send({ error: 'Incidencia no encontrada' });
    }

    // Búsqueda de la incidencia dentro del array de incidencias de la habitación
    const incidencia = habitacion.incidencias.id(req.params.idI);

    if (!incidencia) {
      return res.status(400).send({ error: 'Incidencia no encontrada' });
    }

    incidencia.fechaFin = new Date();
    const habitacionActualizada = await habitacion.save();
    res.status(200).send({ resultado: habitacionActualizada });
  } catch (error) {
    res.status(400).send({ error: 'Error al actualizar la incidencia'});
  }
});

/* Actualizar última limpieza */
router.put('/:id/ultimalimpieza', auth.protegerRuta, async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.id);
    if (!habitacion) {      
      return res.status(400).send({ error: 'Error actualizando limpieza' });
    }

    const ultimaLimpieza = await Limpieza.findOne({idHabitacion: req.params.id}).sort({ fechaHora: -1 });
    if (!ultimaLimpieza) {      
      return res.status(400).send({ error: 'Error actualizando limpieza' });
    }

    habitacion.ultimaLimpieza = ultimaLimpieza.fechaHora;
    const habitacionActualizada = await habitacion.save();
    res.status(200).send({ resultado: habitacionActualizada });
  } catch (error) {       
    res.status(400).send({ error: 'Error actualizando limpieza' });
  }
});

module.exports = router;
