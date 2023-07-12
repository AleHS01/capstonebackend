const router = require("express").Router();
const passport = require("passport");

router.post("/", (req, res, next) => {
  // Call the Passport authentication middleware. The 'local' string argument specifies
  // that we're using the Local Strategy for authentication.
  passport.authenticate("local", (error, user, info) => {
    // If an error occurred during authentication, pass it to the next middleware.
    if (error) {
      return next(error);
    }

    // If the user was not authenticated, send a 401 Unauthorized HTTP status code and
    // the message that came with the authentication result.
    if (!user) {
      return res.status(401).send(info.message);
    }

    // If the user was authenticated, log them in.
    req.login(user, (error) => {
      // If there was an error while logging the user in, pass it to the next middleware.
      if (error) {
        return next(error);
      }

      // If the user was logged in successfully, send a 200 OK HTTP status code and a success message.
      return res.status(200).send("User logged in");
    });
  })(req, res, next); // This invocation runs the authenticate middleware for the request.
});

router.get("/", (req, res) => {
  res.send('<a href="auth/google">Aunthenticate with Google<a>');
});

// Export the router to be used in the application.
module.exports = router;
