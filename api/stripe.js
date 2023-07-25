const { authenticate } = require('passport');
const authenticateUser = require('../middleware/authenticateUser');

const stripe = require('stripe')('sk_test_51NU5vjGCLtTMWEv9ay2ULAYs2XP0v51AzuNc63mihcNN0dBkA9EPdlpr0uxnNIvbDjjoNs2ByHVQIeq7oE1JcdFS005uom0nlt');
const router = require("express").Router()
const {User,Group,Active_Committee}= require("../database/Models")

router.post("/create_customer",authenticateUser,async (req,res,next)=>{
  try {
    const user=await User.findByPk(req.user.id)
    const {first_name,last_name,email}=user;
    if (user.Stripe_Customer_id)  {
      res.send("User already registered with Stripe")
      return
    }

    const customer = await stripe.customers.create({
      name:`${first_name} ${last_name}`,
      email
    });
    // add customer name here to update stripe information
    const updated_user=await user.update({Stripe_Customer_id:customer.id})
    res.status(200).json("Customer Added to Stripe")
  } catch (error) {
    next(error)
  }
})

router.post("/setup_intent",authenticateUser,async(req,res,next)=>{
  try {
    //getting the user object
    const user=await User.findByPk(req.user.id)

    //the ephemeral key ?
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: user.Stripe_Customer_id},
      {apiVersion: '2022-11-15'}
    );
      
    //create a setUpInetent object
    const setupIntent = await stripe.setupIntents.create({
      customer:user.Stripe_Customer_id,
      payment_method_types: ['card'],
    });


    //send relevant information to the front end
    res.json({
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: user.Stripe_Customer_id,
      publishableKey: 'pk_test_51NU5vjGCLtTMWEv9kIf39oFsZe8DbDdKLPRY1gPanYNdHt7lbEnXAMHLngLWiXzJtltIBlxThpMvMPZlh5eDynIT002L4K7MzI'
    })
  
  } catch (error) {
    next(error)
  }
})

router.post("/create_checkout_session", authenticateUser, async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  const committeeId = req.user.GroupId;
  const committee = await Active_Committee.findByPk(committeeId);

  try {
    const session = await stripe.checkout.sessions.create({
      success_url: 'http://localhost:3000/success', // Redirect URL after successful payment
      cancel_url: 'http://localhost:3000/cancel', // Redirect URL after payment is canceled
      payment_method_types: ['card'],
      line_items: [
        {
          price: committee.stripe_product_id, // Use the Stripe product ID saved in Active_Committee
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer: user.Stripe_Customer_id,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    next(error);
  }
});


router.post("/activate_committee", authenticateUser, async (req, res, next) => {
  const { GroupId } = req.user;
  const group = await Group.findByPk(GroupId);
  const group_name = group.group_name;
  // Count the users in the group
  const usersInGroup = await User.count({ where: { GroupId } });

  try {
    // Create a product with the default price from the group
    const product = await stripe.products.create({
      name: group_name,

    });

    const price = await stripe.prices.create({
      unit_amount: Math.floor(group.amount*100/usersInGroup), // The price in the smallest currency unit (e.g., cents)
      currency: "usd",
      recurring: {
        interval: 'month', // Set the billing interval to 'month' for monthly subscription
        interval_count: 1, // Set the number of intervals to 1 for monthly subscription
      },
      product: product.id,
    });


    const today_date = new Date();
    const end_date = new Date();


    const new_committee = await Active_Committee.create({
      id: GroupId,
      committee_name: group_name,
      start_date: today_date,
      end_date: end_date.setMonth(end_date.getMonth() + usersInGroup),
      activated: true,
      stripe_product_id: product.id, // Save the product ID in the Active_Committee table
    });

    res.status(200).json({ product, new_committee });
  } catch (error) {
    next(error);
  }
});


router.post("/get_committee_product",authenticateUser,async (req,res,next)=>{
  const user=await User.findByPk(req.user.id)
  const committee= await Active_Committee.findByPk(req.userGroupId)
  const product = await stripe.products.retrieve(
    committee.stripe_product_id
  );

  res.status(200).json(product)
})




module.exports= router;


