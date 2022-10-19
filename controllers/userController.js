const User = require('../models/User')

exports.home = function (req, res) {
    if (req.session.user) {
        res.render('home')
    } else {
        res.render('home-guest')
    }
}

exports.register = function (req, res) {
    let user = new User(req.body)
    user.register()
    if (user.errors.length) {
        res.send(user.errors)
    } else {
        res.render('home')
    }
}

exports.login = function (req, res) {
    let user = new User(req.body)
    user.login().then(data => {
        req.session.user = { username: user.data.username }
        res.send(data)
    }).catch(err => res.send(err))
}