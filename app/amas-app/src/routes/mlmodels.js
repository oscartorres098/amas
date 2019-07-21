const express = require('express');
const router = express.Router();

const Sample = require('../models/MlModel');
// Helpers
const { isAuthenticated } = require('../helpers/auth');
const { isAdmin } = require('../helpers/auth');
//Get all samples
router.get('/mlmodels/create', isAuthenticated, async (req, res) => {
  res.render('mlmodels/create-mlmodel');
});
module.exports = router;
