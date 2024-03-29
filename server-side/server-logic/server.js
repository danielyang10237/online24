const NewGame = require("./serverHelpers");
const Client = require("./client");

// sets up the server and the websocket connection
const webSocketServer = require("websocket").server;
const http = require("http");

const server = http.createServer();
const webSocketsServerPort = process.env.PORT || 8000;
server.listen(webSocketsServerPort, () => {
  console.log(`Server is listening on port ${webSocketsServerPort}`);
});


const wsServer = new webSocketServer({
  httpServer: server,
});

// stores the client connection, usernames, and points
let clients = {};
let players = [];

// game parameters, which can be changed
let totalRounds = 5;
let roundCount = totalRounds - 1;
let countdownInterval = null;
let currentGame = null;

const getPointsMap = () => {
  // get the points for all the clients
  const playerPoints = [];
  for (key in clients) {
    if (clients[key].isInGame()) {
      playerPoints.push({
        name: clients[key].getUsername(),
        points: clients[key].getPoints(),
      });
    }
  }
  //   console.log("points map", pointsMap);
  return playerPoints;
};

// updates every connected client with the current players
const updatePlayers = () => {
  for (let key in clients) {
    // console.log(
    //   "UPDATING PLAYERS - just sent to",
    //   clients[key].getUsername(),
    //   key,
    //   clients[key].getConnection().remoteAddress
    // );
    const payload = {
      type: "getting-players",
      players: getPointsMap(),
    };
    clients[key].getConnection().sendUTF(JSON.stringify(payload));
  }
};

// function to generate random sequence of numbers/letters
const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4();
};

// function to start a new round
const startNewRound = () => {
  // sets up a countdown on the client side
  let countdown = 3;
  countdownInterval = setInterval(() => {
    // sends the current countdown to all the clients
    countdown--;

    // handles the stages of the countdown
    if (countdown >= 0) {
      for (key in clients) {
        clients[key].getConnection().sendUTF(
          JSON.stringify({
            type: "game-starting",
            countdown: countdown,
          })
        );
      }

      // once the countdown is over, start a new game
      if (countdown === 0) {
        currentGame = new NewGame(clients, players, roundOver);
        currentGame.send_round_info();
        clearInterval(countdownInterval);
        countdownInterval = null;
        return;
      }
    }
  }, 1000);
};

// function to end and clean up the round
const roundOver = () => {
  //   console.log("roundover", roundCount);
  const payload = {
    type: "round-over",
    points: getPointsMap(),
  };
  if (clients) {
    for (key in clients) {
      clients[key].getConnection().sendUTF(JSON.stringify(payload));
    }
  }

  // if the countdown is still happening, we stop it
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  // we start a new round if there are still rounds left
  setTimeout(() => {
    console.log("starting new round...", roundCount);

    if (roundCount > 0) {
      // if there is still remaining rounds, we start a new round
      startNewRound();
      roundCount--;
    } else {
      // if there's no more rounds, we end the game
      for (key in clients) {
        clients[key].getConnection().sendUTF(
          JSON.stringify({
            type: "game-over",
            points: getPointsMap(),
          })
        );
      }
      currentGame.endTheGame();
      terminateGame();
    }
  }, 1000);
};

// ends the game and prepare for a new game
const terminateGame = () => {
  // console.log("current game", currentGame);

  //   console.log("terminating the game");

  roundCount = 0; // this is to prevent the game from starting a new round

  // this ends the game early because players left
  if (currentGame && currentGame.isInGame()) {
    console.log("player quit during the game, ending the game...");
    currentGame.terminateRound();
    return;
  } else if (countdownInterval) {
    console.log("player quit during countdown, ending the game...");
    clearInterval(countdownInterval);
    for (key in clients) {
      clients[key].getConnection().sendUTF(
        JSON.stringify({
          type: "game-over",
          points: getPointsMap(),
        })
      );
    }
  } else if (!currentGame && !countdownInterval) {
    console.log("player quit before the game started");
    for (key in clients) {
      const payload = {
        type: "lack-of-players",
      };
      clients[key].getConnection().sendUTF(JSON.stringify(payload));
    }
    return;
  }

  // refresh the round
  roundCount = totalRounds - 1;
  players = [];
  updatePlayers();
  currentGame = null;
  countdownInterval = null;
  // print how many keys are in clients
  console.log("number of clients", Object.keys(clients).length);
  for (key in clients) {
    clients[key].reset();
  }
};

