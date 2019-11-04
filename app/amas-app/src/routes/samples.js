/** Express router providing user related routes
 * @module routers/samples
 * @requires express
 */

/**
 * express module
 * @const
 */
const express = require("express");
/**
 * Express router to mount samples related functions on.
 * @type {object}
 * @const
 * @namespace samplesRouter
 */
const router = express.Router();
/**
 * Express proxy to comunicate with flask api.
 * @type {object}
 * @const
 * @namespace samplesProxy
 */
var request = require('request');
const fs=require('fs');
const Sample = require("../models/Sample");
const Registro = require("../models/Registro");
const LastInsert = require("../models/LastInsert");
const MlModel = require("../models/MlModel");
var rp = require('request-promise');
// Helpers
const { isAuthenticated } = require("../helpers/auth");
const { isAdmin } = require("../helpers/auth");
/**
 * Get all samples.
 * @name get/samples
 * @function
 * @memberof module:routers/samples~samplesRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get("/samples", isAuthenticated, async (req, res) => {
  const samples = await Sample.find();
  const view = "sample";
  res.render("samples/all-samples", { samples, view });
});
/**
 * get add sample screen.
 * @name /samples/add
 * @function
 * @memberof module:routers/samples~samplesRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get("/samples/add", isAuthenticated, (req, res) => {
  var view = "sample";
  res.render("samples/new-sample", {view});
});
/**
 * add a new sample.
 * @name /samples/new-sample
 * @function
 * @memberof module:routers/samples~samplesRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.post("/samples/new-sample", isAuthenticated, async (req, res) => {
  const { check, espectro, MOx,	COx,	Arena, Arcilla,	Limo,	CLASE_TEXTURAL,	HUMEDAD_GRAVIMETRICA,	Dr,	pH,	Ca,	Mg,	K,	Na, details } = req.body;
  const errors = [];
  var espectros = espectro.split(";");
  var label = [];
  const newSample = new Sample({});
  const newRegistro = new Registro({});
  if (!espectro) {
    errors.push({ text: "Por favor introdusca el espectro." });
  }else{
    for(i=0; i<=espectros.length-1;i++){    
      newSample.espectro.push(espectros[i]);
    }
  }
  if(check){
    if(!MOx || !COx || !Arena|| !Arcilla || !Limo|| !CLASE_TEXTURAL|| !HUMEDAD_GRAVIMETRICA|| !Dr|| !pH|| !Ca|| !Mg|| !K|| !Na ){
      errors.push({ text: "Por favor llene todas las etiquetas." });
    }else{
      label.push(parseFloat(MOx));
      label.push(parseFloat(COx));
      label.push(parseFloat(Arena));
      label.push(parseFloat(Arcilla));
      label.push(parseFloat(Limo));
      label.push(parseFloat(CLASE_TEXTURAL));
      label.push(parseFloat(HUMEDAD_GRAVIMETRICA));
      label.push(parseFloat(Dr));
      label.push(parseFloat(pH));
      label.push(parseFloat(Ca));
      label.push(parseFloat(Mg));
      label.push(parseFloat(K));
      label.push(parseFloat(Na));
      newSample.labels = label;
      
    }
  }
  if (errors.length > 0) {
    res.render("samples/new-sample", {
      errors,
      espectro,
      MOx,
      COx,
      Arena,
      Arcilla,
      Limo,
      CLASE_TEXTURAL,
      HUMEDAD_GRAVIMETRICA,
      pH,
      Ca,
      Mg,
      K,
      Na,
      detail
    });
  } else {
    newSample.detail = details;
    newSample.user = req.user.id;
    const iMid = await LastInsert.findById("5d926b4fc84df231a87609dc");
    newSample.mid = iMid.sample;
    iMid.sample = parseInt(newSample.mid)+1;
    await LastInsert.findByIdAndUpdate("5d926b4fc84df231a87609dc", iMid);
    await newSample.save();
    newRegistro.tipo = "Nueva muestra";
    newRegistro.mid = newSample.id;
    newRegistro.user = req.user.id;
    await newRegistro.save();
    req.flash("success_msg", "Nueva muestra creada");
    res.redirect("/samples");
  }
});
//Create new samples form file
/**
 * Create new samples form file
 * @name get/samples
 * @function
 * @memberof module:routers/samples~samplesRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get("/samples/add-frfile", isAuthenticated, (req, res) => {
  var view = "sample";
  res.render("samples/new-sample-frfile", {view});
});
router.post("/samples/new-sample-frfile", isAuthenticated, async (req, res) => {
  const errors = [];
  if (req.files.samples){
  var samples = req.files.samples;
  var data = samples.data.toString();
  var linea = data.split(/\n/);
  var i = 1;
  while (i<linea.length-1){ 
    const newSample = new Sample({});
    const newRegistro = new Registro({});
    var label = [];
    var espectro = [];
    var j = 1;
    var datos = linea[i].split(";");
    if(parseInt(datos[0])==1){
    label.push(parseFloat(datos[1]));
    label.push(parseFloat(datos[2]));
    label.push(parseFloat(datos[3]));
    label.push(parseFloat(datos[4]));
    label.push(parseFloat(datos[5]));
    label.push(parseFloat(datos[6]));
    label.push(parseFloat(datos[7]));
    label.push(parseFloat(datos[8]));
    label.push(parseFloat(datos[9]));
    label.push(parseFloat(datos[10]));
    label.push(parseFloat(datos[11]));
    label.push(parseFloat(datos[12]));
    label.push(parseFloat(datos[13]));
  }
    if (parseInt(datos[14])>1){
      while (j<=parseInt(datos[14])){
        espectro.push(datos.slice(15, 262).toString());
        if (j<parseInt(datos[14]))
        datos = linea[i+j].split(";");
        espectro.push(datos.slice(15, 262).toString());
        j++;
      }
    }else if (parseInt(datos[14])==1) {
      espectro.push(datos.slice(15, 262).toString());
    }
    i=i+j-1;
    i++;
    newSample.labels = label;
    newSample.espectro = espectro;
    newSample.user = req.user.id;
    const iMid = await LastInsert.findById("5d926b4fc84df231a87609dc");
    newSample.mid = iMid.sample;
    iMid.sample = parseInt(newSample.mid)+1;
    await LastInsert.findByIdAndUpdate("5d926b4fc84df231a87609dc", iMid);
    try {
      await newSample.save();
      newRegistro.tipo = "Nueva muestra";
      newRegistro.mid = newSample.id;
      newRegistro.user = req.user.name;
      await newRegistro.save();
    }
    catch(error) {

      errors.push({ text: error });
    }
  }
  }else{
    errors.push({ text: "Ningun archivo seleccionado" });
  }
  if (errors.length > 0) {
    res.render("samples/new-sample-frfile", {errors});
  }else{
    req.flash("success_msg", "Muestras creadas");
    res.redirect("/samples");
  }
});
// Edit Sample
/**
 * Load Edit Sample screen
 * @name get/samples
 * @function
 * @memberof module:routers/samples~samplesRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get("/samples/edit/:id", isAuthenticated, async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  if (sample.user != req.user.id) {
    req.flash("error_msg", "No autrizado");
    return res.redirect("/samples");
  }
  var view = "sample";
  res.render("samples/edit-sample", { sample, view });
});
/**
 * edit sample searching by id an getting changes from body
 * @name get/samples
 * @function
 * @memberof module:routers/samples~samplesRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.put("/samples/edit-sample/:id", isAuthenticated, async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  const errors = [];
  var label = [];
  const { check, espectro, MOx,	COx,	Arena, Arcilla,	Limo,	CLASE_TEXTURAL,	HUMEDAD_GRAVIMETRICA,	Dr,	pH,	Ca,	Mg,	K,	Na, details } = req.body;
  if (!espectro) {
    errors.push({ text: "Por favor introdusca el espectro." });
  }else{
    sample.espectro = espectro
  }
  if(check){
    if(!MOx || !COx || !Arena|| !Arcilla || !Limo|| !CLASE_TEXTURAL|| !HUMEDAD_GRAVIMETRICA|| !Dr|| !pH|| !Ca|| !Mg|| !K|| !Na ){
      errors.push({ text: "Por favor llene todas las etiquetas." });
    }else{
      label.push(parseFloat(MOx));
      label.push(parseFloat(COx));
      label.push(parseFloat(Arena));
      label.push(parseFloat(Arcilla));
      label.push(parseFloat(Limo));
      label.push(parseFloat(CLASE_TEXTURAL));
      label.push(parseFloat(HUMEDAD_GRAVIMETRICA));
      label.push(parseFloat(Dr));
      label.push(parseFloat(pH));
      label.push(parseFloat(Ca));
      label.push(parseFloat(Mg));
      label.push(parseFloat(K));
      label.push(parseFloat(Na));
      sample.labels = label;
    }
  }
  if (errors.length > 0) {
    res.render("samples/edi-sample", {
      errors,
      espectro,
      MOx,
      COx,
      Arena,
      Arcilla,
      Limo,
      CLASE_TEXTURAL,
      HUMEDAD_GRAVIMETRICA,
      pH,
      Ca,
      Mg,
      K,
      Na,
      detail
    });
  } else {
    sample.detail=details;
    await Sample.findByIdAndUpdate(req.params.id, sample);
    req.flash("success_msg", "Nota editada");
    res.redirect("/samples");
  }
});
// Delete Sample
/**
 * Delete Sample searching by id.
 * @name /samples/delete/:id
 * @function
 * @memberof module:routers/samples~samplesRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.delete('/samples/delete/:id', isAuthenticated, async (req, res) => {
  await Sample.findByIdAndDelete(req.params.id);
  req.flash('success_msg', 'Muestra eliminada correctamente');
  res.redirect('/samples');
});
// View Sample
/**
 * View Sample by sarching by id and loading screen
 * @name /samples/view/:id
 * @function
 * @memberof module:routers/samples~samplesRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get('/samples/view/:id', isAuthenticated, async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  const modelo = await MlModel.find();
  const view = "sample";
  res.render("samples/view-sample", { sample, modelo, view });
});
//delete estimantion
/**
 * delete estimantion searching by id and estimation index
 * @name /samples/delete-estimation/:id/:index
 * @function
 * @memberof module:routers/samples~samplesRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.post("/samples/delete-estimation/:id/:index", isAuthenticated, async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  console.log(sample);
    sample.prediction.splice(req.params.index, 1);
    await Sample.findByIdAndUpdate(req.params.id, sample);
    req.flash("success_msg", "Estimación eliminda");
    res.redirect("/samples/view/"+req.params.id);
});
// Estimate sample
/**
 * Estimate sample calling flask api and using route 'http://localhost:5000/api/model'
 * @name /sample/estimate/:id
 * @function
 * @memberof module:routers/samples~samplesProxy
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.post('/sample/estimate/:id', isAuthenticated, async (req, res) => {
  const sampleid=req.params.id;
  const modelid=req.body.modelo;
  const sample = await Sample.findById(req.params.id);
  const model = await MlModel.findById(req.body.modelo);
  const espectro = [];
  espectro.push(sample.espectro[0].split(",").map(Number));
  const modelname = model.nombre;
  const deriv = model.derivable;
  var modelstr =fs.readFileSync('../amas-app/src/public/models/'+modelname+'.txt');
  var scalerstr = fs.readFileSync('../amas-app/src/public/models/'+modelname+'-scaler.txt');
  const scaler_typestr = model.scaler;
  console.log(scaler_typestr);
  try {
    var options = {
      method: 'POST',
      uri: 'http://localhost:5000/api/model',
      body: {
        model: modelstr.toString(),
        scaler: scalerstr.toString(),
        scaler_type: scaler_typestr,
        espetro: espectro,
        transform_type: model.preprocessing,
        derivable: deriv
      },

      json: true,
    };
    try {
      rp(options)
        .then(async function (parsedBody) {
          try {
            estimacion = parsedBody[0];
            //console.log(estimacion)
            res.render("samples/view-caract", { estimacion, modelid, sampleid, modelname });
          } catch (err) {
            //console.log(err);
          }
        })
        .catch(function (err) {
          //console.log(err);
        });
    } catch (error) {
      //console.log(error);
    }
  } catch (err) {
    //console.log(err);
  }
});
/**
 * Lets save an estimation incoming from flask server.
 * @name /sample/save-estimation/:id
 * @function
 * @memberof module:routers/samples~samplesRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.put('/sample/save-estimation/:id', isAuthenticated, async (req, res) => {
  var sample = await Sample.findById(req.params.id);
  var {estimacion, modelo, modelid} = req.body;
  estimacion = modelo + "," + estimacion + "," + modelid;
  sample.prediction.push(estimacion);
  await Sample.findByIdAndUpdate(req.params.id, sample);
  res.redirect("../../samples/view/"+req.params.id);
});

module.exports = router;