const User = require("./user");
const Expense = require("./expense");
const Income = require("./income");
const Budget = require("./budget");
const Transaction = require("./transaction");
const Group = require("./group");
const Active_Committee=require("./active_committee")

//Associations
User.hasMany(Expense);
User.hasMany(Income);
User.hasMany(Budget);
User.hasMany(Transaction);
Transaction.belongsTo(User);
Budget.belongsTo(User);
Expense.belongsTo(User);
Income.belongsTo(User);
Budget.hasMany(Expense);
Expense.belongsTo(Budget);

//Groups can have Many Users
User.belongsTo(Group)
Group.hasMany(User)



module.exports = {
  User,
  Expense,
  Income,
  Budget,
  Transaction,
  Group,
  Active_Committee
};
