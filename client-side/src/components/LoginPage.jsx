import { React, useState, useEffect } from "react";
// import bootstrap
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Input, message } from "antd";
import GameConsole from "./GameConsole.jsx";
import LeaderboardModal from "./LeaderboardModal.jsx";
import "../css/loginPage.css";

const { Search } = Input;
let clientRef = null;

const LoginPage = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messageToUser, setMessageToUser] = useState(null);

  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);

  const [userMessage, setUserMessage] = useState("");

  const [leaderboard, setLeaderboard] = useState(null);
  const [username, setUsername] = useState(null);
  const [usernameNotID, setUsernameNotID] = useState(null);

  const updateMessages = (messages) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        key: messages.user,
        user: messages.user,
        msg: messages.message,
      },
    ]);
  };

  // updates the scores for the users
  const updateScores = (scores) => {
    setPlayers(scores);
  };

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

      // console.log("got message from server LoginPage: ", dataFromServer);

      if (dataFromServer.type === "getting-players") {
        // update the current player list
        // console.log("got players", dataFromServer.players);
        updatePlayers(dataFromServer.players);
      } else if (dataFromServer.type === "username-taken") {
        // lets the user know the username was already taken
        setMessageToUser("Username already taken");
      } else if (dataFromServer.type === "game-in-progress") {
        setMessageToUser("Game in progress, currently round " + dataFromServer.round);
        // console.log("game in progress", dataFromServer.round);
      } else if (dataFromServer.type === "username-confirmed") {
        setIsLoggedIn(true);
        setMessageToUser(null);
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
      clientRef !== props.connectionClient.current
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
    if (user === "" || user === "guest") {
      message.error("Please enter a username");
      return;
    } else {
      setMessageToUser(null);
    }


    // console.log("LoginPage User set to ", username);
    setUsernameNotID(user);

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
      // console.log("updated players", players);
    }
  };

  const sendMessage = (message) => {
    const serverPackage = {
      type: "message",
      username: username,
      msg: message,
    };
    clientRef.send(JSON.stringify(serverPackage));
    setUserMessage("");
  };

  const handleInputChange = (event) => {
    setUserMessage(event.target.value);
  };

  const handleSendClick = () => {
    sendMessage(userMessage);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendClick();
    }
  };

  return (
    <>
      <div className="no-border col-md-12 row row-cols-1 row-cols-sm-1 rows-cols-md-2 row-cols-lg-2">
        <div className="login-side center-horizontal col-lg-8 col-md-8 col-sm-12">
          <h1 className="online24-title">Online 24</h1>
          {messageToUser ? messageToUser : null}
          {isLoggedIn ? (
            <div className="center-horizontal">
              <GameConsole
                updatePlayers={updatePlayers}
                connectionClient={clientRef}
                userID={username}
                gameOver={gameOver}
                updateMessages={updateMessages}
                updateScores={updateScores}
              />
            </div>
          ) : (
            <>
              {leaderboard ? (
                <LeaderboardModal leaderboardMap={leaderboard} />
              ) : null}
              <Search
                placeholder="Enter your username"
                enterButton="Join"
                size="large"
                className="login-search-bar"
                onSearch={(value) => {
                  setNewUser(value);
                }}
              />
            </>
          )}
        </div>
        <div className="players-side center-horizontal col-lg-4 col-md-4 col-sm-6">
          <div className="top-bottom">
            <div className="player-list-container" id="playerListContainer">
              <h4 className="player-list-title">Active Players</h4>
              {players.map((player, index) => (
                <p className="player-name-list" key={index}>
                  {player.name} - {player.points}
                </p>
              ))}
              {players.length === 0 ? (
                <p id="no-players">No players online</p>
              ) : null}
            </div>
          </div>

          {isLoggedIn ? (
            <div className="top-bottom player-chat">
              <div className="chat-container">
                <div className="messages-list">
                  {messages.map((message, index) => (
                    <div
                      className={`message-row ${
                        message.user === usernameNotID
                          ? "my-message"
                          : "other-message"
                      }`}
                      key={message.key}
                    >
                      <div key={index} className={`message`}>
                        <span className="username">{message.user}</span>
                        <p className="message-content">{message.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="input-area">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Input text and send"
                  />
                  <button onClick={handleSendClick}>Send</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
