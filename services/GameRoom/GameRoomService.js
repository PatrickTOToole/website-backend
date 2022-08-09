const Router = require('express-promise-router')

class GameRoomService {
    constructor(app, sessions, rooms){
        this.sessions = sessions
        this.rooms = rooms

        this.addRoom = (req, res) => {
            const {roomName, sessKey, type } = req.query
            // if (!validateUserInput(roomName)){
            //     return false
            // }
            if(rooms.hasOwnProperty(roomName) && type) {
                res.send(false)
            } else {
                this.rooms[roomName] = {
                    players: [sessKey],
                    owner: sessKey,
                    type: type
                }
                res.send(true)
            }

        }
        this.getData = (req, res) => {
            // if (!validateUserInput(roomName)){
            //     return false
            // }
            const {roomName, sessKey} = req.query
            if(!this.rooms.hasOwnProperty(roomName)) {
                res.send(false)
            } else {
                let players = []
                let room = this.rooms[roomName]
                console.log(room)
                console.log(this.sessions)
                room["players"].forEach((player) => {
                    if(this.sessions.hasOwnProperty(player)) {
                        players.push(this.sessions[player].Name)
                    }
                    console.log(player)
                })
                let owner = sessKey
                let ownerKey = room.owner
                if(this.sessions.hasOwnProperty(ownerKey)){
                    owner = this.sessions[ownerKey].Name
                }
                let resp = {
                    owner: owner,
                    players: players,
                    type: this.rooms[roomName].type
                }
                res.send(resp)
            }
        }
        this.listRooms = (req, res) => {
            const {type} = req.query
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
