const router = require("express").Router();
const {Group,User} = require("../database/Models");
const authenticateUser = require("../middleware/authenticateUser")

router.post("/create",authenticateUser,async(req,res,next)=>{
    try {
        const userID=req.user.id;
        const {name}=req.body;

        const user= await User.findByPk(userID)

        if (user.GroupId) {
            return res.status(409).json({ error: "User already has a group" });
        }
      
        
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
router.get("/get_all_groups",authenticateUser,async(req,res,next)=>{
    try {
        const all_groups=await Group.findAll()
        res.status(200).json(all_groups)
    } catch (error) {
        next(error)
    }
})

router.post("/add_member",authenticateUser,async (req,res,next)=>{
    try {
        const user_id=req.user.id
        const {GroupId}=req.body
        const user=await User.findByPk(user_id)
        if (user.GroupId!==null){
            return res.status(409).send("User Already has a group")
        }
        const updated_user=await user.update({GroupId});
        res.status(200).send(updated_user);
    } catch (error) {
        next(error)
    }
})
module.exports= router;