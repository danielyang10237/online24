import React from "react";
import "../css/TimerBar.css";

let totalTime = 50000;

const TimerBar = ({ timeLeft }) => {
  // Calculate width percentage of the inner bar
  const widthPercentage = (timeLeft / totalTime) * 100;

  return (
    <div className="timer-bar-container">
      <div
        className="timer-bar-inner"
        style={{ width: `${widthPercentage}%` }}
      ></div>
    </div>
  );
};

export default TimerBar;
