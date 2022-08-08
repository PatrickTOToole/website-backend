const Router = require('express-promise-router')

class GameRoomService {
    constructor(app, sessions, rooms){
        this.sessions = sessions
        this.rooms = rooms

        this.addRoom = (req, res) => {
            const {roomName, sessKey} = req.query
            // if (!validateUserInput(roomName)){
            //     return false
            // }
            if(rooms.hasOwnProperty(roomName)) {
                res.send(false)
            } else {
                this.rooms[roomName] = {
                    players: [sessKey],
                    owner: sessKey
                }
                res.send(true)
            }

        }
        this.getData = (req, res) => {
            // if (!validateUserInput(roomName)){
            //     return false
            // }
            const {roomName} = req.query
            if(!this.rooms.hasOwnProperty(roomName)) {
                res.send(false)
            } else {
                let players = []
                this.rooms[roomName].players.forEach((player) => {
                    if(this.sessions.hasOwnProperty(player)) {
                        players.push(this.sessions[player].Name)
                    }
                })
                let owner = this.sessions[this.rooms[roomName].owner].Name
                res.send({
                    owner: owner,
                    players: players
                })
            }
        }
        this.listRooms = (req, res) => {
            res.send(Object.keys(rooms))
        }
        this.addPlayer = (req, res) => {
            const {roomName, sessKey} = req.query
            // if (!validateUserInput(roomName)){
            //     return false
            // }
            let room = this.rooms.hasOwnProperty(roomName)?this.rooms[roomName]:null
            if (room && !room.players.hasOwnProperty(sessKey)){
                room.players.push(sessKey)
                res.send(true)
            } else {
                res.send(false)
            }
        }
        let router = new Router()
        router.get('/addRoom', this.addRoom)
        router.get('/getData', this.getData)
        router.get('/listRooms', this.listRooms)
        router.get('/addPlayer', this.addPlayer)
        app.use('/rooms', router)
    }
}
module.exports.GameRoomService = GameRoomService
