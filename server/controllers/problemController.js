const Problem = require("../models/Problem");

const createProblem = async (req, res) => {
    try {
        const {
            title,
            description,
            difficulty,
            inputFormat,
            outputFormat,
            constraints,
            sampleInput,
            sampleOutput,
        } = req.body;

        if (!title || !description || !difficulty) {
            return res.status(400).json({
                message: "Title, description and difficulty are required",
            });
        }

        const problem = await Problem.create({
            title,
            description,
            difficulty,
            inputFormat,
            outputFormat,
            constraints,
            sampleInput,
            sampleOutput,
        });

        res.status(201).json({
            message: "Problem created successfully",
            problem,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

module.exports = {
    createProblem,
};