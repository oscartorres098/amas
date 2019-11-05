/** Express router providing general app related routes
 * @module routers/index
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
 * @namespace indexRouter
 */
const router = express.Router();
/**
 * Gets inicio screen
 * @name /
 * @function
 * @memberof module:routers/index~indexRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get('/', (req, res) => {
  res.render('inicio');
});
/**
 * Gets about screen
 * @name /acercade
 * @function
 * @memberof module:routers/index~indexRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get('/acercade', (req, res) => {
  res.render('acercade');
});
/**
 * Gets documents screen
 * @name /documentos
 * @function
 * @memberof module:routers/index~indexRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} isAuthenticated - auth helper
 * @param {callback} middleware - Express middleware.
 */
router.get('/documentos', (req, res) => {
  res.render('documentos');
});

module.exports = router;
