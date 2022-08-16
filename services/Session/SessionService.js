const Router = require('express-promise-router')
const { validateUserInput, createSessKey, createJWT } = require('../../validation')

class SessionService {
    constructor(app){
        this.sessions = {}
        this.sessionExists = (sessKey) => {
            return this.sessions.hasOwnProperty(sessKey)
        }
        this.createSession = (uuid, name) => {
            let sessKey = createSessKey()
            let sess_end = new Date(new Date())
            sess_end.setDate(sess_end.getDate() + 0.5)
            while(this.sessions.hasOwnProperty(sessKey)){
                sessKey = createSessKey()
            }
            this.sessions[sessKey] = {
                UUID: uuid,
                TTL: sess_end,
                Name: name,
                socket: undefined
            }
            let JWTData = {
                Name: name,
                TTL: sess_end,
                sessKey: sessKey
            }
            return(createJWT(JWTData))
        }
        this.emitAllSockets = (message, value) => {
            Object.keys(this.sessions).forEach((session)=>{
                this.sessions[session].socket.emit(message, value)
            })
        }
        this.getSessionData = (sessKey) => {
            let session = this.sessions[sessKey]
            let UUID = session.UUID
            let TTL = session.TTL
            let Name = session.Name
            let socket = session.socket
            return [UUID, TTL, Name, socket]
        }
        this.setSocket = (sessKey, socket) => {
            this.sessions[sessKey].socket = socket
        }
        this.createGuestSession = (req, res) => {
            if(!validateUserInput(req.query)){
                res.send(new Error("Invalid Input"))
                return null
            }
            const {sessKey, name} = req.query
            if(sessKey == null){
                res.send("Invalid Input")
                return null
            }
            if(this.sessions.hasOwnProperty(sessKey)){
                res.send(new Error('Session already exists'))
            } else {
                let sess_end = new Date(new Date())
                sess_end.setDate(sess_end.getDate() + 0.5)
                this.sessions[sessKey] = {
                    UUID: "GuestUUID",
                    TTL: sess_end,
                    Name: name,
                    socket: undefined
                }
                res.send("Successful")
            }
        }
        this.validateSession = (sessKey) => {
            let session = this.sessions.hasOwnProperty(sessKey)?this.sessions[sessKey]:null
            return session && session.TTL < new Date()
        }
        this.validateSessionRoute = (req, res) => {
            if(!validateUserInput(req.query)){
                res.send(new Error("Invalid Input"))
                return null
            }
            const {sessKey} = req.query
            if(this.validateSession(sessKey)){
                res.send("true")
            } else {
                res.send("false")
            }
        }
        this.removeSession = (req, res) => {
            const {sessKey} = req.query
            if(!validateUserInput(req.query)){
                res.send(new Error("Invalid Input"))
                return null
            }
            if(this.sessionExists(sessKey)){
                delete this.sessions[sessKey]
                res.send("Successful")
            } else {
                res.send(new Error('Session does not exist'))
            }
        }
        let router = new Router()
        router.get('/removeSession', this.removeSession)
        router.get('/createGuestSession', this.createGuestSession)
        router.get('/validateSession', this.validateSessionRoute)
        app.use('/sessions', router)
    }
}
module.exports.SessionService = SessionService
