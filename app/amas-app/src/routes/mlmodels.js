/** Express router providing general app related routes
 * @module routers/mlmodels
 * @requires express
 */

/**
 * express module
 * @const
 */
const express = require('express');
/**
 * Express router to mount samples related functions on.
 * @type {object}
 * @const
 * @namespace mlmodelsRouter
 */
const router = express.Router();
/**
 * Express proxy to comunicate with flask api.
 * @type {object}
 * @const
 * @namespace mlmodelsProxy
 */
var rp = require('request-promise');
const Sample = require('../models/Sample');
const LastInsert = require("../models/LastInsert");
const MlModel = require('../models/MlModel');
const fs=require('fs');
// Helpers
const { isAuthenticated } = require('../helpers/auth');
const { isAdmin } = require('../helpers/auth');
//Get all models
/**
 * Get all models trained om spftware
 * @name /models
 * @function
 * @memberof module:routers/mlmodels~mlmodelsRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get("/models", isAuthenticated, async (req, res) => {
  const models = await MlModel.find();
  const view = "model";
  res.render("mlmodels/all-models", { models, view });
});
//Create new model in route mlmodels/create-model
/**
 * Train new model from api flask 
 * @name /models/train
 * @function
 * @memberof module:routers/mlmodels~mlmodelsProxy
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get("/models/train", isAuthenticated, (req, res) => {
  const view = "model";
  res.render("mlmodels/create-model", {view});
});
router.post("/models/new-model", isAuthenticated, async (req, res) => {
  const { check, model, scaler, preprocessing, name } = req.body;
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
  if(check){
  derivable = "True";
  mlModel.derivable = derivable;
  }else{
    derivable = "False";
    mlModel.derivable = derivable;
  }
  try {
    var options = {
      method: 'POST',
      uri: 'http://localhost:5000/api/train/' + model + '/' + scaler + '/' + preprocessing + '/' + derivable,
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
            //const iMid = await LastInsert.findById("5d93f1b3a6f4271c900849c0");
            const iMid = await LastInsert.findById("5d926b4fc84df231a87609dc");
            mid = iMid.model;
            iMid.sample = parseInt(mid)+1;
            await LastInsert.findByIdAndUpdate("5d926b4fc84df231a87609dc", iMid);
            //await LastInsert.findByIdAndUpdate("5d93f1b3a6f4271c900849c0", iMid);
            mlModel.nombre = name+"-"+scaler+"-"+model+"-"+preprocessing+"-"+mid;
            mlModel.name = parsedBody.file_name;
            mlModel.mse = parsedBody.mse;
            mlModel.rr = parsedBody.r2;
            mlModel.cross_val_score = parsedBody.cross_val_score;
            fs.writeFile('../amas-app/src/public/models/'+mlModel.nombre+'.txt', parsedBody.model, error => {
              if (error)
                console.log(error);
            });
            fs.writeFile('../amas-app/src/public/models/'+mlModel.nombre+'-scaler.txt', parsedBody.scaler, error => {
              if (error)
                console.log(error);
            });
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
  res.redirect("../models");
});
//Get a model
/**
 * Show stadistic of a specific model
 * @name /models/view-mode/:id
 * @function
 * @memberof module:routers/mlmodels~mlmodelsProxy
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get("/models/view-mode/:id", isAuthenticated, async (req, res) => {
  const model = await MlModel.findById(req.params.id);
  const view = "model";
  res.render("mlmodels/view-model", { model, view });
});
// Delete Sample
/**
 * Delete a specific model
 * @name /mlmodels/delete/:id
 * @function
 * @memberof module:routers/mlmodels~mlmodelsProxy
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.delete('/mlmodels/delete/:id', isAuthenticated, async (req, res) => {
  var model = await MlModel.findById(req.params.id); 
  fs.unlink('../amas-app/src/public/models/'+model.nombre+".txt", function(err) {
    if (err) throw err;
  });
  fs.unlink('../amas-app/src/public/models/'+model.nombre+"-scaler.txt", function(err) {
    if (err) throw err;
  });
  //fs.unlinkSync('../amas-app/src/public/models/'+model.name+".txt");
  //fs.unlinkSync('../amas-app/src/public/models/'+model.nombre+"-scaler.txt");
  await MlModel.findByIdAndDelete(req.params.id);
  req.flash('success_msg', 'Modelo eliminado correctamente');
  res.redirect('/models');
});
module.exports = router;