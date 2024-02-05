const express = require("express");

const upload = require(__dirname + '/../utils/uploads.js');
const auth = require(__dirname + "/../utils/auth.js");
const Habitacion = require(__dirname + "/../models/habitacion.js");
const Limpieza = require(__dirname + "/../models/limpieza.js");

let router = express.Router();

/* Listado de todas las habitaciones */
router.get('/', async (req, res) => {
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
}
);

router.get('/nueva', auth.autenticacion, (req, res) => res.render('habitaciones_nueva'));

router.get('/editar/:id', auth.autenticacion, async (req, res) => {
  try {
    const datos = await Habitacion.findById(req.params.id);
    res.render('habitaciones_edicion', {datos});
  }
  catch(error) {
    res.render('error', {error: 'Error buscando habitacion: ' + error});
  }
});

/* Obtener detalles de una habitación concreta */
router.get('/:id', async (req, res) => {
  Habitacion.findById(req.params.id).then(resultado => {
    if(resultado)
      res.render('habitaciones_ficha', {habitacion: resultado});
    else
      res.render('error', {error: 'Habitación no encontrada.'});
  }).catch(error => 
    res.render('error', {error: 'Error buscando la habitación: ' + error})
  );
});

/* Insertar una habitación */
router.post('/', auth.autenticacion, upload.upload.single('imagen'), async (req, res) => {
  try {
    const nuevaHabitacion = new Habitacion({
      numero: req.body.numero,
      tipo: req.body.tipo,
      descripcion: req.body.descripcion,
      precio: req.body.precio
    });
    if (req.file)
    nuevaHabitacion.imagen = req.file.filename;
    
    await nuevaHabitacion.save();
    res.redirect(req.baseUrl);
  }
  catch(error) {
    let errores = {
      general: 'Error insertando la habitación'
    };

    if(error.errors.numero)
      errores.numero = error.errors.numero.message;
    
    if(error.errors.tipo)
      errores.tipo = error.errors.tipo.message;
    
    if(error.errors.descripcion)
      errores.descripcion = error.errors.descripcion.message;
    
    if(error.errors.precio)
      errores.precio = error.errors.precio.message;

    res.render('habitaciones_nueva', {errores, datos: req.body});
  }
});

router.post('/editar/:id', auth.autenticacion, upload.upload.single('imagen'), async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.id);
    const tipoEnum = ["individual", "doble", "familiar", "suite"];
    const habitacionActualizada = await Habitacion.findByIdAndUpdate(req.params.id, {$set: {
      numero: req.body.numero !== undefined && req.body.numero >= 1 && req.body.numero <= 100 ? req.body.numero : habitacion.numero, 
      descripcion: req.body.descripcion ?? habitacion.descripcion, 
      tipo: req.body.tipo !== undefined && tipoEnum.includes(req.body.tipo) ? req.body.tipo : habitacion.tipo, 
      precio: req.body.precio !== undefined && req.body.precio >= 0 && req.body.precio <= 250 ? req.body.precio : habitacion.precio,
      imagen: req.file?.filename ?? habitacion.imagen
    }}, {new: true});
    //Me he dado cuenta tarde del run validators ', runValidators: true'.
    //El aspecto positivo de hacerlo así es que incluso si se meten algunos datos erróneos los que no lo son se siguen enviando.
    res.render('habitaciones_ficha', {habitacion: habitacionActualizada});
  }
  catch(error){
    let errores = {
      general: 'Error editando la habitación'
    };

    res.render('habitaciones_edicion', {errores, datos: req.body});
  }
});

/* Eliminar una habitación */
router.post('/:id/borrar', auth.autenticacion,  async (req, res) => {
  try {
    const resultado = await Habitacion.findByIdAndDelete(req.params.id);
    if (!resultado) 
      res.render('error', { error: 'Error eliminando la habitación' });
    else {
      await Limpieza.deleteMany({ idHabitacion: req.params.id });
        
      const habitaciones = await Habitacion.find();
      if(habitaciones)
        res.render('habitaciones_listado', {habitaciones});
      else
        res.render('error', {error: 'Error obteniendo listado de habitaciones'});
    }
  } catch (error) {
    res.render('error', { error: 'Error eliminando la habitación: '});
  }
});
  
/* Añadir una incidencia a una habitación */
router.post('/:id/incidencias', auth.autenticacion, upload.upload.single('imagen'), async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.id)
    if(!habitacion)
      res.render('error', {error: 'Incidencia no encontrada.'});
    
    const incidencia = req.file ? 
      { descripcion: req.body.descripcion, fechaInicio: new Date(), imagen: req.file.filename } : 
      { descripcion: req.body.descripcion, fechaInicio: new Date() };
    habitacion.incidencias.push(incidencia);
    
    const habitacionActualizada = await habitacion.save();

    res.render('habitaciones_ficha', {habitacion: habitacionActualizada});
  } catch (error) {
    res.render('error', {error: 'Error añadiendo la incidencia: ' + error})
  }
});

/* Actualizar el estado de una incidencia de una habitación */
router.post('/:idH/incidencias/:idI', auth.autenticacion, async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.idH);
    if (!habitacion) 
      res.render('error', {error: 'Incidencia no encontrada.'});

    // Búsqueda de la incidencia dentro del array de incidencias de la habitación
    const incidencia = habitacion.incidencias.id(req.params.idI);

    if (!incidencia) 
      res.render('error', {error: 'Incidencia no encontrada.'});

    incidencia.fechaFin = new Date();
    const habitacionActualizada = await habitacion.save();
    res.render('habitaciones_ficha', { habitacion: habitacionActualizada });
  } catch (error) {
    res.render('error', {error: 'Error actualizando la incidencia: ' + error})
  }
});

module.exports = router;
