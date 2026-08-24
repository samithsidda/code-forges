const User = require("../models/User");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const loginUser = async(req,res)=>{
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "All fields are required",
            })
        }

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({
                message: "Invalid email or password",
            })
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({
                message: "Invalid email or password",
            })
        }

        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login Successful",
            token,
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
            }
        })
    }catch(err){
        res.status(500).json({
            message: err.message,
        })

    }
}

module.exports = {loginUser};