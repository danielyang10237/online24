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

const clients = {};
const usernames = {};
let players = [];
let inGame = false;

const updatePlayers = () => {
  for (key in clients) {
    const payload = {
      type: "getting-players",
      players: players,
    };
    clients[key].sendUTF(JSON.stringify(payload));
  }
};

const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4();
};

wsServer.on("request", function (request) {
  var userID = getUniqueID();
  console.log(
    new Date()
    // +
    //   " Recieved a new connection from origin " +
    //   request.origin +
    //   "."
  );

  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log("connected new user: " + userID);

  connection.on("close", function (connection) {
    console.log(new Date() + " Peer " + userID + " disconnected.");
    players = players.filter((player) => player !== usernames[userID]);
    delete clients[userID];
    delete usernames[userID];
    updatePlayers();
    if (players.length < 2) {
      inGame = false;
      // further implementation needed
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
      console.log("Received Message: ", message.utf8Data);
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
          const payload2 = {
            type: "username-confirmed",
          };
          players.push(parsedData.user);
          usernames[parsedData.id.current] = parsedData.user;
          updatePlayers();
          clients[parsedData.id.current].sendUTF(JSON.stringify(payload2));
        case "check-start-game":
          console.log(usernames[parsedData.id.current] + " is ready");
          const payload3 = {
            type: "can-start-game",
          };
          if (players.length == 2 && !inGame) {
            for (key in clients) {
              console.log("sending", key);
              clients[key].sendUTF(JSON.stringify(payload3));
            }
            inGame = true;
          } else if (players.length > 2) {
            clients[parsedData.id.current].sendUTF(JSON.stringify(payload3));
          }
          break;
        case "start-game":
          let countdown = 3;
          const messageInterval = setInterval(() => {
            if (countdown >= 0) {
              const payload4 = {
                type: "game-starting",
                countdown: countdown,
              };
              for (key in clients) {
                clients[key].sendUTF(JSON.stringify(payload4));
              }
              if (countdown === 0) {
                const game = new NewGame(clients, players);
                game.send_round_info();
                countdown--;
                return;
              }
              countdown--;
            } else {
              clearInterval(messageInterval);
            }
          }, 1000);
          break;
        default:
          console.log("unknown message type", parsedData.type);
          break;
      }
    }
  });
});
