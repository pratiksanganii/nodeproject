const { MongoClient } = require('mongodb')
const dotenv = require("dotenv")
dotenv.config()

const client = new MongoClient(process.env.CONNECTION_STRING)

module.exports = client
const app = require("./app")
app.listen(process.env.PORT)