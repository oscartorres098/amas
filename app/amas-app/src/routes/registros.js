const express = require('express');
const router = express.Router();
var rp = require('request-promise');
const Sample = require('../models/Sample');
const Registro = require("../models/Registro");
// Helpers
const { isAuthenticated } = require('../helpers/auth');
const { isAdmin } = require('../helpers/auth');
//Get all models
router.get("/registros", isAdmin, async (req, res) => {
  const registros = await Registro.find();
  const view = "actividad";
  res.render("actividad/ver-actividad", { registros, view });
});
module.exports = router;
