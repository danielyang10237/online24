import React, { useState } from 'react';

const LeaderboardModal = ({ leaderboardMap }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const sortedUsers = Object.entries(leaderboardMap)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Sort by score in descending order
    .map(([user, score]) => ({ user, score }));

  return (
    <div>
      <button onClick={openModal}>Open Leaderboard</button>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={closeModal}>Close</button>
            <h2>Leaderboard</h2>
            <ul>
              {sortedUsers.map((userData, index) => (
                <li key={index}>
                  <span>{userData.user}</span> - <span>{userData.score}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardModal;
