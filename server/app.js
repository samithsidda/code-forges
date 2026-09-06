require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const connectDB =
    require("./config/db");

const Room =
    require("./models/Room");

const RoomMember =
    require("./models/RoomMember");

const authMiddleware =
    require("./middleware/authMiddleware");

const authRoutes =
    require("./routes/authRoutes");

const userRoutes =
    require("./routes/userRoutes");

const roomRoutes =
    require("./routes/roomRoutes");

const problemRoutes =
    require("./routes/problemRoutes");

const solutionRoutes =
    require("./routes/solutionRoutes");

const compilerRoutes =
    require("./routes/compilerRoutes");

const aiRoutes =
    require("./routes/aiRoutes");


connectDB();


const app =
    express();


const server =
    http.createServer(app);



const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL,
].filter(Boolean);


const io =
    new Server(server, {

        cors: {

            origin: allowedOrigins,

            methods: [
                "GET",
                "POST",
            ],

            credentials: true,

        },

    });


app.use(
    cors({

        origin: allowedOrigins,

        credentials: true,

    })
);


app.use(
    express.json()
);


app.use(
    cookieParser()
);


app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/users",
    authMiddleware,
    userRoutes
);


app.use(
    "/api/rooms",
    authMiddleware,
    roomRoutes
);


app.use(
    "/api/problems",
    authMiddleware,
    problemRoutes
);


app.use(
    "/api/solutions",
    authMiddleware,
    solutionRoutes
);


app.use(
    "/api/compiler",
    authMiddleware,
    compilerRoutes
);


app.use(
    "/api/ai",
    authMiddleware,
    aiRoutes
);


app.get(
    "/",
    (req, res) => {

        res.send(
            "CodeForge API is running successfully!"
        );

    }
);


// =====================================
// ROOM INACTIVITY CLEANUP
// =====================================

const ROOM_INACTIVITY_TIME =
    30 * 60 * 1000;


const cleanupInactiveRooms =
    async () => {

        try {

            const inactivityLimit =
                new Date(
                    Date.now() -
                    ROOM_INACTIVITY_TIME
                );


            const inactiveRooms =
                await Room.find({

                    lastActivity: {
                        $lt:
                            inactivityLimit,
                    },

                });


            if (
                inactiveRooms.length === 0
            ) {

                return;

            }


            for (
                const room
                of inactiveRooms
            ) {

                const result =
                    await RoomMember.deleteMany({

                        room:
                            room._id,

                    });


                if (
                    result.deletedCount > 0
                ) {

                    console.log(

                        `Room ${room.roomCode} expired. ` +
                        `${result.deletedCount} active member(s) removed.`

                    );


                    io.to(
                        room.roomCode
                    ).emit(

                        "room-expired",

                        {

                            roomCode:
                                room.roomCode,

                        }

                    );

                }

            }

        } catch (error) {

            console.error(

                "Inactive room cleanup error:",

                error

            );

        }

    };


setInterval(
    cleanupInactiveRooms,
    60 * 1000
);


// =====================================
// SOCKET.IO
// =====================================

