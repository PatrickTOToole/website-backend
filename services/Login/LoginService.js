const Router = require('express-promise-router')
const bcrypt = require('bcryptjs');


class LoginService {
    constructor(app, sessions){
        this.sessions = sessions
        let router = new Router()
        this.validateLogin = (req, res) => {
            const {username, password} = req.query

            // ---- validateUsername ----
            // if(!validateUserInput(req.query.username)){
            //     res.send(new Error("Invalid Input"))
            // }
            // if(!validateUserInput(req.query.password)){
            //     res.send(new Error("Invalid Input"))
            // }
            //uuid = lookup(uuidTable, req.query.username)
            //if (!uuid){
                //res.send(new Error("User does not exist"))
            //}
            //req.query.password
            // if hash(password + lookup(saltTable, password) + app.salt) == lookup(passTable, uuid)
            
            let sessKey = createSessionKey(uuid)
            res.send(sessKey)
        }
        router.get('/validateLogin', this.validateLogin)
        app.use('/login', router)
    }
}

module.exports.LoginService = LoginService
