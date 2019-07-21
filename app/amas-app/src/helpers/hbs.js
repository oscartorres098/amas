var register = function(Handlebars) {
  var helpers = {
    // put all of your helpers inside this object

  if_equal: function(a, b, opts){
    if (a == b) {
      return opts.fn(this)
  } else {
      return opts.inverse(this)
  }
    }
  };

  if (Handlebars && typeof Handlebars.registerHelper === "function") {
    // register helpers
    for (var prop in helpers) {
      Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
      // just return helpers object if we can't register helpers here
      return helpers;
  }

};

module.exports.register = register;
module.exports.helpers = register(null);   