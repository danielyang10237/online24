const game_combos = require("./combinations.js");

const round_duration = 50000; // the time given to each round in milliseconds

class NewGame {
  // constructor to initialize all the variables
  constructor(clients, players, endRound) {
    this.clients = clients;
    this.players = players;
    this.startTime = Date.now();
    this.all_sequences = game_combos;
    this.roundPoints = {};
    this.solvers = [];
    this.endRound = endRound;
    this.roundTimer = null;
    this.inGame = true;
  }

  retrieveUsername(key) {
    return this.clients[key].getUsername();
  }

  // helper function to send a payload to all the clients
  sendToAllUsers(payload) {
    for (key in this.clients) {
      this.clients[key].getConnection().sendUTF(JSON.stringify(payload));
    }
  }

  // function to send the round info to all the clients
  send_round_info() {
    // select a random solution from the list of all solutions and send it to all the clients
    const randomIndex = Math.floor(Math.random() * this.all_sequences.length);
    const number_combo = this.all_sequences[randomIndex];

    this.sendToAllUsers({
      type: "new-round",
      numbers: number_combo,
    });

    // Timer to end the round in case not everyone finds the solution
    this.roundTimer = setTimeout(() => {
      console.log("times up before everyone found solution");
      this.clearRound();
    }, round_duration);
  }

  // function to handle when a user finds the solution
  solutionFound(name) {
    const foundTime = Date.now();
    const difference = foundTime - this.startTime;
    const points = Math.floor((round_duration - difference) / 100);

    this.solvers.push(name);
    this.roundPoints[name] = points;

    // let the clients know this user has found the solutions
    const payload = {
      type: "user-found-solution",
      user: name,
      points: points,
    };
    // console.log("USER SOLUTION", payload);

    this.sendToAllUsers(payload);

    // handles when everyone has found the solution
    if (this.solvers.length === this.players.length) {
      clearTimeout(this.roundTimer);
      this.clearRound();
      console.log("everyone found the solution - onto the next round");
    }
  }

  // handles the case where the round ends because of the timer
  clearRound() {
    this.inGame = false;

    // give all the players who didn't find the solution 0 points
    for (key in this.clients) {
      if (!this.roundPoints[this.retrieveUsername(key)] && this.clients[key].isInGame()) {
        this.roundPoints[this.retrieveUsername(key)] = 0;
        this.sendToAllUsers({
          type: "user-found-solution",
          user: this.retrieveUsername(key),
          points: 0,
        });
      }
    }

    // add the round points to the total points
    for (key in this.clients) {
      this.clients[key].add_points(this.roundPoints[this.retrieveUsername(key)]);
    }

    // call parent function to sweep the round
    this.endRound();
  }

  // function to terminate the round when a user quits
  terminateRound() {
    console.log("user quit, terminating round");
    if (this.roundTimer) {
      clearTimeout(this.roundTimer);
      this.clearRound();
    } else {
      console.log("No active timer to clear");
    }
  }

  isInGame() {
    return this.inGame;
  }

  endTheGame() {
    this.inGame = false;
  }
}

module.exports = NewGame;
