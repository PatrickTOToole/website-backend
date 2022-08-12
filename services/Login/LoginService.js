const Router = require('express-promise-router')
const bcrypt = require('bcryptjs');
const { validateUserInput } = require('../../validation')


class LoginService {
    constructor(app, SessionManager){
        this.SessionManager = SessionManager
        let router = new Router()
        this.validateLogin = (req, res) => {
            // ---- validateQuery ----
            if(!validateUserInput(req.query)){
                res.send(false)
                return null
            }
            const {username, password} = req.query
            //uuid = lookup(uuidTable, req.query.username)
            //if (!uuid){
                //res.send(new Error("User does not exist"))
            //}
            // if hash(password + lookup(saltTable, password) + app.salt) == lookup(passTable, uuid)
            // const JWT = this.SessionManager.createSession(uuid, username)
            // res.send(JWT)
            res.send(false)
        }
        router.get('/validateLogin', this.validateLogin)
        app.use('/login', router)
    }
}

module.exports.LoginService = LoginService
