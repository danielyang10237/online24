import { React, useState, useEffect } from "react";
import NumberWheel from "./NumberWheel.jsx";
import TimerBar from "./TimerBar.jsx";
import "../css/gameConsole.css";
import "../css/numberWheel.css";

let clientRef = null;
let clientID = null;

const GameConsole = (props) => {
  const [startGameButton, setStartGameButton] = useState(false);
  const [gameStartCount, setGameStartCount] = useState(-1);

  const [roundNumber, setRoundNumber] = useState(0);

  const [roundUserScores, setRoundUserScores] = useState([]);
  const [numbers, setNumbers] = useState([]);

  const [timeLeft, setTimeLeft] = useState(50000);

  useEffect(() => {
    clientID = props.userID;

    if (clientRef !== props.connectionClient) {
      clientRef = props.connectionClient;

      console.log("WebSocket connection established in GameConsole");

      clientRef.onmessage = (message) => {
        const dataFromServer = JSON.parse(message.data);

        // console.log("got message from server GameConsole: ", dataFromServer);

        switch (dataFromServer.type) {
          case "message":
            // console.log(
            //   "got message from server GameConsole: ",
            //   dataFromServer
            // );
            props.updateMessages({
              user: dataFromServer.user,
              message: dataFromServer.message,
            });
            break;
          case "getting-players":
            // console.log("got players", dataFromServer.players);
            props.updatePlayers(dataFromServer.players);
            break;
          case "can-start-game":
            setRoundNumber(dataFromServer.totalRounds);
            setStartGameButton(true);
            break;
          case "game-starting":
            // console.log("game starting", dataFromServer.countdown);
            setGameStartCount(dataFromServer.countdown);
            break;
          case "new-round":
            setRoundUserScores([]);
            setNumbers(dataFromServer.numbers);
            setGameStartCount(-2);
            break;
          case "round-over":
            setGameStartCount(-3);
            props.updateScores(dataFromServer.points);
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
          case "user-disconnected":
            console.log("user disconnected", dataFromServer.user);
            break;
          case "round-count-changed":
            setRoundNumber(dataFromServer.roundCount);
            break;
          case "time-update":
            setTimeLeft(dataFromServer.timeLeft);
            console.log("time left", dataFromServer.timeLeft);
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

  const startGame = () => {
    const serverPackage = {
      type: "start-game",
      id: clientID,
      msg: "start game",
    };
    clientRef.send(JSON.stringify(serverPackage));
  };

  const changeRoundCount = (roundCount) => {
    const serverPackage = {
      type: "change-round-count",
      id: clientID,
      roundCount: roundCount,
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
    <div className="center-elements">
      {gameStartCount === -1 ? (
        startGameButton ? (
          <>
            <div className="choosing-round-count">
              <button
                className={`round-count-button ${
                  roundNumber === 3 ? "round-select" : ""
                }`}
                onClick={() => {
                  changeRoundCount(3);
                }}
              >
                3 Rounds
              </button>
              <button
                className={`round-count-button ${
                  roundNumber === 5 ? "round-select" : ""
                }`}
                onClick={() => {
                  changeRoundCount(5);
                }}
              >
                5 Rounds
              </button>
              <button
                className={`round-count-button ${
                  roundNumber === 10 ? "round-select" : ""
                }`}
                onClick={() => {
                  changeRoundCount(10);
                }}
              >
                10 Rounds
              </button>
            </div>
            <button className="start-game-button" onClick={() => startGame()}>
              Start Game
            </button>
          </>
        ) : (
          <>
            <button disabled>Start Game</button>
            <p className="more-players-needed">Need at least two players to start</p>
          </>
        )
      ) : gameStartCount >= 0 ? (
        <p className="starting-game-message">
          Starting game in {gameStartCount}
        </p>
      ) : gameStartCount === -2 ? (
        <>
          <TimerBar timeLeft={timeLeft} />
          <NumberWheel numbers={numbers} isWin={foundSolution} />
        </>
      ) : (
        <>
          <p className="congrats-message">Congrats.. Waiting for next round!</p>
          <h3 className="scores-from-round">Scores from this round</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {roundUserScores.map((userScore, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{userScore.user}</td>
                  <td>{userScore.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default GameConsole;
