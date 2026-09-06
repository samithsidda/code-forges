import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import socket from "../socket/socket";
import api from "../api/axios";

import "../styles/Dashboard.css";


function Dashboard() {

    const navigate =
        useNavigate();


    const [user, setUser] =
        useState(null);


    const [rooms, setRooms] =
        useState([]);


    const [
        selectedRoom,
        setSelectedRoom
    ] = useState(null);


    const [
        showCreateForm,
        setShowCreateForm
    ] = useState(false);


    const [
        showJoinForm,
        setShowJoinForm
    ] = useState(false);


    const [loading, setLoading] =
        useState(false);


    const [message, setMessage] =
        useState("");


    const [
        createData,
        setCreateData
    ] = useState({

        name: "",

        topic: "",

        language: "Java",

    });


    const [joinCode, setJoinCode] =
        useState("");


    /*
        FETCH ROOMS
    */

    const fetchRooms = async () => {

        try {

            const token =
                localStorage.getItem(
                    "token"
                );


            const res =
                await api.get(

                    "/rooms",

                    {

                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                        },

                    }

                );


            setRooms(
                Array.isArray(res.data.rooms)
                    ? res.data.rooms
                    : []
            );


        } catch (err) {

            console.log(

                err.response?.data ||
                err.message

            );

        }

    };


    /*
        LOGOUT
    */

    const handleLogout = () => {

        const confirmLogout =
            window.confirm(

                "Are you sure you want to logout?"

            );


        if (!confirmLogout) {
            return;
        }


        /*
            Disconnect realtime connection.
        */

        socket.disconnect();


        /*
            Remove authentication data.
        */

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        navigate("/");

    };


    /*
        FETCH PROFILE + ROOMS
    */

    useEffect(() => {

        const token =
            localStorage.getItem(
                "token"
            );


        const fetchProfile =
            async () => {

                try {

                    const res =
                        await api.get(

                            "/users/profile",

                            {

                                headers: {

                                    Authorization:
                                        `Bearer ${token}`,

                                },

                            }

                        );


                    setUser(
                        res.data.user
                    );


                } catch (err) {

                    console.log(

                        err.response?.data ||
                        err.message

                    );

                }

            };


        fetchProfile();

        fetchRooms();

    }, []);


    /*
        CREATE ROOM INPUT CHANGE
    */

    const handleCreateChange =
        (e) => {

            const {
                name,
                value,
                type,
                checked,
            } = e.target;


            setCreateData({

                ...createData,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value,

            });

        };


    /*
        CREATE ROOM
    */

    const handleCreateRoom =
        async (e) => {

            e.preventDefault();


            try {

                setLoading(true);

                setMessage("");


                const token =
                    localStorage.getItem(
                        "token"
                    );


                const res =
                    await api.post(

                        "/rooms",

                        createData,

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${token}`,

                            },

                        }

                    );


                const createdRoom =
                    res.data.room;


                navigate(

                    `/room/${createdRoom.roomCode}`

                );


            } catch (err) {

                setMessage(

                    err.response?.data?.message ||

                    "Failed to create room"

                );

            } finally {

                setLoading(false);

            }

        };


    /*
        JOIN ROOM
    */

    const handleJoinRoom =
        async (e) => {

            e.preventDefault();


            try {

                setLoading(true);

                setMessage("");


                const token =
                    localStorage.getItem(
                        "token"
                    );


                const res =
                    await api.post(

                        "/rooms/join",

                        {

                            roomCode:
                                joinCode
                                    .trim()
                                    .toUpperCase(),

                        },

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${token}`,

                            },

                        }

                    );


                navigate(

                    `/room/${res.data.room.roomCode}`

                );


            } catch (err) {

                setMessage(

                    err.response?.data?.message ||

                    "Failed to join room"

                );

            } finally {

                setLoading(false);

            }

        };


    /*
        DELETE ROOM
    */

    const handleDeleteRoom =
        async (
            roomId,
            roomName
        ) => {

            const confirmDelete =
                window.confirm(

                    `Are you sure you want to delete "${roomName}"? This action cannot be undone.`

                );


            if (!confirmDelete) {
                return;
            }


            try {

                const token =
                    localStorage.getItem(
                        "token"
                    );


                await api.delete(

                    `/rooms/${roomId}`,

                    {

                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                        },

                    }

                );


                setSelectedRoom(
                    null
                );


                await fetchRooms();


            } catch (err) {

                console.error(

                    err.response?.data ||
                    err.message

                );


                alert(

                    err.response?.data?.message ||

                    "Failed to delete room"

                );

            }

        };


    return (

        <div className="dashboard">


            {/* ================================
                HEADER
            ================================= */}

            <div className="dashboard-header">

                <h1>

                    {user

                        ? `Welcome, ${user.name}`

                        : "Loading..."

                    }

                </h1>


                <button

                    className="logout-btn"

                    onClick={
                        handleLogout
                    }

                >

                    Logout

                </button>

            </div>


            {/* ================================
                ROOM ACTIONS
            ================================= */}

            <div className="room-actions">


                <button

                    className="create-room-btn"

                    onClick={() => {

                        setShowCreateForm(

                            !showCreateForm

                        );

                        setShowJoinForm(false);

                        setMessage("");

                    }}

                >

                    + Create Room

                </button>


                <button

                    className="join-room-btn"

                    onClick={() => {

                        setShowJoinForm(

                            !showJoinForm

                        );

                        setShowCreateForm(false);

                        setMessage("");

                    }}

                >

                    Join Room

                </button>


            </div>


            {/* ================================
                CREATE ROOM FORM
            ================================= */}

            {showCreateForm && (

                <form

                    className="room-form"

                    onSubmit={
                        handleCreateRoom
                    }

                >

                    <h2>
                        Create Room
                    </h2>


                    <input

                        type="text"

                        name="name"

                        placeholder="Room Name"

                        value={
                            createData.name
                        }

                        onChange={
                            handleCreateChange
                        }

                        required

                    />


                    <textarea

                        name="topic"

                        placeholder="Topic (e.g. Linked List)"

                        value={
                            createData.topic
                        }

                        onChange={
                            handleCreateChange
                        }

                    />


                    <select

                        name="language"

                        value={
                            createData.language
                        }

                        onChange={
                            handleCreateChange
                        }

                    >

                        <option value="Java">
                            Java
                        </option>

                        <option value="Python">
                            Python
                        </option>

                        <option value="C++">
                            C++
                        </option>

                        <option value="JavaScript">
                            JavaScript
                        </option>

                    </select>
                    
                    <button

                        type="submit"

                        disabled={
                            loading
                        }

                    >

                        {loading

                            ? "Creating..."

                            : "Create Room"

                        }

                    </button>


                </form>

            )}


            {/* ================================
                JOIN ROOM FORM
            ================================= */}

            {showJoinForm && (

                <form

                    className="room-form"

                    onSubmit={
                        handleJoinRoom
                    }

                >

                    <h2>
                        Join Room
                    </h2>


                    <input

                        type="text"

                        placeholder="Enter Room Code"

                        value={
                            joinCode
                        }

                        onChange={
                            (e) =>
                                setJoinCode(
                                    e.target.value
                                )
                        }

                        required

                    />


                    <button

                        type="submit"

                        disabled={
                            loading
                        }

                    >

                        {loading

                            ? "Joining..."

                            : "Join Room"

                        }

                    </button>


                </form>

            )}


            {/* ================================
                MESSAGE
            ================================= */}

            {message && (

                <p className="room-message">

                    {message}

                </p>

            )}


            {/* ================================
                MY ROOMS
            ================================= */}

            <h2 className="section-title">

                My Rooms

            </h2>


            <div className="rooms-container">

                {rooms.length === 0 ? (

                    <p>
                        No rooms found.
                    </p>

                ) : (

                    rooms.map(

                        (member) => (

                            <div

                                key={
                                    member.room._id
                                }

                                className="room-card"

                            >

                                <div

                                    className="room-header"

                                    onClick={() =>
                                        setSelectedRoom(

                                            selectedRoom ===
                                            member.room._id

                                                ? null

                                                : member.room._id

                                        )
                                    }

                                >

                                    <span>

                                        {selectedRoom ===
                                        member.room._id

                                            ? "▼"

                                            : "▶"

                                        }

                                    </span>


                                    <h3>

                                        {
                                            member.room.name
                                        }

                                    </h3>


                                </div>


                                {selectedRoom ===
                                    member.room._id && (

                                    <div className="room-details">


                                        <p>

                                            <strong>
                                                Topic:
                                            </strong>{" "}

                                            {
                                                member.room.topic ||
                                                "No topic"
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Language:
                                            </strong>{" "}

                                            {
                                                member.room.language ||
                                                "Java"
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Mode:
                                            </strong>{" "}

                                            {
                                                member.room.mode ||
                                                "Collaboration"
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Room Code:
                                            </strong>{" "}

                                            {
                                                member.room.roomCode
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Status:
                                            </strong>{" "}

                                            {
                                                member.room.status
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Your Role:
                                            </strong>{" "}

                                            {
                                                member.role
                                            }

                                        </p>


                                        <div className="room-card-actions">


                                            <button

                                                className="enter-btn"

                                                onClick={() =>
                                                    navigate(

                                                        `/room/${member.room.roomCode}`

                                                    )
                                                }

                                            >

                                                Enter Room

                                            </button>


                                            {member.role ===
                                                "owner" && (

                                                <button

                                                    className="delete-room-btn"

                                                    onClick={() =>
                                                        handleDeleteRoom(

                                                            member.room._id,

                                                            member.room.name

                                                        )
                                                    }

                                                >

                                                    Delete Room

                                                </button>

                                            )}


                                        </div>


                                    </div>

                                )}


                            </div>

                        )

                    )

                )}

            </div>


        </div>

    );

}


export default Dashboard;