const Room = require("../models/Room");
const RoomMember = require("../models/RoomMember");
const Problem = require("../models/Problem");

const createRoom = async (req, res) => {
    try {
        const { name, description, language, mode, isPrivate } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Room name is required",
            });
        }

        const roomCode = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        const room = await Room.create({
            name,
            description,
            language,
            mode,
            isPrivate,
            roomCode,
            owner: req.user.id,
        });

        await RoomMember.create({
            room: room._id,
            user: req.user.id,
            role: "owner",
        });

        res.status(201).json({
            message: "Room created successfully",
            room,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

const joinRoom = async (req, res) => {
    try {
        const { roomCode } = req.body;

        if (!roomCode) {
            return res.status(400).json({
                message: "Room code is required",
            });
        }

        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({
                message: "Room not found",
            });
        }

        const existingMember = await RoomMember.findOne({
            room: room._id,
            user: req.user.id,
        });

        if (existingMember) {
            return res.status(400).json({
                message: "You have already joined this room",
            });
        }

        await RoomMember.create({
            room: room._id,
            user: req.user.id,
            role: "member",
        });

        res.status(200).json({
            message: "Joined room successfully",
            room,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

const getMyRooms = async (req, res) => {
    try {
        const rooms = await RoomMember.find({
            user: req.user.id,
        }).populate("room");

        res.status(200).json({
            rooms,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};
const getRoomById = async (req, res) => {
    try {

       const room = await Room.findOne({
            roomCode: req.params.roomCode,
        })
        .populate("owner", "name email")
        .populate("problem");

        if (!room) {
            return res.status(404).json({
                message: "Room not found",
            });
        }

        const membership = await RoomMember.findOne({
            room: room._id,
            user: req.user.id,
        });

        if (!membership) {
            return res.status(403).json({
                message: "You are not a member of this room",
            });
        }

        const members = await RoomMember.find({
            room: room._id,
        }).populate("user", "name email");

        res.status(200).json({
            room,
            members,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

const leaveRoom = async (req, res) => {
    try {

        const membership = await RoomMember.findOne({
            room: req.params.id,
            user: req.user.id,
        });

        if (!membership) {
            return res.status(404).json({
                message: "You are not a member of this room",
            });
        }

        if (membership.role === "owner") {
            return res.status(400).json({
                message: "Owner cannot leave the room",
            });
        }

        await RoomMember.deleteOne({
            _id: membership._id,
        });

        res.status(200).json({
            message: "Left room successfully",
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

const deleteRoom = async (req, res) => {
    try {

        const membership = await RoomMember.findOne({
            room: req.params.id,
            user: req.user.id,
        });

        if (!membership || membership.role !== "owner") {
            return res.status(403).json({
                message: "Only the owner can delete the room",
            });
        }

        await Room.findByIdAndDelete(req.params.id);

        await RoomMember.deleteMany({
            room: req.params.id,
        });

        res.status(200).json({
            message: "Room deleted successfully",
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

const assignProblem = async (req, res) => {
    try {
        const { problemId } = req.body;

        const membership = await RoomMember.findOne({
            room: req.params.id,
            user: req.user.id,
        });

        if (!membership || membership.role !== "owner") {
            return res.status(403).json({
                message: "Only the owner can assign a problem",
            });
        }

        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found",
            });
        }

        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { problem: problemId },
            { returnDocument: "after" }
        ).populate("problem");

        res.status(200).json({
            message: "Problem assigned successfully",
            room,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

module.exports = {
    createRoom,
    joinRoom,
    getMyRooms,
    getRoomById,
    leaveRoom,
    deleteRoom,
    assignProblem,
};