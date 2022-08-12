const Router = require('express-promise-router')
const { validateUserInput, createSessKey, createJWT } = require('../../validation')


class GameRoomService {
    constructor(app, SessionManager){
        this.SessionManager = SessionManager
        this.rooms = {}
        this.addRoom = (req, res) => {
            const {roomName, sessKey, type } = req.query
            if (!validateUserInput(req.query)){
                res.send(false)
                return false
            }
            if(this.doesRoomExist(roomName) && type) {
                res.send(false)
            } else {
                this.SessionManager.emitAllSockets('updateGameList','updateGameList')
                this.rooms[roomName] = {
                    players: [sessKey],
                    sockets: [this.SessionManager.getSessionData(sessKey)[3]],
                    owner: sessKey,
                    type: type
                }
                res.send(true)
            }

        }
        this.getRoomData = (roomName) => {
            if(!this.doesRoomExist(roomName)) {
                return false
            } else {
                let room = this.rooms[roomName]
                let sockets = [...room.sockets]
                let players = [...room.players]
                let owner = room.owner
                return [sockets, owner, players]
            }
        }
        this.getData = (req, res) => {
            if (!validateUserInput(req.query)){
                res.send(false)
                return false
            }
            const {roomName, sessKey} = req.query
            if(!this.doesRoomExist(roomName)) {
                res.send(false)
            } else {
                let players = []
                let room = this.rooms[roomName]
                room["players"].forEach((sessKey) => {
                    if(this.SessionManager.validateSession(sessKey)) {
                        players.push(this.SessionManager.getSessionData(sessKey)[2])
                    }
                })
                let owner = ""
                let ownerKey = room.owner
                if(this.SessionManager.validateSession(ownerKey)){
                    owner = this.SessionManager.getSessionData(ownerKey)[2]
                }
                let resp = {
                    owner: owner,
                    players: players,
                    type: this.rooms[roomName].type
                }
                res.send(resp)
            }
        }
        this.isOwner = (roomName, sessKey) => {
            if(!this.doesRoomExist(roomName)) {
                return false
            } else {
                return this.rooms[roomName].owner === sessKey
            }
        }
        this.doesRoomExist = (roomName) => {
            return this.rooms.hasOwnProperty(roomName)
        }
        this.isPlayerMember = (roomName, sessKey) =>{
            if(!this.doesRoomExist(roomName)) {
                return false
            } else {
                return this.rooms[roomName].players.includes(sessKey)
            }
        }
        this.isOwnerRoute = (req, res) => {
            if (!validateUserInput(req.query)){
                res.send(false)
                return false
            }
            const {roomName, sessKey} = req.query
            if(!this.doesRoomExist(roomName)) {
                res.send(false)
            } else {
                res.send(this.rooms[roomName].owner === sessKey)
            }
        }
        this.listRooms = (req, res) => {
            const listedRooms = []
            Object.keys(this.rooms).forEach((roomName) =>{
                listedRooms.push([roomName, this.rooms[roomName].type])
            })
            res.send(listedRooms)
        }
        this.addPlayer = (req, res) => {
            const {roomName, sessKey} = req.query
            if (!validateUserInput(req.query)){
                res.send(false)
                return false
            }
            let socket = this.SessionManager.getSessionData(sessKey)[3]
            if (this.doesRoomExist(roomName) && !this.isPlayerMember(roomName, sessKey)){
                this.rooms[roomName].players.push(sessKey)
                this.rooms[roomName].sockets.push(socket)
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
        router.get('/isOwner', this.isOwnerRoute)
        router.get('/getData', this.getData)
        router.get('/listRooms', this.listRooms)
        router.get('/addPlayer', this.addPlayer)
        app.use('/rooms', router)
    }
}
module.exports.GameRoomService = GameRoomService
