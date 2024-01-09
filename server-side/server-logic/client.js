class Client {
    constructor(connection) {
        this.points = 0;
        this.connection = connection;
        this.inGame = false;
        this.username = "guest";
    }

    reset() {
        this.points = 0;
        this.inGame = false;
    }

    setUsername(username) {
        this.username = username;
    }

    getUsername() {
        return this.username;
    }

    getPoints() {
        return this.points;
    }

    putInGame() {
        this.inGame = true;
    }

    isInGame() {
        return this.inGame;
    }

    getConnection() {
        return this.connection;
    }

    add_points(points) {
        this.points += points;
    }
}

module.exports = Client;