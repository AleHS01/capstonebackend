const router = require("express").Router();
// const {plaidClient} = require('../index')
// console.log("my plaidClient",plaidClient)
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
//const { LinkTokenCreateRequest } = plaidClient;

const User = require("../database/Models/user");
require("dotenv").config();
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.CLIENT_ID,
      "PLAID-SECRET": process.env.SECRET,
    },
  },
});

// setting up plaid client
const plaidClient = new PlaidApi(configuration);

router.post(
  "/create_link_token",
  ensureAuthenticated,
  async (req, res, next) => {
    const user = req.user;
    // const id = req.params.id
    //console.log("console logged here:", user)

    const request = {
      user: {
        client_user_id: user.id.toString(),
      },
      client_name: "Finance Mate",
      products: ["auth"],
      country_codes: ["US"],
      language: "en",
    };

    try {
      const createTokenResponse = await plaidClient.linkTokenCreate(request);
      res.json(createTokenResponse.data);
    } catch (error) {
      console.log(error); // for debugging
      next(error);
    }
  }
);
module.exports = router;
