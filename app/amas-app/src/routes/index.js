const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('inicio', { inicio });
});

router.get('/acercade', (req, res) => {
  res.render('acercade', { acercaDe });
});

router.get('/documentos', (req, res) => {
  res.render('documentos', { documentos });
});

module.exports = router;
