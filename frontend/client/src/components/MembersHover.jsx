import { useState } from "react";
import "../styles/MembersHover.css";

function MembersHover({ members }) {

    const [open, setOpen] = useState(false);

    return (
        <div className="members-container">

            <button
                className="members-btn"
                onClick={() => setOpen(!open)}
            >
                👥 Members ({members.length})
            </button>

            {open && (

                <div className="members-popup">

                    {members.map((member) => (

                        <div
                            key={member._id}
                            className="member-item"
                        >

                            <span>

                                {" "}

                                {member.user.name}

                            </span>

                            <span className="member-role">

                                {member.role}

                            </span>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default MembersHover;