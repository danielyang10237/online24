import { React, useState, useEffect, useRef } from "react";
import { w3cwebsocket as W3CWebSocket, client, server } from "websocket";
import { Card, Avatar, Input, Typography } from "antd";

let clientRef = null;
let clientID = null;

const { Search } = Input;

const GameConsole = (props) => {
    const [messages, setMessages] = useState([]);
    const [startGameButton, setStartGameButton] = useState(false);

  useEffect(() => {
    clientID = props.userID;

    if (clientRef != props.connectionClient) {
      clientRef = props.connectionClient;
      clientRef.send(
        JSON.stringify({
          type: "retrieve-players",
          id: clientID,
          msg: "render successful",
        })
      );

      console.log("WebSocket connection established in GameConsole");

      clientRef.onmessage = (message) => {
        const dataFromServer = JSON.parse(message.data);

        if (dataFromServer.type === "message") {
            console.log("got message from server LoginPage: ", dataFromServer)
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                user: dataFromServer.user,
                msg: dataFromServer.message,
              },
            ]);
        } else if (dataFromServer.type === "getting-players") {
          props.updatePlayers(dataFromServer.players);
        } else if (dataFromServer.type === "can-start-game") {
            setStartGameButton(true);
        }
      };
    }
  }, [props.connectionClient]);

  const sendMessage = (message) => {
    const serverPackage = {
      type: "message",
      id: clientID,
      msg: message,
    };
    clientRef.send(JSON.stringify(serverPackage));
  }

  const startGame = () => {
    const serverPackage = {
      type: "start-game",
      id: clientID,
      msg: "start game",
    };
    clientRef.send(JSON.stringify(serverPackage));
  }

  return (
    <div>
      <h1>Game Console</h1>
      <h2>Game</h2>
      {startGameButton ? (
        <button onClick={() => startGame()}>Start Game</button>
      ) : (
        <button disabled>Start Game</button>
      )}
      <h2>Chat</h2>
      <Search
        placeholder="input message and send"
        enterButton="Send"
        size="large"
        onSearch={(value) => sendMessage(value)}
      />
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            {message.user}
            <p>{message.msg}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameConsole;
