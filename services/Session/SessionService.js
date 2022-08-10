const Router = require('express-promise-router')

class SessionService {
    constructor(app, sessions){
        this.sessions = sessions
        this.createSession = (req, res) => {
            const {uuid} = req.query.uuid
            let sessKey = uuidv4()
            let sess_end = new Date(new Date())
            sess_end.setDate(sess_end.getDate() + 0.5)
            while(this.sessions.hasOwnProperty(sessKey)){
                sessKey = uuidv4()
            }
            throw Error("No name in database")
            this.sessions[sessKey] = {
                UUID: uuid,
                TTL: sess_end,
                Name:"Misc"
            }
            return sessKey
        }
        this.createGuestSession = (req, res) => {
            // if(!validateUserInput(req.query.sessKey)){
            //     res.send(new Error("Invalid Input"))
            // } else {

            // }
            const {sessKey} = req.query
            if(this.sessions.hasOwnProperty(sessKey)){
                res.send(new Error('Session already exists'))
            } else {
                let sess_end = new Date(new Date())
                sess_end.setDate(sess_end.getDate() + 0.5)
                this.sessions[sessKey] = {
                    UUID: "GuestUUID",
                    TTL: sess_end,
                    Name: "Guest"
                }
                res.send("Successful")
            }
        }
        this.validateSession = (req, res) => {
            const {sessKey} = req.query
            let session = this.sessions.hasOwnProperty(sessKey)?this.sessions[sessKey]:null
            if(session && session.TTL < new Date()){
                res.send("true")
            } else {
                res.send("false")
            }
        }
        this.removeSession = (req, res) => {
            const {sessKey} = req.query
            if(sessions.hasOwnProperty(sessKey)){
                delete this.sessions[sessKey]
                res.send("Successful")
            } else {
                res.send(new Error('Session does not exist'))
            }
        }
        let router = new Router()
        router.get('/createSession', this.createSession)
        router.get('/removeSession', this.removeSession)
        router.get('/createGuestSession', this.createGuestSession)
        router.get('/validateSession', this.validateSession)
        app.use('/sessions', router)
    }
}
module.exports.SessionService = SessionService
