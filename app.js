const express = require('express');
const dotenv = require("dotenv")
dotenv.config()

const router = require('./router')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')


const app = express()
const sessionOptions = session({
    secret: 'thisisthesecret',
    store: new MongoStore({dbName: "NodePlayground",client: require("./db")}),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
})

app.use(sessionOptions)
app.use(flash())

app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use('/', router)

module.exports = app