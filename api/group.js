const router = require("express").Router();
const {Group} = require("../database/Models");
const authenticateUser = require("../middleware/authenticateUser")

router.post("/add",authenticateUser,async(req,res,next)=>{
    try {
        const userID=req.user.id;
        const {name}=req.body;
        const new_group=await Group.create({
            name
        });

        res.status(200).json(new_group)
        
    } catch (error) {
        next(error)
    }

});

module.exports= router;