io.on(
    "connection",
    (socket) => {

        console.log(
            "User connected:",
            socket.id
        );


        // =====================================
        // CODING ROOM
        // =====================================

        socket.on(
            "join-room",
            async (roomCode) => {

                socket.join(
                    roomCode
                );


                try {

                    await Room.findOneAndUpdate(

                        {
                            roomCode,
                        },

                        {
                            lastActivity:
                                new Date(),
                        }

                    );

                } catch (error) {

                    console.error(

                        "Room activity update error:",

                        error

                    );

                }


                console.log(

                    `Socket ${socket.id} joined room: ${roomCode}`

                );

            }
        );


        // =====================================
        // ROOM ACTIVITY
        // =====================================

        socket.on(
            "room-activity",
            async (roomCode) => {

                try {

                    await Room.findOneAndUpdate(

                        {
                            roomCode,
                        },

                        {
                            lastActivity:
                                new Date(),
                        }

                    );

                } catch (error) {

                    console.error(

                        "Room activity error:",

                        error

                    );

                }

            }
        );


        // =====================================
        // CODE CHANGE
        // =====================================

        socket.on(
            "code-change",
            async ({
                roomCode,
                code,
            }) => {

                socket.to(
                    roomCode
                ).emit(
                    "code-update",
                    code
                );


                try {

                    await Room.findOneAndUpdate(

                        {
                            roomCode,
                        },

                        {
                            lastActivity:
                                new Date(),
                        }

                    );

                } catch (error) {

                    console.error(

                        "Code activity error:",

                        error

                    );

                }

            }
        );


        // =====================================
        // LEAVE CODING ROOM
        // =====================================

        socket.on(
            "leave-room",
            (roomCode) => {

                socket.leave(
                    roomCode
                );


                console.log(

                    `Socket ${socket.id} left room: ${roomCode}`

                );

            }
        );


        // =====================================
        // VIDEO ROOM
        // =====================================

        socket.on(
            "join-video-room",
            async ({
                roomCode,
                name,
            }) => {

                const videoRoom =
                    `video-${roomCode}`;


                /*
                    Prevent the same socket from
                    joining the same video room
                    twice.
                */

                if (
                    socket.rooms.has(
                        videoRoom
                    )
                ) {

                    console.log(

                        `Socket ${socket.id} is already in ${videoRoom}`

                    );

                    return;

                }


                /*
                    Get existing users BEFORE
                    this socket joins.
                */

                const existingUsers =
                    io.sockets.adapter.rooms.get(
                        videoRoom
                    );


                const existingParticipants =
                    existingUsers
                        ? Array.from(
                            existingUsers
                        ).map(
                            (socketId) => {

                                const participant =
                                    io.sockets.sockets.get(
                                        socketId
                                    );


                                return {

                                    socketId,

                                    name:
                                        participant
                                            ?.data
                                            ?.userName ||
                                        "User",

                                    cameraOn:
                                        participant
                                            ?.data
                                            ?.cameraOn ??
                                        true,

                                    micOn:
                                        participant
                                            ?.data
                                            ?.micOn ??
                                        true,

                                };

                            }
                        )
                        : [];


                /*
                    Store participant data.
                */

                socket.data.userName =
                    name || "User";


                socket.data.cameraOn =
                    true;


                socket.data.micOn =
                    true;


                socket.join(
                    videoRoom
                );


                /*
                    Video call counts as activity.
                */

                try {

                    await Room.findOneAndUpdate(

                        {
                            roomCode,
                        },

                        {
                            lastActivity:
                                new Date(),
                        }

                    );

                } catch (error) {

                    console.error(

                        "Video activity error:",

                        error

                    );

                }


                /*
                    Send existing users to
                    the new participant.
                */

                socket.emit(

                    "existing-video-users",

                    existingParticipants

                );


                /*
                    Notify existing users.
                */

                socket.to(
                    videoRoom
                ).emit(

                    "new-video-user",

                    {

                        socketId:
                            socket.id,

                        name:
                            socket.data.userName,

                        cameraOn:
                            true,

                        micOn:
                            true,

                    }

                );


                console.log(

                    `Video user joined ${videoRoom}: ` +
                    `${socket.id} (${socket.data.userName})`

                );

            }
        );


        // =====================================
        // CAMERA STATUS
        // =====================================

        socket.on(
            "camera-toggle",
            ({
                roomCode,
                cameraOn,
            }) => {

                socket.data.cameraOn =
                    cameraOn;


                socket.to(
                    `video-${roomCode}`
                ).emit(

                    "participant-camera-toggle",

                    {

                        socketId:
                            socket.id,

                        cameraOn,

                    }

                );

            }
        );


        // =====================================
        // MICROPHONE STATUS
        // =====================================

        socket.on(
            "mic-toggle",
            ({
                roomCode,
                micOn,
            }) => {

                socket.data.micOn =
                    micOn;


                socket.to(
                    `video-${roomCode}`
                ).emit(

                    "participant-mic-toggle",

                    {

                        socketId:
                            socket.id,

                        micOn,

                    }

                );

            }
        );


        // =====================================
        // LEAVE VIDEO ROOM
        // =====================================

        socket.on(
            "leave-video-room",
            (roomCode) => {

                const videoRoom =
                    `video-${roomCode}`;


                /*
                    Only notify other users if
                    this socket is actually inside
                    the video room.
                */

                if (
                    !socket.rooms.has(
                        videoRoom
                    )
                ) {

                    return;

                }


                socket.to(
                    videoRoom
                ).emit(

                    "video-user-left",

                    socket.id

                );


                socket.leave(
                    videoRoom
                );


                console.log(

                    `Video user left ${videoRoom}: ${socket.id}`

                );

            }
        );


        // =====================================
        // WEBRTC OFFER
        // =====================================

        socket.on(
            "webrtc-offer",

            ({
                targetSocketId,
                offer,
            }) => {

                console.log(

                    `Offer: ${socket.id} -> ${targetSocketId}`

                );


                io.to(
                    targetSocketId
                ).emit(

                    "webrtc-offer",

                    {

                        senderSocketId:
                            socket.id,

                        offer,

                    }

                );

            }
        );


        // =====================================
        // WEBRTC ANSWER
        // =====================================

        socket.on(
            "webrtc-answer",

            ({
                targetSocketId,
                answer,
            }) => {

                console.log(

                    `Answer: ${socket.id} -> ${targetSocketId}`

                );


                io.to(
                    targetSocketId
                ).emit(

                    "webrtc-answer",

                    {

                        senderSocketId:
                            socket.id,

                        answer,

                    }

                );

            }
        );


        // =====================================
        // WEBRTC ICE
        // =====================================

        socket.on(
            "webrtc-ice-candidate",

            ({
                targetSocketId,
                candidate,
            }) => {

                console.log(

                    `ICE: ${socket.id} -> ${targetSocketId}`

                );


                io.to(
                    targetSocketId
                ).emit(

                    "webrtc-ice-candidate",

                    {

                        senderSocketId:
                            socket.id,

                        candidate,

                    }

                );

            }
        );


        // =====================================
        // DISCONNECTING
        // =====================================

        socket.on(
            "disconnecting",
            () => {

                /*
                    IMPORTANT:

                    disconnecting happens BEFORE
                    Socket.IO removes the socket
                    from its rooms.

                    Therefore socket.rooms still
                    contains video rooms here.
                */

                socket.rooms.forEach(
                    (roomName) => {

                        if (
                            roomName.startsWith(
                                "video-"
                            )
                        ) {

                            socket.to(
                                roomName
                            ).emit(

                                "video-user-left",

                                socket.id

                            );

                        }

                    }
                );


                console.log(

                    "User disconnecting:",

                    socket.id

                );

            }
        );


        // =====================================
        // DISCONNECTED
        // =====================================

        socket.on(
            "disconnect",
            () => {

                console.log(

                    "User disconnected:",

                    socket.id

                );

            }
        );

    }
);


// =====================================
// SERVER
// =====================================

const PORT =
    process.env.PORT || 5000;


server.listen(
    PORT,
    () => {

        console.log(

            `Server running on port ${PORT}`

        );

    }
);