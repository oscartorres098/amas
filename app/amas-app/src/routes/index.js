const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('inicio');
});

router.get('/acercade', (req, res) => {
  res.render('acercade');
});

router.get('/documentos', (req, res) => {
  res.render('documentos');
});

module.exports = router;
