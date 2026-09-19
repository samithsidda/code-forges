const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:5000";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${BACKEND_URL}/api/auth/google/callback`
);

// ==========================================
// GENERATE JWT
// ==========================================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==========================================
// REGISTER
// ==========================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: "local",
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GOOGLE LOGIN
// ==========================================

const googleLogin = (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
  });

  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "openid",
      "email",
      "profile",
    ],
    state,
    prompt: "select_account",
  });

  res.redirect(authUrl);
};

// ==========================================
// GOOGLE CALLBACK
// ==========================================

const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        message: "Google authorization code missing",
      });
    }

    if (
      !state ||
      state !== req.cookies.google_oauth_state
    ) {
      return res.status(400).json({
        message: "Invalid Google OAuth state",
      });
    }

    res.clearCookie("google_oauth_state");

    const { tokens } = await googleClient.getToken(code);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase();
    const name = payload.name;
    const picture = payload.picture;

    if (!email) {
      return res.status(400).json({
        message: "Google account email not available",
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (
        user.authProvider !== "google" &&
        user.authProvider !== "local"
      ) {
        return res.status(400).json({
          message:
            "This email is already connected to another login provider",
        });
      }

      if (user.authProvider === "local") {
        return res.status(400).json({
          message:
            "An account with this email already exists. Please use email/password login.",
        });
      }

      user.providerId = googleId;
      user.avatar = picture || user.avatar;

      await user.save();
    } else {
      user = await User.create({
        name: name || "Google User",
        email,
        password: null,
        authProvider: "google",
        providerId: googleId,
        avatar: picture || null,
      });
    }

    const token = generateToken(user);

    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?token=${token}`
    );
  } catch (error) {
    console.error("Google OAuth Error:", error);

    res.status(500).json({
      message: "Google authentication failed",
    });
  }
};

// ==========================================
// GITHUB LOGIN
// ==========================================

const githubLogin = (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("github_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri:
      `${BACKEND_URL}/api/auth/github/callback`,
    scope: "read:user user:email",
    state,
  });

  res.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );
};

// ==========================================
// GITHUB CALLBACK
// ==========================================

const githubCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        message: "GitHub authorization code missing",
      });
    }

    if (
      !state ||
      state !== req.cookies.github_oauth_state
    ) {
      return res.status(400).json({
        message: "Invalid GitHub OAuth state",
      });
    }

    res.clearCookie("github_oauth_state");

    // Exchange code for GitHub access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri:
            `${BACKEND_URL}/api/auth/github/callback`,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("GitHub token error:", tokenData);

      return res.status(400).json({
        message: "Failed to authenticate with GitHub",
      });
    }

    const accessToken = tokenData.access_token;

    // Get GitHub profile
    const userResponse = await fetch(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "CodeForge",
        },
      }
    );

    const githubUser = await userResponse.json();

    // Get GitHub emails
    const emailResponse = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "CodeForge",
        },
      }
    );

    const emails = await emailResponse.json();

    const primaryEmail =
      emails.find(
        (email) => email.primary && email.verified
      ) ||
      emails.find((email) => email.verified);

    const email = primaryEmail?.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({
        message:
          "No verified email address was found on your GitHub account",
      });
    }

    const githubId = String(githubUser.id);

    let user = await User.findOne({ email });

    if (user) {
      if (
        user.authProvider !== "github" &&
        user.authProvider !== "local"
      ) {
        return res.status(400).json({
          message:
            "This email is already connected to another login provider",
        });
      }

      if (user.authProvider === "local") {
        return res.status(400).json({
          message:
            "An account with this email already exists. Please use email/password login.",
        });
      }

      user.providerId = githubId;
      user.avatar = githubUser.avatar_url || user.avatar;

      await user.save();
    } else {
      user = await User.create({
        name:
          githubUser.name ||
          githubUser.login ||
          "GitHub User",
        email,
        password: null,
        authProvider: "github",
        providerId: githubId,
        avatar: githubUser.avatar_url || null,
      });
    }

    const token = generateToken(user);

    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?token=${token}`
    );
  } catch (error) {
    console.error("GitHub OAuth Error:", error);

    res.status(500).json({
      message: "GitHub authentication failed",
    });
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  getCurrentUser,
};