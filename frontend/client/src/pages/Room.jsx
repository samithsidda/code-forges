import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import socket from "../socket/socket";
import api from "../api/axios";

import CodeEditor from "../components/CodeEditor";
import Console from "../components/Console";
import AIAssistant from "../components/AIAssistant";
import VideoCall from "../components/VideoCall";

import "../styles/Room.css";


function Room() {

    const { roomCode } =
        useParams();


    const navigate =
        useNavigate();


    const [room, setRoom] =
        useState(null);


    const [members, setMembers] =
        useState([]);


    const [
        showMembers,
        setShowMembers
    ] = useState(false);


    const [
        consoleOutput,
        setConsoleOutput
    ] = useState(null);


    const [
        consoleError,
        setConsoleError
    ] = useState(null);


    const [
        isRunning,
        setIsRunning
    ] = useState(false);


    const [
        language,
        setLanguage
    ] = useState("java");


    const [
        sharedCode,
        setSharedCode
    ] = useState(

        `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

    }
}`

    );


    /*
        =====================================
        FETCH ROOM DATA
        =====================================
    */

    const fetchRoomData =
        async () => {

            try {

                const token =
                    localStorage.getItem(
                        "token"
                    );


                const res =
                    await api.get(

                        `/rooms/${roomCode}`,

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${token}`,

                            },

                        }

                    );


                setRoom(
                    res.data.room
                );


                setMembers(
                    res.data.members || []
                );


            } catch (err) {

                console.log(

                    err.response?.data ||
                    err.message

                );

            }

        };


    /*
        =====================================
        ROOM HEARTBEAT
        =====================================
    */

    useEffect(() => {

        if (!room?._id) {
            return;
        }


        const sendHeartbeat =
            async () => {

                try {

                    const token =
                        localStorage.getItem(
                            "token"
                        );


                    await api.post(

                        `/rooms/${room._id}/heartbeat`,

                        {},

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${token}`,

                            },

                        }

                    );

                } catch (err) {

                    console.log(

                        "Heartbeat error:",

                        err.response?.data ||
                        err.message

                    );

                }

            };


        sendHeartbeat();


        const heartbeatInterval =
            setInterval(

                sendHeartbeat,

                2 * 60 * 1000

            );


        return () => {

            clearInterval(
                heartbeatInterval
            );

        };

    }, [room?._id]);


    /*
        =====================================
        LEAVE ROOM
        =====================================
    */

    const handleLeaveRoom =
        async () => {

            const confirmLeave =
                window.confirm(

                    "Are you sure you want to leave this room?"

                );


            if (!confirmLeave) {
                return;
            }


            try {

                const token =
                    localStorage.getItem(
                        "token"
                    );


                /*
                    Leave WebRTC room first.
                */

                socket.emit(

                    "leave-video-room",

                    roomCode

                );


                /*
                    Remove database membership.
                */

                await api.post(

                    `/rooms/${room._id}/leave`,

                    {},

                    {

                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                        },

                    }

                );


                /*
                    Leave Socket.IO coding room.
                */

                socket.emit(

                    "leave-room",

                    roomCode

                );


                navigate(
                    "/dashboard"
                );


            } catch (err) {

                console.error(

                    err.response?.data ||
                    err.message

                );


                /*
                    Always clean up realtime
                    connections if something
                    went wrong.
                */

                socket.emit(

                    "leave-video-room",

                    roomCode

                );


                socket.emit(

                    "leave-room",

                    roomCode

                );


                if (

                    err.response?.status === 404 &&

                    err.response?.data?.message ===
                    "You are not currently in this room"

                ) {

                    alert(

                        "Your room membership has already expired. Returning to dashboard."

                    );


                    navigate(
                        "/dashboard"
                    );

                    return;

                }


                alert(

                    err.response?.data?.message ||

                    "Failed to leave room"

                );

            }

        };


    /*
        =====================================
        CODE CHANGE
        =====================================
    */

    const handleCodeChange =
        (updatedCode) => {

            setSharedCode(
                updatedCode
            );


            socket.emit(

                "code-change",

                {

                    roomCode,

                    code:
                        updatedCode,

                }

            );

        };


    /*
        =====================================
        SOCKET
        =====================================
    */

    useEffect(() => {

        const handleConnect =
            () => {

                console.log(

                    "Socket connected:",

                    socket.id

                );


                socket.emit(

                    "join-room",

                    roomCode

                );

            };


        const handleMemberJoined =
            () => {

                fetchRoomData();

            };


        const handleMemberLeft =
            ({ userId }) => {

                setMembers(

                    (currentMembers) =>

                        currentMembers.filter(

                            (member) =>

                                String(

                                    member.user?._id ||
                                    member.user

                                ) !==
                                String(userId)

                        )

                );

            };


        const handleCodeUpdate =
            (updatedCode) => {

                setSharedCode(
                    updatedCode
                );

            };


        const handleRoomExpired =
            () => {

                console.log(

                    "Room became inactive."

                );


                fetchRoomData();

            };


        socket.on(

            "connect",

            handleConnect

        );


        socket.on(

            "member-joined",

            handleMemberJoined

        );


        socket.on(

            "member-left",

            handleMemberLeft

        );


        socket.on(

            "code-update",

            handleCodeUpdate

        );


        socket.on(

            "room-expired",

            handleRoomExpired

        );


        /*
            Only connect if the socket is
            currently disconnected.
        */

        if (!socket.connected) {

            socket.connect();

        } else {

            socket.emit(

                "join-room",

                roomCode

            );

        }


        return () => {

            socket.off(

                "connect",

                handleConnect

            );


            socket.off(

                "member-joined",

                handleMemberJoined

            );


            socket.off(

                "member-left",

                handleMemberLeft

            );


            socket.off(

                "code-update",

                handleCodeUpdate

            );


            socket.off(

                "room-expired",

                handleRoomExpired

            );

        };

    }, [roomCode]);


    /*
        =====================================
        INITIAL ROOM FETCH
        =====================================
    */

    useEffect(() => {

        fetchRoomData();

    }, [roomCode]);


    /*
        =====================================
        RUN CODE
        =====================================
    */

    const handleRunCode =
        async ({

            code,

            language,

            version,

            input = "",

        }) => {

            try {

                setIsRunning(
                    true
                );


                setConsoleError(
                    null
                );


                setConsoleOutput(
                    null
                );


                socket.emit(

                    "room-activity",

                    roomCode

                );


                const token =
                    localStorage.getItem(
                        "token"
                    );


                const response =
                    await api.post(

                        "/compiler/run",

                        {

                            code,

                            language,

                            version,

                            input,

                        },

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${token}`,

                            },

                        }

                    );


                setConsoleOutput(
                    response.data
                );


            } catch (err) {

                console.error(

                    err.response?.data ||
                    err.message

                );


                setConsoleError(

                    err.response?.data?.message ||

                    "Error running code"

                );


            } finally {

                setIsRunning(
                    false
                );

            }

        };


    /*
        =====================================
        LOADING
        =====================================
    */

    if (!room) {

        return (

            <h2>
                Loading...
            </h2>

        );

    }


    /*
        =====================================
        CURRENT USER
        =====================================
    */

    let currentUserName =
        "You";


    try {

        const storedUser =
            JSON.parse(

                localStorage.getItem(
                    "user"
                )

            );


        if (
            storedUser?.name
        ) {

            currentUserName =
                storedUser.name;

        }

    } catch (error) {

        console.log(

            "Unable to read stored user."

        );

    }


    return (

        <div
            className="code-room-container"
        >


            {/* ================================
                HEADER
            ================================= */}

            <header
                className="code-room-header"
            >

                <div
                    className="codeforge-brand"
                >

                    <h1>
                        CodeForge
                    </h1>

                </div>


                <div
                    className="room-header-info"
                >


                    <div
                        className="room-topic"
                    >

                        <span>
                            Topic
                        </span>


                        <strong>

                            {
                                room.topic ||
                                "No topic"
                            }

                        </strong>

                    </div>


                    <div
                        className="room-code-display"
                    >

                        <span>
                            Room Code
                        </span>


                        <strong>
                            {room.roomCode}
                        </strong>

                    </div>


                    {/* MEMBERS */}

                    <div
                        className="members-dropdown-wrapper"
                    >

                        <button

                            className="members-button"

                            onClick={() =>
                                setShowMembers(
                                    (prev) =>
                                        !prev
                                )
                            }

                        >

                            <span>

                                👥 Members (
                                {members.length}
                                )

                            </span>


                            <span
                                className="members-arrow"
                            >

                                {
                                    showMembers
                                        ? "▲"
                                        : "▼"
                                }

                            </span>

                        </button>


                        {showMembers && (

                            <div
                                className="members-dropdown"
                            >

                                <div
                                    className="members-dropdown-header"
                                >

                                    Members (
                                    {members.length}
                                    )

                                </div>


                                {members.length > 0 ? (

                                    members.map(

                                        (member) => (

                                            <div

                                                key={
                                                    member.user?._id ||
                                                    member._id
                                                }

                                                className="member-item"

                                            >

                                                <span
                                                    className="member-status"
                                                />


                                                <span>

                                                    {
                                                        member.user?.name ||
                                                        member.name ||
                                                        "Unknown User"
                                                    }

                                                </span>

                                            </div>

                                        )

                                    )

                                ) : (

                                    <div
                                        className="no-members"
                                    >

                                        No members

                                    </div>

                                )}

                            </div>

                        )}

                    </div>


                    <button

                        className="leave-room-btn"

                        onClick={
                            handleLeaveRoom
                        }

                    >

                        Leave Room

                    </button>


                </div>

            </header>


            {/* ================================
                MAIN
            ================================= */}

            <main
                className="code-room-main"
            >


                {/* ============================
                    VIDEO PANEL
                ============================= */}

                <section
                    className="video-sidebar"
                >

                    <VideoCall

                        roomCode={
                            roomCode
                        }

                        userName={
                            currentUserName
                        }

                    />

                </section>


                {/* ============================
                    CODE EDITOR
                ============================= */}

                <section
                    className="editor-section"
                >

                    <CodeEditor

                        code={
                            sharedCode
                        }

                        onCodeChange={
                            handleCodeChange
                        }

                        language={
                            language
                        }

                        onLanguageChange={
                            setLanguage
                        }

                        onRunCode={
                            handleRunCode
                        }

                        isRunning={
                            isRunning
                        }

                    />


                    <Console

                        output={
                            consoleOutput
                        }

                        error={
                            consoleError
                        }

                        isRunning={
                            isRunning
                        }

                    />

                </section>


                {/* ============================
                    AI ASSISTANT
                ============================= */}

                <section
                    className="ai-section"
                >

                    <AIAssistant

                        code={
                            sharedCode
                        }

                        language={
                            language
                        }

                    />

                </section>


            </main>


        </div>

    );

}


export default Room;