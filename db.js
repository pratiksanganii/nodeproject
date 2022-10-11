const { MongoClient } = require('mongodb')
const connectionString = 'mongodb+srv://todoAppUser:pratiksanganii@cluster0.pdpsj.mongodb.net/?retryWrites=true&w=majority'

const client = new MongoClient(connectionString)

const db = client.db("NodePlayground")

module.exports = db
const app = require("./app")
app.listen(3000)