const cookieConfig =
  process.env.NODE_ENV == "dev"
    ? {
        maxAge: 7 * 24 * 60 * 60 * 1000, // The maximum age (in milliseconds) of a valid session.
        secure: false,
        httpOnly: false,
        sameSite: false,
      }
    : {
        maxAge: 7 * 24 * 60 * 60 * 1000, // The maximum age (in milliseconds) of a valid session.
        secure: true, // Required to enable cookies to go through https for better security
        httpOnly: true, // Not allowing client-side javascript to interact with cookie, thus increasing security
        sameSite: "none", // Required to enable cors for cookies
      };

module.exports = cookieConfig;
