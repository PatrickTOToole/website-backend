const {initGame} = require('./mastermind')
const Router = require('express-promise-router')
const { validateUserInput } = require('../../validation')
const axios = require('axios')

class MastermindService {
    constructor(app, RoomManager, SESSION_SERVICE){
        this.RoomManager = RoomManager
        this.games = {}
        this.SESSION_SERVICE = SESSION_SERVICE
        this.doesGameExist = (gameName) => {
            return this.games.hasOwnProperty(gameName)
        }
        this.createGame = async (req, res) => {
            if(!validateUserInput(req.query)){
                res.send(new Error("Invalid Input"))
                return null
            }
            const {gameName, numGuesses, answer, sessKey } = req.query
            const SESSION_SERVICE = this.SESSION_SERVICE
            if(!this.RoomManager.doesRoomExist(gameName)){
                res.send(false)
                return null
            }
            const [owner, players] = this.RoomManager.getRoomData(gameName)
            if(!this.RoomManager.isOwner(gameName, sessKey)){
                res.send(false)
                return null
            }
            const answerReal = answer.split(",")
            if (!this.doesGameExist(gameName)){
                this.games[gameName] = {
                    game: initGame(4, 12, 6, answerReal),
                    owner: owner,
                    players: [...players]
                }
                for(let idx in this.games[gameName].players){
                    let playerKey = this.games[gameName].players[idx]
                    await axios.get(`${SESSION_SERVICE}/sessions/emitSocket?sessKey=${playerKey}&message=update-${gameName}-pull&value=pull`)
                }
                res.send(true)
            } else {
                res.send(false)
            }
        }
        this.listGames = (req, res) => {
            res.send(Object.keys(this.games))
        }
        this.listGuesses = (req, res) =>{
            if(!validateUserInput(req.query)){
                res.send(new Error("Invalid Input"))
                return null
            }
            const { gameName, sessKey } = req.query
            let game = this.doesGameExist(gameName)?this.games[gameName]:null
            if (game && game != undefined && sessKey) {
                if (game.players.includes(sessKey)){
                    res.send([game.game.guess_arr, game.game.res_arr]);
                } else {
                    res.send(new Error("You are not a member of this game"))
                }
            } else {
                res.send(false)
            }
        }
        this.addGuess = async (req, res) => {
            if(!validateUserInput(req.query)){
                res.send(new Error("Invalid Input"))
                return null
            }
            const { gameName, guess, sessKey } = req.query
            const SESSION_SERVICE = this.SESSION_SERVICE
            let realGuess = guess.split(",")
            let game = this.doesGameExist(gameName)?this.games[gameName]:null
            if (game && sessKey) {
                if (game.players.includes(sessKey)){
                    let resp = this.games[gameName].game.addGuess(realGuess)
                    for (let idx in this.games[gameName].players){
                        let playerKey = this.games[gameName].players[idx]
                        await axios.get(`${SESSION_SERVICE}/sessions/emitSocket?sessKey=${playerKey}&message=update-${gameName}&value=update`)
                    }
                    res.send(resp)
                } else {
                    res.send(new Error("You are not a member of this game"))
                }
            } else {
                res.send(new Error("Game does not exist"))
            }
        }
        let router = new Router()
        router.get('/listGames', this.listGames)
        router.get('/createGame', this.createGame)
        router.get('/listGuesses', this.listGuesses)
        router.get('/addGuess', this.addGuess)
        app.use('/mastermind', router)
    }
 
}
module.exports.MastermindService = MastermindService
