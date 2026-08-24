import "./../styles/LeftPanel.css";
import RoomInfo from "./RoomInfo";
import ProblemPanel from "./ProblemPanel";

function LeftPanel({ room }) {
    return (
        <div className="left-panel">

            <RoomInfo room={room}/>

            <ProblemPanel problem={room.problem}/>

        </div>
    );
}

export default LeftPanel;