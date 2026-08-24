const express = require("express");
const router = express.Router();

const { createProblem } = require("../controllers/problemController");

router.post("/", createProblem);

module.exports = router;