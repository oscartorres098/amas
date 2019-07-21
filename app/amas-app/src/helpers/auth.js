const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'No Autorizado.');
  res.redirect('/users/signin');
};

helpers.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol == "administrador") {
    return next();
  }
  req.flash('error_msg', 'No Autorizado.');
  res.redirect('/');
};

module.exports = helpers;
