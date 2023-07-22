const router = require("express").Router();
const {Group,User} = require("../database/Models");
const authenticateUser = require("../middleware/authenticateUser")

router.post("/create",authenticateUser,async(req,res,next)=>{
    try {
        const userID=req.user.id;
        const {name}=req.body;

        const user= await User.findByPk(userID)
        
        const new_group=await Group.create({
            group_name:name
        });

        await user.update({
            GroupId: new_group.id,
          });
      

        res.status(200).json(new_group)
        
    } catch (error) {
        next(error)
    }

});

module.exports= router;