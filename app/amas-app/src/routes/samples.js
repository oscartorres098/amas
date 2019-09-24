const express = require("express");
const router = express.Router();
var request = require('request');

const Sample = require("../models/Sample");
// Helpers
const { isAuthenticated } = require("../helpers/auth");
const { isAdmin } = require("../helpers/auth");
 
//Get all samples
router.get("/samples", isAuthenticated, async (req, res) => {
  const samples = await Sample.find();
  const view = "caract";

  res.render("samples/all-samples", { samples, view });
});
//Create new sample
router.get("/samples/add", isAuthenticated, (req, res) => {
  res.render("samples/new-sample");
});
router.post("/samples/new-sample", isAuthenticated, async (req, res) => {
  const { check, espectro, MOx,	COx,	Arena, Arcilla,	Limo,	CLASE_TEXTURAL,	HUMEDAD_GRAVIMETRICA,	Dr,	pH,	Ca,	Mg,	K,	Na, details } = req.body;
  const errors = [];
  var espectros = espectro.split(";");
  var label = [];
  const newSample = new Sample({});
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
    await newSample.save();
    req.flash("success_msg", "Nueva muestra creada");
    res.redirect("/samples");
  }
});
//Create new samples form file
router.get("/samples/add-frfile", isAuthenticated, (req, res) => {
  res.render("samples/new-sample-frfile");
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
    try {
      await newSample.save();
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
router.get("/samples/edit/:id", isAuthenticated, async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  if (sample.user != req.user.id) {
    req.flash("error_msg", "No autrizado");
    return res.redirect("/samples");
  }
  res.render("samples/edit-sample", { sample });
});

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
router.delete('/samples/delete/:id', isAuthenticated, async (req, res) => {
  await Sample.findByIdAndDelete(req.params.id);
  req.flash('success_msg', 'Muestra eliminada correctamente');
  res.redirect('/samples');
});
// View Sample
router.get('/samples/view/:id', isAuthenticated, async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  res.render("samples/view-sample", { sample });
});
// Estimate sample
router.post('/sample/estimate/:id', isAuthenticated, async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  const {modelo} = req.body;
  const espectro = sample.espectro[0].split(",").map(Number);
  const formData = JSON.stringify({"espetro": espectro});
  const urls = 'http://localhost:5000/api/' + modelo;
  const id = req.params.id;

  request.post({
    url: urls,
    form: formData
  },
  function (err, httpResponse, body) {
    if(!err){
      try{
        var estimacion = JSON.parse(body);
      }catch(err){
        console.log(err);
      }
    }
    res.render("samples/view-caract", { estimacion, err, modelo, id });
  });
});
router.put('/sample/save-estimation/:id', isAuthenticated, async (req, res) => {
  var sample = await Sample.findById(req.params.id);
  var {estimacion, model} = req.body;
  estimacion = model + "," + estimacion;
  sample.prediction.push(estimacion);
  await Sample.findByIdAndUpdate(req.params.id, sample);
  res.redirect("samples/view-sample", { sample });
});
module.exports = router;