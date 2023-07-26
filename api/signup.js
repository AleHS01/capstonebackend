const router = require("express").Router();
const { User } = require("../database/Models");
const bycrypt = require("bcryptjs");

router.post("/", async (req, res, next) => {
  const { username, password, email, first_name, last_name } = req.body;
  console.log("Sign Up triggerred line 7");
  try {
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      res.send("User Already Exists");
    } else {
      await User.create({
        username: username,
        email: email,
        password: password,
        first_name: first_name,
        last_name: last_name,
      });

      res.send("User Created");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
