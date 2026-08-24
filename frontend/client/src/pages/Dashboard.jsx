import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Dashboard.css"

function Dashboard() {
    const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.user);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRooms(res.data.rooms);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    fetchProfile();
    fetchRooms();
  }, []);

  return (
    <div className="dashboard">

      <h1>
        {user ? `Welcome, ${user.name}` : "Loading..."}
      </h1>

      <h2 className="section-title">
        My Rooms
      </h2>

      <div className="rooms-container">

        {rooms.length === 0 ? (
          <p>No rooms found.</p>
        ) : (
          rooms.map((member) => (
            <div
              key={member.room._id}
              className="room-card"
            >

              <div
                className="room-header"
                onClick={() =>
                  setSelectedRoom(
                    selectedRoom === member.room._id
                      ? null
                      : member.room._id
                  )
                }
              >

                <span>
                  {selectedRoom === member.room._id ? "▼" : "▶"}
                </span>

                <h3>{member.room.name}</h3>

              </div>

              {selectedRoom === member.room._id && (

                <div className="room-details">

                  <p>
                    <strong>Description:</strong>{" "}
                    {member.room.description}
                  </p>

                  <p>
                    <strong>Language:</strong>{" "}
                    {member.room.language}
                  </p>

                  <p>
                    <strong>Mode:</strong>{" "}
                    {member.room.mode}
                  </p>

                  <p>
                    <strong>Room Code:</strong>{" "}
                    {member.room.roomCode}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {member.room.status}
                  </p>

                  <p>
                    <strong>Your Role:</strong>{" "}
                    {member.role}
                  </p>

                  <button className="enter-btn" onClick={() => navigate(`/room/${member.room.roomCode}`)}>
                    Enter Room
                  </button>

                </div>

              )}

            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default Dashboard;