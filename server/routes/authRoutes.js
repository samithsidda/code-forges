const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/authController");
const {loginUser} = require("../controllers/loginController");

router.post("/register", registerUser);
router.post("/login",loginUser);

module.exports = router;
