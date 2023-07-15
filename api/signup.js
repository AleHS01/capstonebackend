const router = require("express").Router();
const { User } = require("../database/Models");
const bycrypt = require("bcryptjs");

router.post("/", async (req, res, next) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      res.send("User Already Exists");
    } else {
      await User.create({
        username: username,
        email: email,
        password: password,
      });

      res.send("User Created");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
