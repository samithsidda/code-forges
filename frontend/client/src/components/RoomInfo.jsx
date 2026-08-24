function RoomInfo({ room }) {
    return (
    <div className="panel-card">

        <h2>Room Information</h2>

        <p><strong>Description:</strong> {room.description}</p>

        <p><strong>Language:</strong> {room.language}</p>

        <p><strong>Room Code:</strong> {room.roomCode}</p>

        <p><strong>Owner:</strong> {room.owner.name}</p>

    </div>
);
}

export default RoomInfo;