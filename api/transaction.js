const router = require("express").Router();
const authenticateUser = require("../middleware/authenticateUser");
const { User, Transaction } = require("../database/Models");

function generateTransactionId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let transactionId = "";
  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    transactionId += characters[randomIndex];
  }
  return transactionId;
}

router.put("/send", authenticateUser, async (req, res, next) => {
  try {
    const { amount, recipientId } = req.body;

    const sender = await User.findByPk(req.user.id);
    const recipient = await User.findByPk(recipientId);

    if (sender.balance >= amount) {
      const newBalance = sender.balance - amount;
      sender.balance = newBalance;
      await sender.save();

      const transactionId = generateTransactionId();
      const transactionName = `Transfer to ${recipient.first_name} ${recipient.last_name}`;
      const transactionCategory = "Sent";

      await Transaction.create({
        amount: amount,
        date: new Date().toISOString().split("T")[0],
        merchant_name: `${recipient.first_name} ${recipient.last_name}`,
        category: transactionCategory,
        name: transactionName,
        payment_channe: "Transfer - FinanceM",
        personal_finance_category: "SEND",
        transaction_id: transactionId,
        UserId: sender.id,
      });

      res.status(200).json(newBalance);
    } else {
      res.status(400).json({ message: "Insufficient balance" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/receive", authenticateUser, async (req, res, next) => {
  try {
    const { amount, senderId } = req.body;

    const sender = await User.findByPk(senderId);
    const recipient = await User.findByPk(req.user.id);
    console.log("prev balance: ", recipient.balance);
    console.log("amount to add: ", amount);

    const newBalance = parseFloat(recipient.balance) + amount;
    console.log("new Balance: ", newBalance);
    recipient.balance = newBalance;
    await recipient.save();

    const transactionId = generateTransactionId();
    const transactionName = `Transfer Received from ${sender.first_name} ${sender.last_name}`;
    const transactionCategory = "Received";

    await Transaction.create({
      amount: amount,
      date: new Date().toISOString().split("T")[0],
      merchant_name: `${sender.first_name} ${sender.last_name}`,
      category: transactionCategory,
      name: transactionName,
      payment_channe: "Recieved Transfer - FinanceM",
      personal_finance_category: "RECEIVED",
      transaction_id: transactionId,
      UserId: recipient.id,
    });

    res.status(200).json(newBalance);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
