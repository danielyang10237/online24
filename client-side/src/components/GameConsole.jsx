import { React, useState, useEffect, useRef } from "react";
import { w3cwebsocket as W3CWebSocket, client, server } from "websocket";
import { Card, Avatar, Input, Typography } from "antd";
import NumberWheel from "./NumberWheel.jsx";
import KeyValueList from "./KeyValueList.jsx";

let clientRef = null;
let clientID = null;

const { Search } = Input;

const GameConsole = (props) => {
  const [totalUserScores, setTotalUserScores] = useState({});

  const [startGameButton, setStartGameButton] = useState(false);
  const [gameStartCount, setGameStartCount] = useState(-1);

  const [roundUserScores, setRoundUserScores] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    clientID = props.userID;

    if (clientRef != props.connectionClient) {
      clientRef = props.connectionClient;

      console.log("WebSocket connection established in GameConsole");

      clientRef.onmessage = (message) => {
        const dataFromServer = JSON.parse(message.data);

        switch (dataFromServer.type) {
          case "message":
            // console.log(
            //   "got message from server GameConsole: ",
            //   dataFromServer
            // );
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                user: dataFromServer.user,
                msg: dataFromServer.message,
              },
            ]);
            break;
          case "getting-players":
            props.updatePlayers(dataFromServer.players);
            break;
          case "can-start-game":
            setStartGameButton(true);
            break;
          case "game-starting":
            console.log("game starting", dataFromServer.countdown);
            setGameStartCount(dataFromServer.countdown);
            break;
          case "new-round":
            setRoundUserScores([]);
            setNumbers(dataFromServer.numbers);
            setGameStartCount(-2);
            break;
          case "round-over":
            setGameStartCount(-3);
            console.log("round over", dataFromServer.points);
            setTotalUserScores(dataFromServer.points);
            break;
          case "user-found-solution":
            setRoundUserScores((prevScores) => [
              ...prevScores,
              {
                user: dataFromServer.user,
                points: dataFromServer.points,
              },
            ]);
            break;
          case "game-over":
            clientRef = null;
            props.gameOver(dataFromServer.points);
            break;
          case "lack-of-players":
            setStartGameButton(false);
            break;
          default:
            console.log("registered unknown message type", dataFromServer.type);
            break;
        }
      };

      clientRef.send(
        JSON.stringify({
          type: "check-start-game",
          id: clientID,
        })
      );
    }
  }, [props.connectionClient]);

  const sendMessage = (message) => {
    const serverPackage = {
      type: "message",
      username: clientID,
      msg: message,
    };
    clientRef.send(JSON.stringify(serverPackage));
  };

  const startGame = () => {
    const serverPackage = {
      type: "start-game",
      id: clientID,
      msg: "start game",
    };
    clientRef.send(JSON.stringify(serverPackage));
  };

  const foundSolution = () => {
    // console.log("clientID in client", clientID);
    const serverPackage = {
      type: "found-solution",
      username: clientID,
      msg: "found solution",
    };
    clientRef.send(JSON.stringify(serverPackage));
    setGameStartCount(-3);
  };

  return (
    <div>
      <h1>Game Console</h1>
      <h2>Total Points</h2>
      <KeyValueList data={totalUserScores} />
      <h2>Game</h2>
      {gameStartCount === -1 ? (
        startGameButton ? (
          <button onClick={() => startGame()}>Start Game</button>
        ) : (
          <button disabled>Start Game</button>
        )
      ) : gameStartCount >= 0 ? (
        <p>Starting game in {gameStartCount}</p>
      ) : gameStartCount === -2 ? (
        <NumberWheel numbers={numbers} isWin={foundSolution} />
      ) : (
        <>
          <p>Congrats.. Waiting for next round!</p>
          <h3>Scores from this round</h3>
          <ul>
            {roundUserScores.map((userScore, index) => (
              <li key={index}>
                {userScore.user} - {userScore.points}
              </li>
            ))}
          </ul>
        </>
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
