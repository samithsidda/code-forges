import {
    useEffect,
    useRef,
    useState,
} from "react";

import socket from "../socket/socket";

import "../styles/VideoCall.css";


function VideoCall({
    roomCode,
    userName,
}) {

    const [
        participants,
        setParticipants,
    ] = useState([]);


    const [
        remoteStreams,
        setRemoteStreams,
    ] = useState({});


    const [
        isInCall,
        setIsInCall,
    ] = useState(false);


    const [
        isMicOn,
        setIsMicOn,
    ] = useState(true);


    const [
        isCameraOn,
        setIsCameraOn,
    ] = useState(true);


    const [
        mediaError,
        setMediaError,
    ] = useState(null);


    const [
        isExpanded,
        setIsExpanded,
    ] = useState(false);


    const localVideoRef =
        useRef(null);


    const localStreamRef =
        useRef(null);


    const peerConnectionsRef =
        useRef({});


    const pendingIceCandidatesRef =
        useRef({});


    const rtcConfig = {

        iceServers: [

            {
                urls:
                    "stun:stun.l.google.com:19302",
            },

        ],

    };


    // =====================================
    // CREATE PEER CONNECTION
    // =====================================

    const createPeerConnection =
        (targetSocketId) => {

            if (
                peerConnectionsRef.current[
                    targetSocketId
                ]
            ) {

                return peerConnectionsRef.current[
                    targetSocketId
                ];

            }


            const peerConnection =
                new RTCPeerConnection(
                    rtcConfig
                );


            if (
                localStreamRef.current
            ) {

                localStreamRef.current
                    .getTracks()
                    .forEach(

                        (track) => {

                            peerConnection.addTrack(

                                track,

                                localStreamRef.current

                            );

                        }

                    );

            }


            peerConnection.onicecandidate =
                (event) => {

                    if (
                        event.candidate
                    ) {

                        socket.emit(

                            "webrtc-ice-candidate",

                            {

                                targetSocketId,

                                candidate:
                                    event.candidate,

                            }

                        );

                    }

                };


            peerConnection.ontrack =
                (event) => {

                    console.log(

                        "Remote track received from:",

                        targetSocketId

                    );


                    const stream =
                        event.streams[0];


                    if (!stream) {

                        return;

                    }


                    setRemoteStreams(

                        (previousStreams) => ({

                            ...previousStreams,

                            [targetSocketId]:
                                stream,

                        })

                    );

                };


            peerConnection.onconnectionstatechange =
                () => {

                    console.log(

                        `Connection ${targetSocketId}:`,

                        peerConnection
                            .connectionState

                    );

                };


            peerConnection.oniceconnectionstatechange =
                () => {

                    console.log(

                        `ICE ${targetSocketId}:`,

                        peerConnection
                            .iceConnectionState

                    );

                };


            peerConnectionsRef.current[
                targetSocketId
            ] =
                peerConnection;


            return peerConnection;

        };


    // =====================================
    // ADD QUEUED ICE
    // =====================================

    const addPendingIceCandidates =
        async (
            targetSocketId,
            peerConnection
        ) => {

            const candidates =
                pendingIceCandidatesRef.current[
                    targetSocketId
                ] || [];


            for (
                const candidate
                of candidates
            ) {

                try {

                    await peerConnection
                        .addIceCandidate(

                            new RTCIceCandidate(
                                candidate
                            )

                        );

                } catch (error) {

                    console.error(

                        "Queued ICE error:",

                        error

                    );

                }

            }


            pendingIceCandidatesRef.current[
                targetSocketId
            ] = [];

        };


    // =====================================
    // CREATE OFFER
    // =====================================

    const createOffer =
        async (targetSocketId) => {

            try {

                console.log(

                    "Creating offer for:",

                    targetSocketId

                );


                const peerConnection =
                    createPeerConnection(

                        targetSocketId

                    );


                const offer =
                    await peerConnection
                        .createOffer();


                await peerConnection
                    .setLocalDescription(
                        offer
                    );


                socket.emit(

                    "webrtc-offer",

                    {

                        targetSocketId,

                        offer,

                    }

                );

            } catch (error) {

                console.error(

                    "Error creating offer:",

                    error

                );

            }

        };


    // =====================================
    // SOCKET EVENTS
    // =====================================

    useEffect(() => {

        const handleExistingUsers =
            (existingParticipants) => {

                console.log(

                    "Existing users:",

                    existingParticipants

                );


                /*
                    Remove duplicate socket IDs
                    before storing participants.
                */

                const uniqueParticipants =
                    existingParticipants.filter(

                        (
                            participant,
                            index,
                            array
                        ) =>

                            array.findIndex(
                                (item) =>
                                    item.socketId ===
                                    participant.socketId
                            ) === index

                    );


                setParticipants(
                    uniqueParticipants
                );


                uniqueParticipants.forEach(

                    (participant) => {

                        createOffer(

                            participant.socketId

                        );

                    }

                );

            };


        const handleNewUser =
            (participant) => {

                console.log(

                    "New user:",

                    participant

                );


                setParticipants(

                    (previousUsers) => {

                        const alreadyExists =
                            previousUsers.some(

                                (user) =>

                                    user.socketId ===
                                    participant.socketId

                            );


                        if (
                            alreadyExists
                        ) {

                            return previousUsers;

                        }


                        return [

                            ...previousUsers,

                            participant,

                        ];

                    }

                );

            };


        // =====================================
        // CAMERA
        // =====================================

        const handleParticipantCameraToggle =
            ({
                socketId,
                cameraOn,
            }) => {

                setParticipants(

                    (previousUsers) =>

                        previousUsers.map(

                            (participant) =>

                                participant.socketId ===
                                socketId

                                    ? {

                                        ...participant,

                                        cameraOn,

                                    }

                                    : participant

                        )

                );

            };


        // =====================================
        // MIC
        // =====================================

        const handleParticipantMicToggle =
            ({
                socketId,
                micOn,
            }) => {

                setParticipants(

                    (previousUsers) =>

                        previousUsers.map(

                            (participant) =>

                                participant.socketId ===
                                socketId

                                    ? {

                                        ...participant,

                                        micOn,

                                    }

                                    : participant

                        )

                );

            };


        // =====================================
        // OFFER
        // =====================================

        const handleOffer =
            async ({
                senderSocketId,
                offer,
            }) => {

                try {

                    console.log(

                        "Offer received from:",

                        senderSocketId

                    );


                    const peerConnection =
                        createPeerConnection(

                            senderSocketId

                        );


                    await peerConnection
                        .setRemoteDescription(

                            new RTCSessionDescription(
                                offer
                            )

                        );


                    await addPendingIceCandidates(

                        senderSocketId,

                        peerConnection

                    );


                    const answer =
                        await peerConnection
                            .createAnswer();


                    await peerConnection
                        .setLocalDescription(
                            answer
                        );


                    socket.emit(

                        "webrtc-answer",

                        {

                            targetSocketId:
                                senderSocketId,

                            answer,

                        }

                    );

                } catch (error) {

                    console.error(

                        "Offer error:",

                        error

                    );

                }

            };


        // =====================================
        // ANSWER
        // =====================================

        const handleAnswer =
            async ({
                senderSocketId,
                answer,
            }) => {

                try {

                    console.log(

                        "Answer received from:",

                        senderSocketId

                    );


                    const peerConnection =
                        peerConnectionsRef.current[
                            senderSocketId
                        ];


                    if (
                        !peerConnection
                    ) {

                        return;

                    }


                    await peerConnection
                        .setRemoteDescription(

                            new RTCSessionDescription(
                                answer
                            )

                        );


                    await addPendingIceCandidates(

                        senderSocketId,

                        peerConnection

                    );

                } catch (error) {

                    console.error(

                        "Answer error:",

                        error

                    );

                }

            };


        // =====================================
        // ICE
        // =====================================

        const handleIceCandidate =
            async ({
                senderSocketId,
                candidate,
            }) => {

                if (
                    !candidate
                ) {

                    return;

                }


                const peerConnection =
                    peerConnectionsRef.current[
                        senderSocketId
                    ];


                if (

                    !peerConnection ||

                    !peerConnection
                        .remoteDescription

                ) {

                    if (

                        !pendingIceCandidatesRef
                            .current[
                                senderSocketId
                            ]

                    ) {

                        pendingIceCandidatesRef
                            .current[
                                senderSocketId
                            ] = [];

                    }


                    pendingIceCandidatesRef
                        .current[
                            senderSocketId
                        ]
                        .push(
                            candidate
                        );

                    return;

                }


                try {

                    await peerConnection
                        .addIceCandidate(

                            new RTCIceCandidate(
                                candidate
                            )

                        );

                } catch (error) {

                    console.error(

                        "ICE error:",

                        error

                    );

                }

            };


        // =====================================
        // USER LEFT
        // =====================================

        const handleUserLeft =
            (userId) => {

                console.log(

                    "User left:",

                    userId

                );


                const peerConnection =
                    peerConnectionsRef.current[
                        userId
                    ];


                if (
                    peerConnection
                ) {

                    peerConnection.close();


                    delete peerConnectionsRef
                        .current[
                            userId
                        ];

                }


                delete pendingIceCandidatesRef
                    .current[
                        userId
                    ];


                setRemoteStreams(

                    (previousStreams) => {

                        const updatedStreams =
                            {
                                ...previousStreams,
                            };


                        delete updatedStreams[
                            userId
                        ];


                        return updatedStreams;

                    }

                );


                setParticipants(

                    (previousUsers) =>

                        previousUsers.filter(

                            (participant) =>

                                participant.socketId !==
                                userId

                        )

                );

            };


        socket.on(
            "existing-video-users",
            handleExistingUsers
        );


        socket.on(
            "new-video-user",
            handleNewUser
        );


        socket.on(
            "participant-camera-toggle",
            handleParticipantCameraToggle
        );


        socket.on(
            "participant-mic-toggle",
            handleParticipantMicToggle
        );


        socket.on(
            "webrtc-offer",
            handleOffer
        );


        socket.on(
            "webrtc-answer",
            handleAnswer
        );


        socket.on(
            "webrtc-ice-candidate",
            handleIceCandidate
        );


        socket.on(
            "video-user-left",
            handleUserLeft
        );


        return () => {

            socket.off(
                "existing-video-users",
                handleExistingUsers
            );


            socket.off(
                "new-video-user",
                handleNewUser
            );


            socket.off(
                "participant-camera-toggle",
                handleParticipantCameraToggle
            );


            socket.off(
                "participant-mic-toggle",
                handleParticipantMicToggle
            );


            socket.off(
                "webrtc-offer",
                handleOffer
            );


            socket.off(
                "webrtc-answer",
                handleAnswer
            );


            socket.off(
                "webrtc-ice-candidate",
                handleIceCandidate
            );


            socket.off(
                "video-user-left",
                handleUserLeft
            );

        };

    }, []);


    // =====================================
    // ATTACH LOCAL VIDEO
    // =====================================

    useEffect(() => {

        if (

            isInCall &&

            isCameraOn &&

            localVideoRef.current &&

            localStreamRef.current

        ) {

            localVideoRef.current.srcObject =
                localStreamRef.current;


            localVideoRef.current
                .play()
                .catch(
                    () => {}
                );

        }

    }, [
        isInCall,
        isCameraOn,
        isExpanded,
    ]);


    // =====================================
    // SYNC MEDIA
    // =====================================

    useEffect(() => {

        if (
            !localStreamRef.current
        ) {

            return;

        }


        localStreamRef.current
            .getAudioTracks()
            .forEach(

                (track) => {

                    track.enabled =
                        isMicOn;

                }

            );


        localStreamRef.current
            .getVideoTracks()
            .forEach(

                (track) => {

                    track.enabled =
                        isCameraOn;

                }

            );

    }, [
        isMicOn,
        isCameraOn,
    ]);


    // =====================================
    // JOIN CALL
    // =====================================

    const handleJoinCall =
        async () => {

            try {

                setMediaError(
                    null
                );


                const stream =
                    await navigator.mediaDevices
                        .getUserMedia({

                            video: true,

                            audio: true,

                        });


                localStreamRef.current =
                    stream;


                stream
                    .getAudioTracks()
                    .forEach(

                        (track) => {

                            track.enabled =
                                true;

                        }

                    );


                stream
                    .getVideoTracks()
                    .forEach(

                        (track) => {

                            track.enabled =
                                true;

                        }

                    );


                setIsMicOn(
                    true
                );


                setIsCameraOn(
                    true
                );


                setIsInCall(
                    true
                );


                socket.emit(

                    "join-video-room",

                    {

                        roomCode,

                        name:
                            userName || "User",

                    }

                );


                console.log(
                    "Joined video call"
                );

            } catch (error) {

                console.error(

                    "Media error:",

                    error

                );


                setMediaError(

                    "Unable to access camera or microphone. Please allow permission and try again."

                );

            }

        };


    // =====================================
    // TOGGLE MICROPHONE
    // =====================================

    const handleToggleMic =
        () => {

            if (
                !localStreamRef.current
            ) {

                return;

            }


            const audioTracks =
                localStreamRef.current
                    .getAudioTracks();


            if (
                audioTracks.length === 0
            ) {

                return;

            }


            const newMicState =
                !isMicOn;


            audioTracks.forEach(
                (track) => {

                    track.enabled =
                        newMicState;

                }
            );


            setIsMicOn(
                newMicState
            );


            socket.emit(

                "mic-toggle",

                {

                    roomCode,

                    micOn:
                        newMicState,

                }

            );

        };


    // =====================================
    // TOGGLE CAMERA
    // =====================================

    const handleToggleCamera =
        () => {

            if (
                !localStreamRef.current
            ) {

                return;

            }


            const videoTracks =
                localStreamRef.current
                    .getVideoTracks();


            if (
                videoTracks.length === 0
            ) {

                return;

            }


            const newCameraState =
                !isCameraOn;


            videoTracks.forEach(
                (track) => {

                    track.enabled =
                        newCameraState;

                }
            );


            setIsCameraOn(
                newCameraState
            );


            socket.emit(

                "camera-toggle",

                {

                    roomCode,

                    cameraOn:
                        newCameraState,

                }

            );

        };


    // =====================================
    // LEAVE CALL
    // =====================================

    const handleLeaveCall =
        () => {

            /*
                Tell server first so all
                other participants remove
                this user immediately.
            */

            socket.emit(

                "leave-video-room",

                roomCode

            );


            Object.values(

                peerConnectionsRef.current

            ).forEach(

                (peerConnection) => {

                    peerConnection.close();

                }

            );


            peerConnectionsRef.current =
                {};


            pendingIceCandidatesRef.current =
                {};


            if (
                localStreamRef.current
            ) {

                localStreamRef.current
                    .getTracks()
                    .forEach(

                        (track) =>
                            track.stop()

                    );


                localStreamRef.current =
                    null;

            }


            if (
                localVideoRef.current
            ) {

                localVideoRef.current.srcObject =
                    null;

            }


            setParticipants(
                []
            );


            setRemoteStreams(
                {}
            );


            setIsMicOn(
                true
            );


            setIsCameraOn(
                true
            );


            setIsInCall(
                false
            );


            setIsExpanded(
                false
            );

        };


    // =====================================
    // COMPONENT CLEANUP
    // =====================================

    useEffect(() => {

        return () => {

            /*
                IMPORTANT:

                If user leaves the Room page
                directly, tell the server that
                the socket left the video room.
            */

            if (socket.connected) {

                socket.emit(
                    "leave-video-room",
                    roomCode
                );

            }


            Object.values(

                peerConnectionsRef.current

            ).forEach(

                (peerConnection) => {

                    peerConnection.close();

                }

            );


            if (
                localStreamRef.current
            ) {

                localStreamRef.current
                    .getTracks()
                    .forEach(

                        (track) =>
                            track.stop()

                    );

            }

        };

    }, [roomCode]);


    // =====================================
    // ALL PARTICIPANTS
    // =====================================

    const allParticipants = [

        {
            socketId: "local-user",
            name:
                userName || "You",
            cameraOn:
                isCameraOn,
            micOn:
                isMicOn,
            isLocal:
                true,
        },

        ...participants.filter(

            (participant) =>

                participant.socketId !==
                "local-user"

        ).map(
            (participant) => ({

                ...participant,

                isLocal:
                    false,

            })
        ),

    ];


    // =====================================
    // NORMAL VIEW
    // =====================================

    const renderCompactParticipants =
        () => {

            if (!isInCall) {

                return (

                    <div
                        className="video-join-state"
                    >

                        <div
                            className="video-join-icon"
                        >
                            📹
                        </div>

                        <p>
                            Join the call
                        </p>

                        <span>
                            Practice together with your teammates
                        </span>

                        <button
                            className="join-call-btn"
                            onClick={
                                handleJoinCall
                            }
                        >
                            Join Call
                        </button>

                    </div>

                );

            }


            const visibleParticipants =
                allParticipants.slice(
                    0,
                    5
                );


            return (

                <>

                    <div
                        className="compact-video-list"
                    >

                        {visibleParticipants.map(

                            (participant) => (

                                <CompactParticipant

                                    key={
                                        participant.socketId
                                    }

                                    participant={
                                        participant
                                    }

                                    stream={

                                        participant.isLocal

                                            ? localStreamRef.current

                                            : remoteStreams[
                                                participant
                                                    .socketId
                                            ]

                                    }

                                />

                            )

                        )}

                    </div>


                    {allParticipants.length > 5 && (

                        <div
                            className="more-participants"
                        >

                            +{allParticipants.length - 5}
                            {" "}more

                        </div>

                    )}

                </>

            );

        };


    // =====================================
    // EXPANDED PARTICIPANTS
    // =====================================

    const renderExpandedParticipants =
        () => {

            return (

                <div
                    className="expanded-video-grid"
                >

                    {allParticipants.map(

                        (participant) => (

                            <ExpandedParticipant

                                key={
                                    participant.socketId
                                }

                                participant={
                                    participant
                                }

                                stream={

                                    participant.isLocal

                                        ? localStreamRef.current

                                        : remoteStreams[
                                            participant
                                                .socketId
                                        ]

                                }

                            />

                        )

                    )}

                </div>

            );

        };


    // =====================================
    // RENDER
    // =====================================

    return (

        <>

            <div
                className="video-call-panel"
            >

                <div
                    className="video-panel-header"
                >

                    <div>

                        <h3>
                            Participants
                        </h3>

                        <span>

                            {isInCall

                                ? `${allParticipants.length} in call`

                                : "Video call"

                            }

                        </span>

                    </div>


                    {isInCall && (

                        <button
                            className="expand-video-btn"
                            onClick={() =>
                                setIsExpanded(true)
                            }
                            title="Expand video call"
                        >
                            ⛶
                        </button>

                    )}

                </div>


                {mediaError && (

                    <div
                        className="media-error"
                    >
                        {mediaError}
                    </div>

                )}


                <div
                    className="video-panel-content"
                >

                    {renderCompactParticipants()}

                </div>


                {isInCall && (

                    <div
                        className="video-panel-controls"
                    >

                        <button
                            className={
                                isMicOn
                                    ? "media-control-btn"
                                    : "media-control-btn active"
                            }
                            onClick={
                                handleToggleMic
                            }
                            title={
                                isMicOn
                                    ? "Mute microphone"
                                    : "Unmute microphone"
                            }
                        >

                            {isMicOn
                                ? "🎤"
                                : "🔇"
                            }

                        </button>


                        <button
                            className={
                                isCameraOn
                                    ? "media-control-btn"
                                    : "media-control-btn active"
                            }
                            onClick={
                                handleToggleCamera
                            }
                            title={
                                isCameraOn
                                    ? "Turn camera off"
                                    : "Turn camera on"
                            }
                        >

                            {isCameraOn
                                ? "📹"
                                : "🚫"
                            }

                        </button>


                        <button
                            className="leave-call-btn"
                            onClick={
                                handleLeaveCall
                            }
                            title="Leave call"
                        >
                            📞
                        </button>

                    </div>

                )}

            </div>


            {isExpanded && (

                <div
                    className="expanded-video-overlay"
                >

                    <div
                        className="expanded-video-container"
                    >

                        <div
                            className="expanded-video-header"
                        >

                            <div>

                                <h2>
                                    Video Call
                                </h2>

                                <span>

                                    {allParticipants.length}
                                    {" "}participant
                                    {allParticipants.length !== 1
                                        ? "s"
                                        : ""}

                                </span>

                            </div>


                            <button
                                className="expanded-close-btn"
                                onClick={() =>
                                    setIsExpanded(false)
                                }
                            >
                                ✕
                            </button>

                        </div>


                        <div
                            className="expanded-video-content"
                        >

                            {renderExpandedParticipants()}

                        </div>


                        <div
                            className="expanded-video-controls"
                        >

                            <button
                                className={
                                    isMicOn
                                        ? "media-control-btn"
                                        : "media-control-btn active"
                                }
                                onClick={
                                    handleToggleMic
                                }
                            >

                                {isMicOn
                                    ? "🎤"
                                    : "🔇"
                                }

                            </button>


                            <button
                                className={
                                    isCameraOn
                                        ? "media-control-btn"
                                        : "media-control-btn active"
                                }
                                onClick={
                                    handleToggleCamera
                                }
                            >

                                {isCameraOn
                                    ? "📹"
                                    : "🚫"
                                }

                            </button>


                            <button
                                className="leave-call-btn"
                                onClick={
                                    handleLeaveCall
                                }
                            >

                                📞 Leave

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>

    );

}


// =====================================
// COMPACT PARTICIPANT
// =====================================

function CompactParticipant({
    participant,
    stream,
}) {

    const videoRef =
        useRef(null);


    useEffect(() => {

        if (

            videoRef.current &&

            stream &&

            participant.cameraOn

        ) {

            videoRef.current.srcObject =
                stream;


            videoRef.current
                .play()
                .catch(
                    () => {}
                );

        }

    }, [
        stream,
        participant.cameraOn,
    ]);


    return (

        <div
            className="compact-participant"
        >

            {stream &&
            participant.cameraOn ? (

                <video
                    ref={
                        videoRef
                    }
                    autoPlay
                    muted={
                        participant.isLocal
                    }
                    playsInline
                />

            ) : (

                <div
                    className="participant-placeholder"
                >

                    {getInitials(
                        participant.name
                    )}

                </div>

            )}


            <div
                className="compact-participant-info"
            >

                <span>

                    {participant.isLocal
                        ? "You"
                        : participant.name || "User"}

                </span>


                {!participant.micOn && (

                    <span>
                        🔇
                    </span>

                )}

            </div>

        </div>

    );

}


// =====================================
// EXPANDED PARTICIPANT
// =====================================

function ExpandedParticipant({
    participant,
    stream,
}) {

    const videoRef =
        useRef(null);


    useEffect(() => {

        if (

            videoRef.current &&

            stream &&

            participant.cameraOn

        ) {

            videoRef.current.srcObject =
                stream;


            videoRef.current
                .play()
                .catch(
                    () => {}
                );

        }

    }, [
        stream,
        participant.cameraOn,
    ]);


    return (

        <div
            className="expanded-participant"
        >

            {stream &&
            participant.cameraOn ? (

                <video
                    ref={
                        videoRef
                    }
                    autoPlay
                    muted={
                        participant.isLocal
                    }
                    playsInline
                />

            ) : (

                <div
                    className="expanded-placeholder"
                >

                    {getInitials(
                        participant.name
                    )}

                </div>

            )}


            <div
                className="expanded-participant-info"
            >

                <span>

                    {participant.isLocal
                        ? "You"
                        : participant.name || "User"}

                </span>


                {!participant.micOn && (

                    <span>
                        🔇
                    </span>

                )}

            </div>

        </div>

    );

}


// =====================================
// INITIALS
// =====================================

function getInitials(name) {

    if (
        !name
    ) {

        return "U";

    }


    const words =
        name
            .trim()
            .split(
                /\s+/
            );


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (

        words[0][0] +
        words[words.length - 1][0]

    ).toUpperCase();

}


export default VideoCall;