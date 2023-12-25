import React, { useState, useEffect, useRef } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Card, Avatar, Input, Typography } from "antd";
import DashBoard from "./components/DashBoard.jsx";

function App() {

  return (
    <div className="App">
      <DashBoard />
    </div>
  );
}

export default App;
