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
//Create new model
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
  for (i = 0; i < samples.length; i++) {
    if (samples[i].labels.length != 0 && samples[i].espectro.length != 0) {
      spectres.push(samples[i].espectro[0].split(',').map(Number));
      etiquetas.push(samples[i].labels.toString().split(',').map(Number));
    }
  }
  mlModel.model = model;
  mlModel.scaler = scaler;
  mlModel.preprocessing = preprocessing;
  mlModel.user = req.user.id;
  console.log(spectres);
  console.log(etiquetas);
  try {
    var options = {
      method: 'POST',
      uri: 'http://localhost:5000/api/train/' + model + '/' + scaler + '/' + preprocessing,
      body: {
        espetro: spectres,
        labels: etiquetas
      },

      json: true, // Automatically stringifies the body to JSON
    };
    try {
      rp(options)
        .then(async function (parsedBody) {
          try {
            console.log(parsedBody)
            mlModel.name = parsedBody.file_name;
            mlModel.mse = parsedBody.mse;
            mlModel.rr = parsedBody.r2;
            mlModel.cross_val_score = parsedBody.cross_val_score;
            mlModel.modelstr = parsedBody.model;
            mlModel.scalerstr = parsedBody.scaler;
            await mlModel.save();
          } catch (err) {
            console.log(err);
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    } catch (error) {
      res.render("mlmodels/create-model", error);
    }
  } catch (err) {
    console.log(err);
  }
  res.redirect("../samples");
});
module.exports = router;