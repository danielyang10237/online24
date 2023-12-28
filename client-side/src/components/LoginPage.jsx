import { React, useState, useEffect, useRef } from "react";
import { w3cwebsocket as W3CWebSocket, client, server } from "websocket";
import { Card, Avatar, Input, Typography } from "antd";
import GameConsole from "./GameConsole.jsx";

const { Search } = Input;
let clientRef = null;
let clientID = null;

const LoginPage = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [players, setPlayers] = useState([]);

  const [usedName, setUsedName] = useState(false);

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

        if (dataFromServer.type === "getting-players") {
          setPlayers(dataFromServer.players);
        } else if (dataFromServer.type === "username-taken") {
          setUsedName(true);
        } else if (dataFromServer.type === "username-confirmed") {
          setIsLoggedIn(true);
          setUsedName(false);
        } else {
          console.log(
            "registered unknown message type in LoginPage",
            dataFromServer.type
          );
        }
      };

      // Send message to the server to get player list
      clientRef.send(
        JSON.stringify({
          type: "retrieve-players",
          id: clientID,
          msg: "render successful",
        })
      );
    }
  }, [props.connectionClient]);

  const setNewUser = (user) => {
    const serverPackage = {
      type: "new-player",
      user: user,
      id: clientID,
    };
    clientRef.send(JSON.stringify(serverPackage));
  };

  const updatePlayers = (players) => {
    if (players != null) {
      setPlayers(players);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      {usedName ? <p>Username already taken</p> : null}
      <h2>Active Players</h2>
      {players.map((player, index) => (
        <p key={index}>{player}</p>
      ))}
      {isLoggedIn ? (
        <div>
          <GameConsole
            updatePlayers={updatePlayers}
            connectionClient={clientRef}
            userID={clientID}
          />
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
