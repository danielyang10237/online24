import React, { useState, useEffect, useRef } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Card, Avatar, Input, Typography } from "antd";

const { Search } = Input;

const Chat = () => {
  const [messages, setMessages] = useState([]);

  return (
    <div>
      <h1>Chat</h1>
    </div>
  );
};

export default Chat;
