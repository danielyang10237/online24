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
const players = [];
let inGame = false;

const updatePlayers = () => {
  for (key in clients) {
    const payload = {
      "type": "getting-players",
      players: players,
    };
    clients[key].sendUTF(JSON.stringify(payload));
  }
}

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
    delete clients[userID];
    delete usernames[userID];
    updatePlayers();
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


      if (parsedData.type === "message") {
        const payload = {
          type: "message",
          message: parsedData.msg,
          user: usernames[parsedData.id.current],
        };
        for (key in clients) {
          clients[key].sendUTF(JSON.stringify(payload));
        }
      } else if (parsedData.type === "retrieve-players") {
        // send player list to new player
        const payload = {
          "type": "getting-players",
          players: players,
        };
        clients[parsedData.id.current].sendUTF(JSON.stringify(payload));
      } else if (parsedData.type === "new-player") {
        players.push(parsedData.user);
        usernames[parsedData.id.current] = parsedData.user;
        updatePlayers();
        const payload = {
          "type": "can-start-game",
        };
        if (players.length == 2 && !inGame) {
          for (key in clients) {
            clients[key].sendUTF(JSON.stringify(payload));
          }
          inGame = true;
        } else if (players.length > 2) {
          console.log("sending the third");
          clients[parsedData.id.current].sendUTF(JSON.stringify(payload));
        }

      }
    }
  });
});
