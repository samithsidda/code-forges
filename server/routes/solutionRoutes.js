const express = require("express");
const router = express.Router();

const { submitSolution ,getMySolution} = require("../controllers/solutionController");

router.post("/", submitSolution);
router.get("/:roomId",getMySolution)

module.exports = router;