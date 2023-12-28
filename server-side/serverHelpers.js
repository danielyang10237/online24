const game_combos = require("./combinations.js");

class NewGame {
  constructor(clients, players) {
    this.clients = clients;
    this.players = players;
    this.startTime = Date.now();
    this.all_sequences = game_combos;
  }

  clearRound() {
    const payload = {
      type: "round-over"
    };
    // further implementation for winners
    for (key in this.clients) {
      this.clients[key].sendUTF(JSON.stringify(payload));
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
    setTimeout(() => {
        this.clearRound();
      }, 10000);
  }
}

module.exports = NewGame;
