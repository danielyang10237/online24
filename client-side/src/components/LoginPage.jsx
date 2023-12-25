import { React, useState, useEffect, useRef } from "react";
import { w3cwebsocket as W3CWebSocket, client, server } from "websocket";
import { Card, Avatar, Input, Typography } from "antd";

const { Search } = Input;
let clientRef = null;
let clientID = null;

const LoginPage = (props) => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);

  clientID = props.userID;

  useEffect(() => {
    if (
      props.connectionClient.current &&
      props.connectionClient.current.readyState === W3CWebSocket.OPEN &&
      clientRef != props.connectionClient.current
    ) {
      clientRef = props.connectionClient.current;
      console.log("WebSocket connection established");

      clientRef.onmessage = (message) => {
        const dataFromServer = JSON.parse(message.data);

        if (dataFromServer.type === "message") {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              user: dataFromServer.user,
              msg: dataFromServer.msg,
            },
          ]);
        } else if (dataFromServer.type === "getting-players") {
          console.log("got player list! ", dataFromServer.players);
          setPlayers(dataFromServer.players);
        }
      };

      // Send message to the server to get player list
      clientRef.send(
        JSON.stringify({ type: "retrieve-players", id: clientID, msg: "render successful" })
      ); 
    }
  }, [props.connectionClient]);

  const setNewUser = (user) => {
    const serverPackage = {
      type: "new-player",
      user: user
    };
    clientRef.send(JSON.stringify(serverPackage));
  };

  return (
    <div>
      <h1>Login Page</h1>
      {players.map((player, index) => (
        <p key={index}>{player}</p>
      ))}
      {isLoggedIn ? (
        <div>
          {/* <Search
            placeholder="input message and send"
            enterButton="Send"
            size="large"
            onSearch={(value) => onButtonClicked(value)}
          /> */}
          <ul>
            {messages.map((message, index) => (
              <li key={index}>
                {message.user}
                <p>{message.msg}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Search
          placeholder="Enter your username"
          enterButton="Login"
          size="large"
          onSearch={(value) => {
            setNewUser(value);
          }}
        />
      )}
    </div>
  );
};

export default LoginPage;
