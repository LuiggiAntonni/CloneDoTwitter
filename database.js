const mongoose = require('mongoose');

class Database {

    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect(process.env.MONGO_URL_KEY)
        .then(() => {
            console.log("Database conectada com sucesso")
        })
        .catch((err) => {
            console.log("Erro ao conectar com o banco de dados: " + err)
        })
    }
}

module.exports = new Database();