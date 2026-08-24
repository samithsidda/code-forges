const express = require("express");
const router = express.Router();

const { createRoom, joinRoom ,getMyRooms,getRoomById,leaveRoom,deleteRoom,assignProblem} = require("../controllers/roomController");

router.post("/", createRoom);
router.post("/join",joinRoom);
router.get("/",getMyRooms);
router.get("/:roomCode", getRoomById);
router.post("/:id/leave", leaveRoom);
router.delete("/:id", deleteRoom);
router.put("/:id/problem",assignProblem);

module.exports = router;