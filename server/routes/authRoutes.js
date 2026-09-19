const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  registerUser,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  getCurrentUser
} = require("../controllers/authController");

const { loginUser } = require("../controllers/loginController");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/me", authMiddleware, getCurrentUser);

// Google OAuth
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

// GitHub OAuth
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

module.exports = router;