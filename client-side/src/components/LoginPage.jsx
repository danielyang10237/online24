import { React, useState, useEffect, useRef } from "react";
import { w3cwebsocket as W3CWebSocket, client, server } from "websocket";
import { Card, Avatar, Input, Typography } from "antd";
import GameConsole from "./GameConsole.jsx";
import KeyValueList from "./KeyValueList.jsx";
import LeaderboardModal from "./LeaderboardModal.jsx";

const { Search } = Input;
let clientRef = null;

const LoginPage = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usedName, setUsedName] = useState(false);

  const [players, setPlayers] = useState([]);

  const [leaderboard, setLeaderboard] = useState(null);
  const [gameInProgress, setGameInProgress] = useState(null);
  const [username, setUsername] = useState(null);

  const gameOver = (props) => {
    setLeaderboard(props);
    // console.log("game over LoginPage", leaderboard, props);
    setIsLoggedIn(false);
    setUpServerRecieve();
    // setIsReadyButton(false);
  };

  const setUpServerRecieve = () => {
    clientRef.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);

      if (dataFromServer.type === "getting-players") {
        // update the current player list
        console.log("got players", dataFromServer.players);
        setPlayers(dataFromServer.players);
      } else if (dataFromServer.type === "username-taken") {
        // lets the user know the username was already taken
        setUsedName(true);
      } else if (dataFromServer.type === "game-in-progress") {
        setGameInProgress(dataFromServer.round);
        console.log("game in progress", dataFromServer.round);
      } else if (dataFromServer.type === "username-confirmed") {
        setGameInProgress(null);
        setIsLoggedIn(true);
        setUsedName(false);
        setLeaderboard(null);
      } else if (dataFromServer.type === "user-disconnected") {
        console.log("user disconnected", dataFromServer.user);
      } else {
        console.log(
          "registered unknown message type in LoginPage",
          dataFromServer.type
        );
      }
    };
  };

  useEffect(() => {
    if (
      props.connectionClient.current &&
      props.connectionClient.current.readyState === W3CWebSocket.OPEN &&
      clientRef != props.connectionClient.current
    ) {
      clientRef = props.connectionClient.current;
      console.log("WebSocket connection established");
      setUsername(props.clientID);

      setUpServerRecieve();

      // Send message to the server to get player list
      clientRef.send(
        JSON.stringify({
          type: "retrieve-players",
        })
      );
    }
  }, [props.connectionClient]);

  const setNewUser = (user) => {
    // console.log("LoginPage User set to ", username);

    const serverPackage = {
      type: "new-player",
      user: user,
      id: props.clientID,
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
      {leaderboard ? <LeaderboardModal leaderboardMap={leaderboard} /> : null}
      <h1>Login Page</h1>
      {usedName ? <p>Username already taken</p> : null}
      {gameInProgress ? (
        <p>Game in progress, currently round {gameInProgress}</p>
      ) : null}
      <h2>Active Players</h2>
      {players.map((player, index) => (
        <p key={index}>{player}</p>
      ))}
      {isLoggedIn ? (
        <div>
          <GameConsole
            updatePlayers={updatePlayers}
            connectionClient={clientRef}
            userID={username}
            gameOver={gameOver}
          />
        </div>
      ) : (
        <>
          {leaderboard ? <KeyValueList data={leaderboard} /> : null}
          <Search
            placeholder="Enter your username"
            enterButton="Login"
            size="large"
            onSearch={(value) => {
              setNewUser(value);
            }}
          />
        </>
      )}
    </div>
  );
};

export default LoginPage;
