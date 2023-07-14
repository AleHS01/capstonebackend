const authenticateUser = (req, res, next) => {
  console.log("is auth?", req.isAuthenticated());
  console.log("req.user ", req.user);
  if (req.isAuthenticated()) {
    // If the user is authenticated, allow them to proceed
    return next();
  }
  // res.status(401).send("Unauthorized");
};

module.exports = authenticateUser;
