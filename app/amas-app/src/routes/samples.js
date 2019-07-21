const express = require('express');
const router = express.Router();

const Sample = require('../models/Sample');
// Helpers
const { isAuthenticated } = require('../helpers/auth');
const { isAdmin } = require('../helpers/auth');
//Get all samples
router.get('/samples', isAuthenticated, async (req, res) => {
  const samples = await Sample.find();
  const view = "caract";
  res.render('samples/all-samples', { samples, view });
});
module.exports = router;
