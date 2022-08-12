const Router = require('express-promise-router')

class GameRoomService {
    constructor(app, sessions, rooms, sockets){
        this.sockets = sockets
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
                // io.on(`${roomName}`, (client) =>{
                // })
                Object.keys(this.sessions).forEach((session)=>{
                    this.sessions[session].socket.emit('updateGameList','updateGameList')
                })
                console.log(sessKey)
                this.rooms[roomName] = {
                    players: [sessKey],
                    sockets: [this.sessions[sessKey].socket],
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
                room["players"].forEach((player) => {
                    if(this.sessions.hasOwnProperty(player)) {
                        players.push(this.sessions[player].Name)
                    }
                })
                let owner = ""
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
        this.isOwner = (req, res) => {
            const {roomName, sessKey} = req.query
            if(!this.rooms.hasOwnProperty(roomName)) {
                res.send(false)
            } else {
                res.send(this.rooms[roomName].owner === sessKey)
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
            if (room && !this.rooms[roomName].players.includes(sessKey)){
                this.rooms[roomName].players.push(sessKey)
                this.rooms[roomName].sockets.push(this.sessions[sessKey].socket)
                this.rooms[roomName].sockets.forEach((socket) =>{
                    socket.emit(`update-${roomName}`,'update')
                })
                res.send(true)
            } else {
                res.send(false)
            }
        }
        let router = new Router()
        router.get('/addRoom', this.addRoom)
        router.get('/isOwner', this.isOwner)
        router.get('/getData', this.getData)
        router.get('/listRooms', this.listRooms)
        router.get('/addPlayer', this.addPlayer)
        app.use('/rooms', router)
    }
}
module.exports.GameRoomService = GameRoomService
