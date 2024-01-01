const NewGame = require("./serverHelpers");

const webSocketsServerPort = 8000;
const webSocketServer = require("websocket").server;
const http = require("http");

const server = http.createServer();
server.listen(webSocketsServerPort);
console.log("listening on port 8000");

const wsServer = new webSocketServer({
  httpServer: server,
});

let clients = {};
let usernames = {};
let playerPoints = {};

let players = [];
let countdownInterval = null;
let currentGame = null;
let totalRounds = 2;

const updatePlayers = () => {
  for (key in clients) {
    const payload = {
      type: "getting-players",
      players: players,
    };
    clients[key].sendUTF(JSON.stringify(payload));
  }
};

const initializePoints = () => {
  for (key in usernames) {
    playerPoints[usernames[key]] = 0;
  }
};

const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4();
};

const roundOver = () => {
  // console.log("ending the round");
  const payload = {
    type: "round-over",
    points: playerPoints,
  };
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  if (playerPoints) {
    for (key in clients) {
      clients[key].sendUTF(JSON.stringify(payload));
    }
  }
  setTimeout(() => {
    if (totalRounds > 1) {
      startNewRound();
      totalRounds--;
    } else {
      const payload2 = {
        type: "game-over",
        points: playerPoints,
      };
      for (key in clients) {
        clients[key].sendUTF(JSON.stringify(payload2));
      }
      totalRounds = 2;
      usernames = {};
      playerPoints = {};
      players = [];
      currentGame = null;
      countdownInterval = null;
      updatePlayers();
    }
  }, 1000);
};

const startNewRound = () => {
  let countdown = 3;
  countdownInterval = setInterval(() => {
    if (countdown >= 0) {
      const payload4 = {
        type: "game-starting",
        countdown: countdown,
      };
      for (key in clients) {
        clients[key].sendUTF(JSON.stringify(payload4));
      }
      if (countdown === 0) {
        currentGame = new NewGame(clients, usernames, roundOver, playerPoints);
        currentGame.send_round_info();
        countdown--;
        return;
      }
      countdown--;
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);
};

wsServer.on("request", function (request) {
  var userID = getUniqueID();
  // console.log(
  //   new Date()
  // +
  //   " Recieved a new connection from origin " +
  //   request.origin +
  //   "."
  // );

  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log("connected new user: " + userID);

  connection.on("close", function (connection) {
    // console.log(new Date() + " Peer " + userID + " disconnected.");
    players = players.filter((player) => player !== usernames[userID]);
    delete clients[userID];
    delete usernames[userID];
    updatePlayers();

    if (players.length < 2) {
      totalRounds = 0;

      if (currentGame) {
        console.log("player quit during the game, ending the game...");
        currentGame.terminateRound();
      } else if (countdownInterval) {
        console.log("player quit during countdown, ending the game...");
        roundOver();
      } else {
        console.log("player quit before the game started");
        for (key in clients) {
          const payload = {
            type: "lack-of-players",
          };
          clients[key].sendUTF(JSON.stringify(payload));
        }
        usernames = {};
        playerPoints = {};
        players = [];
        updatePlayers();
      }
    } else {
      console.log("user disconnected, but still continuing the game");
    }
  });

  // send frontend confirmation of connection
  const payload = {
    type: "connected",
    clientID: userID,
  };
  connection.sendUTF(JSON.stringify(payload));

  connection.on("message", function (message) {
    if (message.type === "utf8") {
      // console.log("Received Message: ", message.utf8Data);
      const parsedData = JSON.parse(message.utf8Data);

      switch (parsedData.type) {
        case "message":
          const payload = {
            type: "message",
            message: parsedData.msg,
            user: usernames[parsedData.id.current],
          };
          for (key in clients) {
            clients[key].sendUTF(JSON.stringify(payload));
          }
          break;
        case "retrieve-players":
          updatePlayers();
          break;
        case "new-player":
          if (players.includes(parsedData.user)) {
            const payload = {
              type: "username-taken",
            };
            clients[parsedData.id.current].sendUTF(JSON.stringify(payload));
            break;
          }
          if (countdownInterval || currentGame) {
            const payload = {
              type: "game-in-progress",
              round: totalRounds,
            };
            clients[parsedData.id.current].sendUTF(JSON.stringify(payload));
            break;
          }
          const payload2 = {
            type: "username-confirmed",
          };
          players.push(parsedData.user);
          usernames[parsedData.id.current] = parsedData.user;
          updatePlayers();
          clients[parsedData.id.current].sendUTF(JSON.stringify(payload2));
        case "check-start-game":
          const payload3 = {
            type: "can-start-game",
          };
          if (players.length == 2) {
            for (key in clients) {
              clients[key].sendUTF(JSON.stringify(payload3));
            }
          } else if (players.length > 2) {
            clients[parsedData.id.current].sendUTF(JSON.stringify(payload3));
          }
          break;
        case "start-game":
          initializePoints();
          startNewRound();
          break;
        case "found-solution":
          if (currentGame) {
            currentGame.solutionFound(parsedData.id.current);
          } else {
            console.log("no game in progress or found");
          }
          break;
        default:
          console.log("unknown message type", parsedData.type);
          break;
      }
    }
  });
});
