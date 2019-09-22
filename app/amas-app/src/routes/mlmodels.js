const express = require('express');
const router = express.Router();
var rp = require('request-promise');
const Sample = require('../models/Sample');
const MlModel = require('../models/MlModel');
// Helpers
const { isAuthenticated } = require('../helpers/auth');
const { isAdmin } = require('../helpers/auth');
//Get all models
router.get("/models", isAuthenticated, async (req, res) => {
  const samples = await MlModel.find();
  const view = "models";
  res.render("samples/all-samples", { samples, view });
});
//Create new sample
router.get("/models/train", isAuthenticated, (req, res) => {
  res.render("mlmodels/create-model");
});
router.post("/models/new-model", isAuthenticated, async (req, res) => {
  const { model, scaler, preprocessing } = req.body;
  const errors = [];
  const spectres = [];
  const etiquetas = [];
  const samples = await Sample.find();
  const mlModel = new MlModel({});
  console.log(samples[0]);
  for(i=0; i<samples.length; i++){
      console.log("espectro:"+samples[i].espectro[0]);
      console.log("etoqietas:"+samples[i].labels);
      spectres.push(samples[i].espectro);
      etiquetas.push(samples[i].labels.toString())
  }
  mlModel.model = model;
  mlModel.scaler = scaler;
  mlModel.preprocessing = preprocessing;
  mlModel.user = req.user.id;
  console.log(mlModel);
  console.log(spectres);
  console.log(etiquetas);
  var options = {
    method: 'POST',
    uri: 'http://localhost:5000/api/train/'+model+'/'+scaler+'/'+preprocessing,
    body: {
        espetro: spectres,
        labels: etiquetas
    },
    json: true, // Automatically stringifies the body to JSON
  };
  try{
  rp (options)
    .then(async function (parsedBody) {
      mlModel.name = parsedBody.file_name;
      mlModel.mse = parsedBody.mse;
      mlModel.rr = parsedBody.r2;
      mlModel.cross_val_score = parsedBody.cross_val_score;
      await mlModel.save();
      res.render("mlmodels/create-model");
    })
    .catch(function (err) {
      res.render("mlmodels/create-model", err);
  });
  }catch(error){
    res.render("mlmodels/create-model", error);
  }
  res.render("samples/all-samples");
});
module.exports = router;
