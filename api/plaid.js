// const router = require("express").Router();
// // const {plaidClient} = require('../index')
// // console.log("my plaidClient",plaidClient)
// const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
// //const { LinkTokenCreateRequest } = plaidClient;

// const User = require("../database/Models/user");
// require("dotenv").config();
// const ensureAuthenticated = require("../middleware/ensureAuthenticated");

// const configuration = new Configuration({
//   basePath: "https://sandbox.plaid.com",
//   baseOptions: {
//     headers: {
//       "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
//       "PLAID-SECRET": process.env.PLAID_SECRET,
//     },
//   },
// });

// // setting up plaid client
// const plaidClient = new PlaidApi(configuration);

// // router.post(
// //   "/create_link_token/:id",
// //   ensureAuthenticated,
// //   async (req, res, next) => {
// //     const user = req.user;
// //     const id = req.params.id;
// //     //console.log("console logged here:", user)
// //     console.log("Get Token Link");
// //     const request = {
// //       user: {
// //         client_user_id: id.toString(),
// //       },
// //       client_name: "Finance Mate",
// //       products: ["auth"],
// //       country_codes: ["US"],
// //       language: "en",
// //     };

// //     try {
// //       const createTokenResponse = await plaidClient.linkTokenCreate(request);
// //       res.json("createTokenResponse.data");
// //     } catch (error) {
// //       console.log(error); // for debugging
// //       next(error);
// //     }
// //   }
// // );

// const callbackMiddleware = (req, res, next) => {
//   console.log("Callback function executed");
//   console.log("Request URL:", req.url);
//   next();
// };

// router.post(
//   "/create_link_token/:id",
//   ensureAuthenticated,
//   async (req, res, next) => {
//     try {
//       const { id } = req.params;
//       const request = {
//         user: {
//           client_user_id: id.toString(),
//         },
//         client_name: "Finance Mate",
//         products: ["auth"],
//         country_codes: ["US"],
//         language: "en",
//       };

//       const createTokenResponse = await plaidClient.linkTokenCreate(request);
//       res.json(createTokenResponse.data);
//     } catch (error) {
//       console.log(error);
//       next(error);
//     }
//   },
//   callbackMiddleware // Add the callback middleware as a separate argument
// );

// router.post("/exchange-public-token/:id", async (req, res, next) => {
//   try {
//     const { public_token } = req.body;
//     const { id } = req.params;
//     const user = await User.findByPk(id);

//     const response = await plaidClient.itemPublicTokenExchange(public_token);
//     console.log("Response Data", response.data);
//     const accessToken = response.data.access_token;
//     user.plaidAccessToken = accessToken;
//     await user.save();

//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error("Failed to exchange public token:", error);
//     res.sendStatus(500);
//   }
// });

// module.exports = router;

const router = require("express").Router();
const User = require("../database/Models/user");
require("dotenv").config();

router.post("/create_link_token/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = {
      user: {
        client_user_id: id.toString(),
      },
      client_name: "Finance Mate",
      products: ["auth"],
      country_codes: ["US"],
      language: "en",
    };

    const plaidClient = req.app.locals.plaidClient;
    const createTokenResponse = await plaidClient.linkTokenCreate(request);

    res.json(createTokenResponse.data);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/exchange-public-token/:id", async (req, res, next) => {
  try {
    const { public_token } = req.body;
    const { id } = req.params;
    const user = await User.findByPk(id);

    const plaidClient = req.app.locals.plaidClient;
    const response = await plaidClient.itemPublicTokenExchange(public_token);
    console.log("Response Data", response.data);
    const accessToken = response.data.access_token;
    user.plaidAccessToken = accessToken;
    await user.save();

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Failed to exchange public token:", error);
    res.sendStatus(500);
  }
});

router.post("/callback", async (req, res) => {
  try {
    const { public_token, metadata } = req.body;
    const { user_id } = metadata;

    // Exchange public token for access token
    const response = await plaidClient.exchangePublicToken(public_token);
    const { access_token } = response.data;

    // Save the access token to the user in your database
    const user = await User.findByPk(user_id);
    user.plaidAccessToken = access_token;
    await user.save();

    res.status(200).json({ message: "Plaid callback handled successfully" });
  } catch (error) {
    console.error("Failed to handle Plaid callback:", error);
    res.status(500).json({ error: "Failed to handle Plaid callback" });
  }
});

module.exports = router;

module.exports = router;
