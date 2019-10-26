const router = require('express').Router();
const passport = require('passport');

// Models
const User = require('../models/User');

//helpers
const { isAdmin } = require('../helpers/auth');

router.get('/users/signup', isAdmin, (req, res) => {
  const view = "users";
  res.render('users/signup', { view });
});

router.post('/users/signup',isAdmin, async (req, res) => {
  let errors = [];
  const { name, email, password, confirm_password, rol } = req.body;
  if(password != confirm_password) {
    errors.push({text: 'Las contraseña no coinciden.'});
  }
  if(password.length < 4) {
    errors.push({text: 'La contraseña debe ser de cuatro caracteres.'})
  }
  if(errors.length > 0){
    res.render('users/signup', {errors, name, email, password, confirm_password, rol});
  } else {
    // Look for email coincidence
    const emailUser = await User.findOne({email: email});
    if(emailUser) {
      req.flash('error_msg', 'El correo ya está registrado.');
      res.redirect('/users/signup');
    } else {
      // Saving a New User
      const newUser = new User({name, email, password, rol});
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      req.flash('success_msg', 'Usuario Resgistrado.');
      res.redirect('/users');
    }
  }
});

router.get('/users/signin', (req, res) => {
  res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {
  successRedirect: '/samples',
  failureRedirect: '/users/signin',
  failureFlash: true
}));

router.get('/users/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Has cerrado sesion');
  res.redirect('/users/signin');
});

//Ver Usuarios
router.get('/users', isAdmin, async (req, res) => {
  const users = await User.find();
  var view = "users"
  res.render('users/all-users', { users, view });
});


module.exports = router;
