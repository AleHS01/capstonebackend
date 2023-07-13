const passport = require("../config/passport");
const ensureAuthenticated = (req, res, next) => {
  console.log("is auth? ", req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next();
  }
  // res.redirect("/api/login");
};

module.exports = ensureAuthenticated;
