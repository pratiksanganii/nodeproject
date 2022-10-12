const { MongoClient } = require('mongodb')
const dotenv = require("dotenv")
dotenv.config()

const client = new MongoClient(process.env.CONNECTION_STRING)

const db = client.db("NodePlayground")

module.exports = db
const app = require("./app")
app.listen(process.env.PORT)