// sets up the websocket functionality
wsServer.on("request", function (request) {

  // reject connection if there is already more than 50 clients

  if (Object.keys(clients).length >= 50) {
    request.reject();
    console.log("connection rejected");
    return;
  }

  // log and store when new client connects
  const connection = request.accept(null, request.origin);
  const uniqueID = getUniqueID();
  clients[uniqueID] = new Client(connection);
  console.log("new server connection detected", uniqueID);

  // handles when a client disconnects
  connection.on("close", function (connection) {
    console.log("connection closed", uniqueID, clients[uniqueID].getUsername());
    
    if (clients[uniqueID].getUsername() !== "guest") {
      for (key in clients) {
        clients[key].getConnection().sendUTF(
          JSON.stringify({
            type: "user-disconnected",
            user: clients[uniqueID].getUsername(),
          })
        );
      }

      players = players.filter(
        (player) => player !== clients[uniqueID].getUsername()
      );

      delete clients[uniqueID];

      updatePlayers();
      // if there are less than 2 players, end the game
      if (currentGame || countdownInterval) {
        if (currentGame && players.length >= 2) {
          currentGame.updatePlayers(players);
        } else {
          terminateGame();
        }
      } else if (players.length < 2) {
        for (key in clients) {
          const payload = {
            type: "lack-of-players",
          };
          clients[key].getConnection().sendUTF(JSON.stringify(payload));
        }
      }
    } else {
      delete clients[uniqueID];
    }
  });

  // send the client a connection confirmation
  connection.sendUTF(
    JSON.stringify({
      type: "connected",
      id: uniqueID,
    })
  );

  // set up the server side recieving of messages
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      const parsedData = JSON.parse(message.utf8Data);

      // handle all the unique message types
      switch (parsedData.type) {
        case "message":
          // user sent message in the chat, forwards message to all clients
          const payload = {
            type: "message",
            message: parsedData.msg,
            user: clients[parsedData.username].getUsername(),
          };
          for (key in clients) {
            clients[key].getConnection().sendUTF(JSON.stringify(payload));
          }
          break;
        case "retrieve-players":
          // user wants to know the current players, so we send it to them
          const payloadPlayers = {
            type: "getting-players",
            players: getPointsMap(),
          };
          connection.sendUTF(JSON.stringify(payloadPlayers));
          break;
        case "new-player":
          //   console.log("clients before");
          //   for (key in clients) {
          //     console.log(key, clients[key].getUsername());
          //   }
          // if our players array already contains the new name, we refuse the addition
          if (players.includes(parsedData.user)) {
            // return the client that username is already taken
            const payload = {
              type: "username-taken",
            };
            clients[parsedData.id]
              .getConnection()
              .sendUTF(JSON.stringify(payload));
            break;
          }

          // console.log("game and countdown", currentGame, countdownInterval);
          // if the game is in progress, we refuse the addition
          if (countdownInterval || currentGame) {
            const payload = {
              type: "game-in-progress",
              round: roundCount,
            };
            clients[parsedData.id]
              .getConnection()
              .sendUTF(JSON.stringify(payload));
            break;
          }

          //   if (player.length >= 8) {
          //     implementation needed
          //   }

          // now we add in the new players, updates player and clients
          const username = parsedData.user;
          console.log(username, "joined the game", parsedData.id);
          players.push(username);

          // set the new username
          //   console.log('id and usernames', parsedData.id, username, clients);
          clients[parsedData.id].setUsername(username);

          clients[parsedData.id].putInGame();

          // update the frontend with the new user
          clients[parsedData.id].getConnection().sendUTF(
            JSON.stringify({
              type: "username-confirmed",
            })
          );

          //   clients[parsedData.id].getConnection().sendUTF(
          //     JSON.stringify({
          //         type: "getting-players",
          //         players: getPointsMap(),
          //       })
          //   );

          updatePlayers();

          //   console.log("clients after");
          //   for (key in clients) {
          //     console.log(key, clients[key].getUsername());
          //   }
          break;
        case "change-round-count":
          // console.log("changing round count", parsedData.roundCount);
          // user wants to change the number of rounds, so we update the round count
          totalRounds = parsedData.roundCount;
          roundCount = totalRounds - 1;
          for (key in clients) {
            const payload = {
              type: "round-count-changed",
              roundCount: totalRounds,
            };
            clients[key].getConnection().sendUTF(JSON.stringify(payload));
          }
          break;
        case "check-start-game":
          // let all the clients know the game can be started
          const payloadStartGame = {
            type: "can-start-game",
            totalRounds: totalRounds,
          };
          if (players.length == 2) {
            for (key in clients) {
              clients[key]
                .getConnection()
                .sendUTF(JSON.stringify(payloadStartGame));
            }
          } else if (players.length > 2) {
            clients[parsedData.id]
              .getConnection()
              .sendUTF(JSON.stringify(payloadStartGame));
          }
          break;
        case "start-game":
          // one of the clients has started the game, so we start the game
          startNewRound();
          break;
        case "found-solution":
          // console.log("FOUND SOLUTION", parsedData);
          // one of the clients has found a solution, so we update the game accordingly
          if (currentGame) {
            currentGame.solutionFound(
              clients[parsedData.username].getUsername()
            );
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
