const authenticateUser = require("../middleware/authenticateUser");

const stripe = require("stripe")(
  "sk_test_51NU5vjGCLtTMWEv9ay2ULAYs2XP0v51AzuNc63mihcNN0dBkA9EPdlpr0uxnNIvbDjjoNs2ByHVQIeq7oE1JcdFS005uom0nlt"
);
const router = require("express").Router();
const {
  User,
  Group,
  Active_Committee,
  Transaction,
} = require("../database/Models");
const cron = require("node-cron");

router.post("/create_customer", authenticateUser, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { first_name, last_name, email } = user;
    if (user.Stripe_Customer_id) {
      res.send("User already registered with Stripe");
      return;
    }

    const customer = await stripe.customers.create({
      name: `${first_name} ${last_name}`,
      email,
    });
    console.log(customer);
    // add customer name here to update stripe information
    const updated_user = await user.update({ Stripe_Customer_id: customer.id });
    await user.save();
    res.status(200).json("Customer Added to Stripe");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/setup_intent", authenticateUser, async (req, res, next) => {
  try {
    //getting the user object
    const user = await User.findByPk(req.user.id);

    //the ephemeral key ?
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: user.Stripe_Customer_id },
      { apiVersion: "2022-11-15" }
    );

    //create a setUpInetent object
    const setupIntent = await stripe.setupIntents.create({
      customer: user.Stripe_Customer_id,
      payment_method_types: ["card"],
    });

    //send relevant information to the front end
    res.json({
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: user.Stripe_Customer_id,
      publishableKey:
        "pk_test_51NU5vjGCLtTMWEv9kIf39oFsZe8DbDdKLPRY1gPanYNdHt7lbEnXAMHLngLWiXzJtltIBlxThpMvMPZlh5eDynIT002L4K7MzI",
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/create_checkout_session",
  authenticateUser,
  async (req, res, next) => {
    const user = await User.findByPk(req.user.id);
    const committeeId = req.user.GroupId;
    const committee = await Active_Committee.findByPk(committeeId);

    try {
      const session = await stripe.checkout.sessions.create({
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
        payment_method_types: ["card"],
        line_items: [
          {
            price: committee.stripe_price_id, // Use the Stripe price ID saved in Active_Committee
            quantity: 1,
          },
        ],
        mode: "subscription",
        customer: user.Stripe_Customer_id,
      });
      console.log("sessionId:", session.id);

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/activate_committee", authenticateUser, async (req, res, next) => {
  const { GroupId } = req.user;
  const group = await Group.findByPk(GroupId);
  const group_name = group.group_name;
  // Count the users in the group
  const usersInGroup = await User.count({ where: { GroupId } });

  const allUsersInGroup = await User.findAll({ where: { GroupId } });
  const arrayOfUsersID = allUsersInGroup.map((item) => item.Stripe_Customer_id);

  // const committee=await Active_Committee.findByPk(req.user.GroupId)
  // await committee.update({arrayOfUsersID});
  try {
    // Create a product with the default price from the group
    const product = await stripe.products.create({
      name: group_name,
    });

    const price = await stripe.prices.create({
      unit_amount: Math.floor((group.amount * 100) / usersInGroup), // The price in the smallest currency unit (e.g., cents)
      currency: "usd",
      recurring: {
        interval: "month", // Set the billing interval to 'month' for monthly subscription
        interval_count: 1, // Set the number of intervals to 1 for monthly subscription
      },
      product: product.id,
    });

    console.log("Price:", price);

    const today_date = new Date();
    const end_date = new Date();

    let new_committee;

    try {
      new_committee = await Active_Committee.create({
        id: GroupId,
        committee_name: group_name,
        start_date: today_date,
        end_date: end_date.setMonth(end_date.getMonth() + usersInGroup),
        activated: true,
        stripe_product_id: product.id, // Save the product ID in the Active_Committee table
        stripe_price_id: price.id, // Save the price ID in the Active_Committee table,
        individual_amount: Math.floor(group.amount / usersInGroup),
        total_amount: group.amount,
        arrayOfUsersID,
      });
      console.log(Math.floor(group.amount / usersInGroup));
    } catch (error) {
      console.log(error);
    }
    group.isActive = true;
    await group.save();

    res.status(200).json({ product, price, new_committee });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/get_committee_product",
  authenticateUser,
  async (req, res, next) => {
    console.log("STRIPE");
    const user = await User.findByPk(req.user.id);
    console.log("group id:", user.GroupId);
    const committee = await Active_Committee.findByPk(user.GroupId);
    console.log("committeee -->", committee);

    const product = await stripe.products.retrieve(committee.stripe_product_id);

    res.status(200).json(product);
  }
);

router.post("/has_valid_payment", authenticateUser, async (req, res, next) => {
  try {
    const customer = await stripe.customer.retrieve(
      req.user.Stripe_Customer_id
    );
    const user = await User.findByPk(req.user.id);
    await user.update({ hasValidPayment: true });
    res.status(200).send(!!customer.default_source);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/is_Committee_Ready", authenticateUser, async (req, res, next) => {
  try {
    // get all users from the group and see if they ALL have a valid payment method
    const committee_users = await User.findAll({
      where: {
        GroupId: req.user.GroupId,
      },
    });
    const setupIntents = (await stripe.setupIntents.list({})).data;
    for (const user of committee_users) {
      const userStripeCustomerId = user.Stripe_Customer_id;

      // Check if the user's Stripe_Customer_id exists in the setupIntents array
      const existingSetupIntent = setupIntents.find(
        (intent) => intent.customer === userStripeCustomerId
      );

      if (!existingSetupIntent) {
        res.send(false);
        return;
      }
    }
    res.send(true);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/payment_intent", authenticateUser, async (req, res, next) => {
  try {
    // const paymentMethodId = req.body.paymentMethodId

    const group = await Group.findByPk(req.user.GroupId);
    const usersInGroup = await User.findAll({
      where: { GroupId: req.user.GroupId },
    });
    console.log(usersInGroup);

    // Calculate the amount to be charged per user
    const amountPerUser = Math.floor(
      (group.amount * 100) / usersInGroup.length
    );

    // Create and confirm PaymentIntent for each user
    const paymentIntents = await Promise.all(
      usersInGroup.map(async (user) => {
        const paymentIntent = await stripe.paymentIntents.create({
          customer: user.Stripe_Customer_id,
          amount: amountPerUser,
          currency: "usd",
          // transfer_data: {
          //   destination: user.Stripe_Customer_id,
          // },
          // payment_method: paymentMethodId,
        });
        console.log("PaymentIntent:", paymentIntent);

        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
          paymentIntent.id,
          { payment_method: "pm_card_visa" }
        );
        console.log("Confirmed PaymentIntent:", confirmedPaymentIntent);

        return confirmedPaymentIntent;
      })
    );

    res.json(paymentIntents);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/updatePaymentStatus", authenticateUser, async (req, res) => {
  try {
    // Update the user record with the new payment status
    await User.update(
      { hasValidPayment: req.body.hasValidPayment },
      { where: { id: req.user.id } }
    );

    res.status(200).send("Payment status updated successfully.");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating payment status.");
  }
});

router.post("/checkPaymentStatus", authenticateUser, async (req, res, next) => {
  try {
    const groupId = req.body.groupId; // Get the groupId from query parameters
    const usersInGroup = await User.findAll({ where: { GroupId: groupId } });

    // Check if each user has a valid payment method
    const allUsersHavePaymentMethods = usersInGroup.every(
      (user) => user.hasValidPayment
    );
    console.log(
      "do all users inside this group have a valid payment?",
      allUsersHavePaymentMethods
    );

    res.json(allUsersHavePaymentMethods);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// router.post("/payout_user", authenticateUser, async (req, res, next) => {
//   let random_index = 0;
//   /**Draws a user instance and updates the array of Active_committtee */
//   function getRandomElementFromArray(arr) {
//     const randomIndex = Math.floor(Math.random() * arr.length);
//     random_index = randomIndex;
//     return arr[randomIndex];
//   }

//   try {
//     /**
//      * 1. draw a random user from the group.
//      * 2. keep track of the drawn user
//      *
//      * 3. Payout the drawn user.
//      *
//      * Excess, try to configure this to each month*/

//     //1.
//     const committee = await Active_Committee.findByPk(req.user.GroupId);
//     const chosenUser = getRandomElementFromArray(committee.arrayOfUsersID);
//     // const committee=await Active_Committee.findByPk(req.user.GroupId)

//     //2.

//     //3.
//     cron.schedule("0 0 1 * *", async () => {
//       try {
//         const payout = await stripe.payouts.create({
//           amount: committee.total_amount,
//           currency: "usd",
//           destination: chosenUser.Stripe_Customer_id,
//         });

//         console.log(`Payout successful for user ID ${chosenUser.id}`);
//       } catch (error) {
//         console.log(`Payout failed for user ID ${chosenUser.id}:`, error);
//       }
//     });

//     // updateArray()
//     res.status(200).json(payout);
//   } catch (error) {
//     next(error);
//     console.log(error);
//   }
// });

router.post("/payout_user", authenticateUser, async (req, res, next) => {
  const { chosenUserId, groupId } = req.body;
  console.log("GOT TO PAYOUT, lets pay user.id: ", chosenUserId);
  function generateTransactionId() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let transactionId = "";
    for (let i = 0; i < 24; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      transactionId += characters[randomIndex];
    }
    return transactionId;
  }

  try {
    const committee = await Group.findByPk(groupId);
    const chosenUser = await User.findByPk(chosenUserId);
    // console.log(
    //   "before posible error, cause of Strip_Customer_id, choosen user.Stripe_Customer_id: ",
    //   chosenUser.Stripe_Customer_id
    // );
    // const payout = await stripe.payouts.create({
    //   amount: committee.amount,
    //   currency: "usd",
    //   // destination: chosenUser.Stripe_Customer_id,
    //   description: `Payout from Committee Group: ${committee.group_name}`,
    // });

    const transactionId = generateTransactionId();

    await Transaction.create({
      amount: committee.amount,
      date: new Date().toISOString().split("T")[0],
      merchant_name: "CommitteSan - Finance Mate",
      category: "Received",
      name: `Committee Payout, Group: ${committee.group_name}`,
      payment_channe: "Transfer - FM",
      personal_finance_category: "RECEIVED",
      transaction_id: transactionId,
      UserId: chosenUser.id,
    });
    res.status(200).send("Payout Sucessfull");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/testing", authenticateUser, async (req, res, next) => {
  try {
    // //used to get all setupIntents
    // const setupIntents = await stripe.setupIntents.list({
    //   limit: 3,
    // });

    res.json(setupIntents);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
