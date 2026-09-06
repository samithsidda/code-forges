const Room = require("../models/Room");
const RoomMember = require("../models/RoomMember");
const Problem = require("../models/Problem");


// ===============================
// CREATE ROOM
// ===============================
const createRoom = async (req, res) => {
  try {
    const { name, topic } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Room name is required",
      });
    }

    // Generate unique room code
    let roomCode;
    let existingRoom;

    do {
      roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      existingRoom = await Room.findOne({ roomCode });
    } while (existingRoom);

    const room = await Room.create({
      name: name.trim(),
      topic: topic ? topic.trim() : "",
      roomCode,
      owner: req.user.id,
    });

    // Add creator as owner member
    await RoomMember.create({
      room: room._id,
      user: req.user.id,
      role: "owner",
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);

    res.status(500).json({
      message: "Failed to create room",
    });
  }
};


// ===============================
// JOIN ROOM
// ===============================
const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({
        message: "Room code is required",
      });
    }

    const room = await Room.findOne({
      roomCode: roomCode.toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (room.status !== "active") {
      return res.status(400).json({
        message: "Room is no longer active",
      });
    }

    room.lastActivity = new Date();
    await room.save();

    // Check if already a member
    const existingMember = await RoomMember.findOne({
      room: room._id,
      user: req.user.id,
    });

    if (existingMember) {
      return res.status(200).json({
        message: "Already a member of this room",
        room,
      });
    }

    const member = await RoomMember.create({
      room: room._id,
      user: req.user.id,
      role: "member",
    });

    // Notify other users
    const io = req.app.get("io");

    if (io) {
      io.to(room.roomCode).emit("member-joined", {
        roomCode: room.roomCode,
        userId: String(req.user.id),
      });
    }

    res.status(200).json({
      message: "Joined room successfully",
      room,
      member,
    });
  } catch (error) {
    console.error("Join room error:", error);

    res.status(500).json({
      message: "Failed to join room",
    });
  }
};


// ===============================
// GET MY ROOMS
// ===============================
const getMyRooms = async (req, res) => {
  try {
    const inactiveThreshold =
      new Date(Date.now() - 30 * 60 * 1000);

    // Find inactive rooms
    const inactiveRooms = await Room.find({
      lastActivity: {
        $lt: inactiveThreshold,
      },
      status: "active",
    });

    // Remove memberships from inactive rooms
    if (inactiveRooms.length > 0) {
      const inactiveRoomIds =
        inactiveRooms.map((room) => room._id);

      await RoomMember.deleteMany({
        room: {
          $in: inactiveRoomIds,
        },
      });

      await Room.updateMany(
        {
          _id: {
            $in: inactiveRoomIds,
          },
        },
        {
          $set: {
            status: "completed",
          },
        }
      );
    }

    // Rooms where the user is currently a member
    const memberships =
      await RoomMember.find({
        user: req.user.id,
      })
        .populate("room")
        .sort({ createdAt: -1 });


    // Rooms created by the user
    // These must remain visible even after
    // the owner leaves the room.
    const createdRooms =
      await Room.find({
        owner: req.user.id,
      }).sort({ createdAt: -1 });


    // Use a Map to prevent duplicate rooms
    const roomMap = new Map();


    // Add rooms where user is a member
    memberships.forEach((membership) => {

      if (!membership.room) {
        return;
      }

      roomMap.set(
        String(membership.room._id),
        {
          room: membership.room,
          role: membership.role,
        }
      );

    });


    // Add rooms created by the user
    // This guarantees owner rooms remain visible
    // even when their RoomMember record was deleted.
    createdRooms.forEach((room) => {

      roomMap.set(
        String(room._id),
        {
          room,
          role: "owner",
        }
      );

    });


    const rooms =
      Array.from(roomMap.values());


    res.status(200).json({
      rooms,
    });

  } catch (error) {

    console.error(
      "Get my rooms error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch rooms",
    });
  }
};



// ===============================
// GET ROOM BY CODE
// ===============================
const getRoomById = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({
      roomCode: roomCode.toUpperCase(),
    })
      .populate("owner", "name email")
      .populate("problem");

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    room.lastActivity = new Date();
    await room.save();

    // Check membership
    let membership = await RoomMember.findOne({
      room: room._id,
      user: req.user.id,
    });

    // Owner should always be a member
    if (!membership && String(room.owner._id) === String(req.user.id)) {
      membership = await RoomMember.create({
        room: room._id,
        user: req.user.id,
        role: "owner",
      });
    }

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this room",
      });
    }

    const members = await RoomMember.find({
      room: room._id,
    })
      .populate("user", "name email")
      .sort({ joinedAt: 1 });

    res.status(200).json({
      room,
      members,
      membership,
    });
  } catch (error) {
    console.error("Get room error:", error);

    res.status(500).json({
      message: "Failed to fetch room",
    });
  }
};


// ===============================
// HEARTBEAT
// ===============================
const heartbeatRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const membership = await RoomMember.findOne({
      room: room._id,
      user: req.user.id,
    });

    if (!membership && String(room.owner) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You are not a member of this room",
      });
    }

    room.lastActivity = new Date();
    await room.save();

    res.status(200).json({
      message: "Heartbeat updated",
    });
  } catch (error) {
    console.error("Heartbeat error:", error);

    res.status(500).json({
      message: "Failed to update heartbeat",
    });
  }
};


// ===============================
// LEAVE ROOM
// ===============================
const leaveRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const member = await RoomMember.findOne({
      room: room._id,
      user: req.user.id,
    });

    if (!member) {
      return res.status(404).json({
        message: "You are not currently in this room",
      });
    }

    await RoomMember.deleteOne({
      _id: member._id,
    });

    room.lastActivity = new Date();
    await room.save();

    const io = req.app.get("io");

    if (io) {
      io.to(room.roomCode).emit("member-left", {
        roomCode: room.roomCode,
        userId: String(req.user.id),
      });
    }

    res.status(200).json({
      message: "Left room successfully",
    });
  } catch (error) {
    console.error("Leave room error:", error);

    res.status(500).json({
      message: "Failed to leave room",
    });
  }
};


// ===============================
// DELETE ROOM
// ===============================
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (String(room.owner) !== String(req.user.id)) {
      return res.status(403).json({
        message: "Only the room creator can delete this room",
      });
    }

    await RoomMember.deleteMany({
      room: room._id,
    });

    await Room.deleteOne({
      _id: room._id,
    });

    res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);

    res.status(500).json({
      message: "Failed to delete room",
    });
  }
};


// ===============================
// ASSIGN PROBLEM
// ===============================
const assignProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { problemId } = req.body;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (String(room.owner) !== String(req.user.id)) {
      return res.status(403).json({
        message: "Only the room creator can assign a problem",
      });
    }

    if (problemId) {
      const problem = await Problem.findById(problemId);

      if (!problem) {
        return res.status(404).json({
          message: "Problem not found",
        });
      }
    }

    room.problem = problemId || null;
    room.lastActivity = new Date();

    await room.save();

    res.status(200).json({
      message: "Problem assigned successfully",
      room,
    });
  } catch (error) {
    console.error("Assign problem error:", error);

    res.status(500).json({
      message: "Failed to assign problem",
    });
  }
};


module.exports = {
  createRoom,
  joinRoom,
  getMyRooms,
  getRoomById,
  heartbeatRoom,
  leaveRoom,
  deleteRoom,
  assignProblem,
};  