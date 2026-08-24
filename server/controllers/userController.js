const User = require("../models/User");
const getProfile = async(req,res)=>{

        try{
        const userId = req.user.id;

        const user = await User.findById(userId).select("-password");
        if(!userId){
            return res.status(401).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            user,
        })
    }catch(err){
        res.status(500).json({
            message: err.message,
        })
    }
};

module.exports= getProfile;