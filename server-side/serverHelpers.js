const game_combos = require("./combinations.js");

const round_duration = 50000;

class NewGame {
  constructor(clients, players, endRound, totalPoints) {
    this.clients = clients;
    this.players = players;
    this.startTime = Date.now();
    this.all_sequences = game_combos;
    this.rounds_played = 10;
    this.roundPoints = {};
    this.totalPoints = totalPoints;
    this.solvers = new Set();
    this.endRound = endRound;
    this.roundTimer = null;
  }

  sendToAllUsers(payload) {
    for (key in this.clients) {
      this.clients[key].sendUTF(JSON.stringify(payload));
    }
  }
  closeRoundSequence() {
    for (key in this.players) {
      this.totalPoints[this.players[key]] +=
        this.roundPoints[this.players[key]];
    }
    this.endRound();
  }

  clearRound() {
    if (this.solvers.size <= Object.keys(this.players).length) {
      // give all the players who didn't find the solution 0 points
      for (key in this.players) {
        if (!this.roundPoints[this.players[key]]) {
          this.roundPoints[this.players[key]] = 0;
          this.sendToAllUsers({
            type: "user-found-solution",
            user: this.players[key],
            points: 0,
          });
        }
      }

      this.closeRoundSequence();
    }
  }

  send_round_info() {
    const randomIndex = Math.floor(Math.random() * this.all_sequences.length);
    const number_combo = this.all_sequences[randomIndex];
    const payload = {
      type: "new-round",
      numbers: number_combo,
    };
    for (key in this.clients) {
      this.clients[key].sendUTF(JSON.stringify(payload));
    }

    // Timer to end the round
    this.roundTimer = setTimeout(() => {
      console.log("times up before everyone found solution");
      this.clearRound();
    }, round_duration);
  }

  terminateRound() {
    console.log("user quit, terminating round")
    if (this.roundTimer) {
      clearTimeout(this.roundTimer);
      this.clearRound();
    } else {
      console.log("No active timer to clear");
    }
  }

  solutionFound(id) {
    const foundTime = Date.now();
    const difference = foundTime - this.startTime;
    const points = Math.floor((round_duration - difference) / 100);
    const user = this.players[id];

    this.solvers.add(id);

    this.roundPoints[user] = points;

    const payload = {
      type: "user-found-solution",
      user: user,
      points: points,
    };

    for (key in this.clients) {
      this.clients[key].sendUTF(JSON.stringify(payload));
    }

    if (this.solvers.size === Object.keys(this.players).length) {
      // stop the timer
      clearTimeout(this.roundTimer);
      this.closeRoundSequence();
      console.log("everyone found the solution - onto the next round");
    }
  }
}

module.exports = NewGame;
