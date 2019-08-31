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
module.exports = router;
router.post("/samples/new-sample", isAuthenticated, async (req, res) => {
  const { check, espectro, MOx,	COx,	Arena, Arcilla,	Limo,	CLASE_TEXTURAL,	HUMEDAD_GRAVIMETRICA,	Dr,	pH,	Ca,	Mg,	K,	Na, detail } = req.body;
  const errors = [];
  var espectroa = [];
  var label = [];
  const newSample = new Sample({});
  if (!espectro) {
    errors.push({ text: "Por favor introdusca el espectro." });
  }else{
    espectroa = espectro.split(", ").map(Number);
    newSample.espectro = espectroa;
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
    newSample.user = req.user.id;
    await newSample.save();
    req.flash("success_msg", "Nueva muestra creada");
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
  var espectroa = [];
  var label = [];
  const { check, espectro, MOx,	COx,	Arena, Arcilla,	Limo,	CLASE_TEXTURAL,	HUMEDAD_GRAVIMETRICA,	Dr,	pH,	Ca,	Mg,	K,	Na, detail } = req.body;
  if (!espectro) {
    errors.push({ text: "Por favor introdusca el espectro." });
  }else{
    espectroa = espectro.split(",").map(Number);
    sample.espectro = espectroa;
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
router.get('/sample/estimate/:id/:model', isAuthenticated, async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  const espectro = sample.espectro;
  const formData = JSON.stringify({"espetro": espectro});
  const model = req.params.model;
  request.post({
    url: 'http://localhost:5000/api/regSc.pkl',
    form: formData
  },
  function (err, httpResponse, body) {
    res.render("samples/view-caract", { body, err, model });
  });
});