const Solution = require("../models/Solution");
const Room = require("../models/Room");

const submitSolution = async (req, res) => {
    try {
        const { roomId, language, sourceCode } = req.body;

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                message: "Room not found",
            });
        }

        if (!room.problem) {
            return res.status(400).json({
                message: "No problem assigned to this room",
            });
        }

        const solution = await Solution.create({
            room: roomId,
            problem: room.problem,
            user: req.user.id,
            language,
            sourceCode,
        });

        res.status(201).json({
            message: "Solution submitted successfully",
            solution,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

const getMySolution = async (req, res) => {
    try {
        const { roomId } = req.params;

        const solution = await Solution.findOne({
            room: roomId,
            user: req.user.id,
        }).populate("problem");

        if (!solution) {
            return res.status(404).json({
                message: "Solution not found",
            });
        }

        res.status(200).json({
            solution,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

module.exports = {
    submitSolution,
    getMySolution
};