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
        GET CURRENT USER
        =====================================
    */

    const getCurrentUser =
        () => {

            try {

                return JSON.parse(

                    localStorage.getItem(
                        "user"
                    )

                );

            } catch (error) {

                console.log(
                    "Unable to read stored user."
                );

                return null;

            }

        };


    const getCurrentUserId =
        () => {

            const user =
                getCurrentUser();

            return (
                user?._id ||
                user?.id ||
                null
            );

        };


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


            const userId =
                getCurrentUserId();


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
                    Notify other members in
                    real time.
                */

                socket.emit(

                    "leave-room",

                    {

                        roomCode,

                        userId,

                    }

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

                    {

                        roomCode,

                        userId,

                    }

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
        CONSOLE UPDATE
        =====================================
    */

    const handleConsoleUpdate =
        ({
            output,
            error,
        }) => {

            setConsoleOutput(
                output
            );


            setConsoleError(
                error
            );


            setIsRunning(
                false
            );

        };


    /*
        =====================================
        SOCKET
        =====================================
    */

    useEffect(() => {

        /*
            Join the Socket.IO room using
            the format expected by app.js.
        */

        const joinSocketRoom =
            () => {

                const userId =
                    getCurrentUserId();


                console.log(

                    "Joining socket room:",

                    {
                        roomCode,
                        userId,
                    }

                );


                socket.emit(

                    "join-room",

                    {

                        roomCode,

                        userId,

                    }

                );

            };


        /*
            SOCKET CONNECT
        */

        const handleConnect =
            () => {

                console.log(

                    "Socket connected:",

                    socket.id

                );


                joinSocketRoom();

            };


        /*
            MEMBER JOINED

            Backend sends the notification.
            We fetch fresh member data from
            MongoDB instead of manually
            constructing member objects.
        */

        const handleMemberJoined =
            () => {

                console.log(

                    "Member joined - refreshing members"

                );


                /*
                    Small delay ensures the
                    database membership write
                    is available before fetch.
                */

                setTimeout(

                    () => {

                        fetchRoomData();

                    },

                    200

                );

            };


        /*
            MEMBER LEFT
        */

        const handleMemberLeft =
            () => {

                console.log(

                    "Member left - refreshing members"

                );


                setTimeout(

                    () => {

                        fetchRoomData();

                    },

                    200

                );

            };


        /*
            CODE UPDATE
        */

        const handleCodeUpdate =
            (updatedCode) => {

                setSharedCode(
                    updatedCode
                );

            };


        /*
            ROOM EXPIRED
        */

        const handleRoomExpired =
            () => {

                console.log(

                    "Room became inactive."

                );


                fetchRoomData();

            };


        /*
            =====================================
            SOCKET LISTENERS
            =====================================
        */

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

            "console-update",

            handleConsoleUpdate

        );


        socket.on(

            "room-expired",

            handleRoomExpired

        );


        /*
            =====================================
            CONNECT / JOIN ROOM
            =====================================
        */

        if (!socket.connected) {

            socket.connect();

        } else {

            /*
                Socket already exists,
                so join the current room.
            */

            joinSocketRoom();

        }


        /*
            =====================================
            CLEANUP
            =====================================
        */

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

                "console-update",

                handleConsoleUpdate

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


                /*
                    SHARE CONSOLE OUTPUT
                */

                socket.emit(

                    "console-update",

                    {

                        roomCode,

                        output:
                            response.data,

                        error:
                            null,

                    }

                );


            } catch (err) {

                console.error(

                    err.response?.data ||
                    err.message

                );


                const errorMessage =

                    err.response?.data?.message ||

                    "Error running code";


                setConsoleError(
                    errorMessage
                );


                /*
                    SHARE CONSOLE ERROR
                */

                socket.emit(

                    "console-update",

                    {

                        roomCode,

                        output:
                            null,

                        error:
                            errorMessage,

                    }

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

    const currentUser =
        getCurrentUser();


    const currentUserName =
        currentUser?.name ||
        "You";


    /*
        =====================================
        RENDER
        =====================================
    */

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


                    {/* TOPIC */}

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


                    {/* ROOM CODE */}

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


                    {/* LEAVE ROOM */}

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

                        socket={
                            socket
                        }

                        roomCode={
                            roomCode
                        }

                    />

                </section>


            </main>


        </div>

    );

}


export default Room;