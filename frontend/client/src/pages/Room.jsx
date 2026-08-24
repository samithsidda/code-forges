import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import LeftPanel from "../components/LeftPanel";
import MembersHover from "../components/MembersHover";
import CodeEditor from "../components/CodeEditor";
import Console from "../components/Console";
import "../styles/Room.css";

function Room() {
    const { roomCode } = useParams();

    const [room, setRoom] = useState(null);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await api.get(`/rooms/${roomCode}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setRoom(res.data.room);
                setMembers(res.data.members);
            } catch (err) {
                console.log(err.response?.data || err.message);
            }
        };

        fetchRoom();
    }, [roomCode]);

    if (!room) {
        return <h2>Loading...</h2>;
    }

    return (
    <div className="code-room-container">

        <header className="code-room-header">

            <h1>{room.name}</h1>

            <MembersHover members={members} />

        </header>

        <main className="code-room-main">

            <LeftPanel room={room} />

            <CodeEditor />

        </main>

        <Console />

    </div>
);
}

export default Room;