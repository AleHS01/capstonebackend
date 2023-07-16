const router = require('express').Router()
const User = require("../database/Models/user")
const Budget = require("../database/Models/budget")
const authenticateUser = require('../middleware/authenticateUser')

router.post("/addBudget", authenticateUser, async (req,res,next) => {
    try {
       const userId = req.user.id 
       const {budget_name, amount} = req.body

       const budget = await Budget.create({
        budget_name,
        amount,
        userId: userId
       })

       console.log(budget)
       res.status(200).send("Budget Added")
    } catch (error) {
        next(error)
    }
})

module.exports = router