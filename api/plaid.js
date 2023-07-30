const router = require("express").Router();
require("dotenv").config();
const plaid = require("plaid");
const authenticateUser = require("../middleware/authenticateUser");
const { User, Transaction } = require("../database/Models");

// const User = require("../database/Models/user");
const {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  TransactionsSyncRequest,
} = require("plaid");

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
      //   "Plaid-Version": "2020-09-14",
    },
  },
});

const client = new PlaidApi(configuration);

router.post("/create_link_token", authenticateUser, async (req, res, next) => {
  try {
    const user = req.user;

    const response = await client.linkTokenCreate({
      user: {
        client_user_id: user.id.toString(),
      },
      client_name: "Finance Mate",
      products: ["auth", "transactions"],
      country_codes: ["US"],
      language: "en",
      // redirect_uri: "http://localhost:3000/dashboard",
      // account_filters: {
      //   depository: {
      //     account_subtypes: ["checking", "savings"],
      //   },
      // },
    });
    console.log("Link Token Response", response.data);
    const link_token = response.data.link_token;
    res.json({ link_token });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post(
  "/exchange_public_token",
  authenticateUser,
  async (req, res, next) => {
    const public_token = req.body.public_token;
    try {
      const response = await client.itemPublicTokenExchange({
        public_token: public_token,
      });

      const user = await User.findByPk(req.user.id);
      const access_token = response.data.access_token;
      const itemId = response.data.item_id;

      console.log("Access Token Response", response.data);

      user.plaidAccessToken = access_token;
      user.plaidItemId = itemId;
      res.send(access_token);

      user.save();
      // res.redirect('/login')
      console.log(response.data);
    } catch (error) {
      console.log("Error in exchange_public_token");
      next(error);
    }
  }
);

router.post("/accounts", authenticateUser, async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  const access_token = user.plaidAccessToken;
  console.log(access_token);
  try {
    const response = await client.accountsGet({
      access_token: access_token,
    });
    const accounts = response.data.accounts;
    console.log("accounts in plaid line 95:\n", accounts);
    let sum = 0;
    for (account of accounts) {
      sum += account.balances.available;
    }
    user.balance = sum;
    user.save();

    res.json({ accounts });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

// router.post("/transactions", authenticateUser, async (req, res, next) => {
//   try {
//     let user = await User.findByPk(req.user.id);
//     let plaid_item_id = user.plaidItemId;
//     let access_token = user.plaidAccessToken;

//     let hasMore = true;
//     let cursor = null;
//     let allTrans = [];

//     while (hasMore) {
//       const request = {
//         access_token: access_token,
//         cursor: cursor,
//         options: { include_personal_finance_category: true },
//       };
//       const response = await client.transactionsSync(request);
//       const data = response.data;
//       allTrans = allTrans.concat(data.added);
//       hasMore = data.has_more;
//       cursor = data.next_cursor;
//     }
//     for (const transactionData of allTrans) {
//       const {
//         amount,
//         date,
//         merchant_name,
//         category,
//         name,
//         payment_channel,
//         personal_finance_category,
//         transaction_id,
//       } = transactionData;

//       await Transaction.findOrCreate({
//         where: { transaction_id },
//         defaults: {
//           amount,
//           date,
//           merchant_name,
//           category: category[0],
//           name,
//           payment_channe: payment_channel,
//           personal_finance_category: personal_finance_category.primary,
//           UserId: user.id,
//         },
//       });
//     }
//     const transactionsArray = await Transaction.findAll({
//       where: { UserId: user.id },
//     });

//     res.json(transactionsArray);
//   } catch (error) {
//     console.log("Error in Transactions");
//     next(error);
//   }
// });

router.post("/transactions", authenticateUser, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const plaid_item_id = user.plaidItemId;
    const access_token = user.plaidAccessToken;

    const request = {
      access_token: access_token,
      options: { include_personal_finance_category: true },
    };

    const response = await client.transactionsSync(request);
    const data = response.data;
    const allTrans = data.added;

    // Batch insert transactions
    const transactionRecords = allTrans.map((transactionData) => {
      const {
        amount,
        date,
        merchant_name,
        category,
        name,
        payment_channel,
        personal_finance_category,
        transaction_id,
      } = transactionData;

      return {
        amount,
        date,
        merchant_name,
        category: category[0],
        name,
        payment_channe: payment_channel, //in the db there is a typo so should stay like that
        personal_finance_category: personal_finance_category.primary,
        UserId: user.id,
        transaction_id,
      };
    });

    await Transaction.bulkCreate(transactionRecords, {
      updateOnDuplicate: ["transaction_id"],
    });

    const transactionsArray = await Transaction.findAll({
      where: { UserId: user.id },
    });

    res.json(transactionsArray);
  } catch (error) {
    console.log("Error in Transactions");
    next(error);
  }
});

module.exports = router;
