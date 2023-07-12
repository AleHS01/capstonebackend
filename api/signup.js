const User = require('../database/Models/user')
const router = require('express').Router()

router.post('/', async(req, res, next)=> {
    try {
        const user = await User.create(req.body)
        if(!user){
            return res.status(400).send("User Not Created")
        }
        return res.status(200).send("User Created Successfully")
    } catch (error) {
        next(error)
    }
})
module.exports = router
