import React, { useState } from "react";
import "../css/leaderboard.css";

const LeaderboardModal = ({ leaderboardMap }) => {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
  };

  // Sort the array by score in descending order
  const sortedUsers = leaderboardMap.sort((a, b) => b.points - a.points);

  return (
    <>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
              <h2>Leaderboard</h2>
              <ul className="leaderboard">
                {sortedUsers.map((userData, index) => (
                  <li key={index} className={`user-score rank-${index + 1}`}>
                    <span className="username">{userData.name}</span>{" "}
                    <span className="score">{userData.points}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="closeLeaderboard" onClick={closeModal}>Close</button>
        </div>
      )}
    </>
  );
};

export default LeaderboardModal;
