const validator = require('validator')
const usersCollection = require("../db").collection("users")

let User = function(data){
    this.data = data
    this.errors = []
}

User.prototype.cleanUp = function(){
    if(typeof(this.data.username)!="string"){this.data.username=""}
    if(typeof(this.data.email)!="string"){this.data.email=""}
    if(typeof(this.data.password)!="string"){this.data.password=""}

    // get rid of any bogus properties
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.validate = function(){
    if(this.data.username==""){this.errors.push("You must provide a username.")}
    if(this.data.username!="" && !validator.isAlphanumeric(this.data.username)){this.errors.push("Username can contain only alphabets and numbers.")}
    if(!validator.isEmail(this.data.email)){this.errors.push("You must provide a valid email address.")}
    if(this.data.password==""){this.errors.push("You must provide a password.")}
    if(this.data.username.length>1 && this.data.username.length<3){this.errors.push("Username must be atleast 3 characters.")}
    if(this.data.username.length>30){this.errors.push("Username cannot exceed 30 characters.")}
    if(this.data.password.length>1 && this.data.password.length<12){this.errors.push("Password must be atleast 12 characters length.")}
    if(this.data.password.length>30){this.errors.push("Password cannot exceed 30 characters.")}
}

User.prototype.register = function(){

    // Step-1 : Validate user data
    this.cleanUp()
    this.validate()

    // Step-2 : if there is no error save data into the database
    if(!this.errors.length){
        usersCollection.insertOne(this.data)
    }
}

User.prototype.login = function(callback){
    this.cleanUp()
    usersCollection.findOne({username: this.data.username}).then((reqdUser)=>{
        if(reqdUser && reqdUser.password==this.data.password){
            callback("Logged In")
        }else{
            console.log("Invalid username/password.");
            callback("Invalid username/password.")
        }
    }).catch((err)=>{
        console.log(err)
    })
}

module.exports = User