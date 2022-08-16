const Router = require('express-promise-router')
const axios = require('axios')
const { validateUserInput, createSessKey, createJWT } = require('../../validation')

class GameRoomService {
    constructor(app, SESSION_SERVICE){
        this.SESSION_SERVICE = SESSION_SERVICE
        this.rooms = {}
        this.addRoom = async (req, res) => {
            const {roomName, sessKey, type } = req.query
            if (!validateUserInput(req.query)){
                res.send(false)
                return false
            }
            if(this.doesRoomExist(roomName) && type) {
                res.send(false)
            } else {
                this.rooms[roomName] = {
                    players: [sessKey],
                    owner: sessKey,
                    type: type
                }
                await axios.get(`${this.SESSION_SERVICE}/sessions/emitAllSockets?message=updateGameList&value=updateGameList`)
                res.send(true)
            }

        }
        this.getRoomData = (roomName) => {
            if(!this.doesRoomExist(roomName)) {
                return false
            } else {
                let room = this.rooms[roomName]
                let players = [...room.players]
                let owner = room.owner
                return [owner, players]
            }
        }
        this.getData = async (req, res) => {
            if (!validateUserInput(req.query)){
                res.send(false)
                return false
            }
            const {roomName, sessKey} = req.query
            const SESSION_SERVICE = this.SESSION_SERVICE
            if(!this.doesRoomExist(roomName)) {
                res.send(false)
            } else {
                let players = []
                let room = this.rooms[roomName]
                for (let playerKey of room.players) {
                    let resp = await axios.get(`${SESSION_SERVICE}/sessions/validateSession?sessKey=${playerKey}`)
                    if(resp.data) {
                        let name = (await axios.get(`${SESSION_SERVICE}/sessions/getSessionData?sessKey=${playerKey}`)).data[2]
                        players.push(name)
                    }
                }
                let owner = ""
                let ownerKey = room.owner
                let new_resp = await axios.get(`${SESSION_SERVICE}/sessions/validateSession?sessKey=${ownerKey}`)
                if(new_resp.data){
                    owner = (await axios.get(`${SESSION_SERVICE}/sessions/getSessionData/?sessKey=${ownerKey}`)).data[2]
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
        this.addPlayer = async (req, res) => {
            const {roomName, sessKey} = req.query
            const SESSION_SERVICE = this.SESSION_SERVICE
            if (!validateUserInput(req.query)){
                res.send(false)
                return false
            }
            if (this.doesRoomExist(roomName) && !this.isPlayerMember(roomName, sessKey)){
                this.rooms[roomName].players.push(sessKey)
                for(let idx in this.rooms[roomName].players){
                    let playerKey = this.rooms[roomName].players[idx]
                    axios.get(`${SESSION_SERVICE}/sessions/emitSocket?sessKey=${playerKey}&message=update-${roomName}&value=update`)
                }
                res.send(true)
            } else {
                console.log("ahshsh")
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
