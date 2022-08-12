const {initGame} = require('./mastermind')
const Router = require('express-promise-router')
const { validateUserInput } = require('../../validation')

class MastermindService {
    constructor(app, RoomManager){
        this.RoomManager = RoomManager
        this.games = {}
        this.doesGameExist = (gameName) => {
            return this.games.hasOwnProperty(gameName)
        }
        this.createGame = (req, res) => {
            if(!validateUserInput(req.query)){
                res.send(new Error("Invalid Input"))
                return null
            }
            const {gameName, numGuesses, answer, sessKey } = req.query
            if(!this.RoomManager.doesRoomExist(gameName)){
                res.send(false)
                return null
            }
            const [sockets, owner, players] = this.RoomManager.getRoomData(gameName)
            if(!this.RoomManager.isOwner(gameName, sessKey)){
                res.send(false)
                return null
            }
            const answerReal = answer.split(",")
            if (!this.doesGameExist(gameName)){
                this.games[gameName] = {
                    game: initGame(4, 12, 6, answerReal),
                    sockets: [...sockets],
                    owner: owner,
                    players: [...players]
                }
                this.games[gameName].sockets.forEach((socket)=>{
                    socket.emit(`update-${gameName}-pull`,'pull')
                })
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
            // let sessKey = req.query.sessKey
            let game = this.doesGameExist(gameName)?this.games[gameName]:null
            if (game && game != undefined && sessKey) {
                // res.send([game.guess_arr, game.res_arr]); //Line 10
                if (game.players.includes(sessKey)){
                    res.send([game.game.guess_arr, game.game.res_arr]); //Line 10
                } else {
                    res.send(new Error("You are not a member of this game"))
                }
            } else {
                res.send(false)
            }
        }
        this.addGuess = (req, res) => {
            if(!validateUserInput(req.query)){
                res.send(new Error("Invalid Input"))
                return null
            }
            const { gameName, guess, sessKey } = req.query
            // let sessKey = req.query.sessKey
            let realGuess = guess.split(",")
            realGuess.shift()
            let game = this.doesGameExist(gameName)?this.games[gameName]:null
            if (game && sessKey) {
                if (game.players.includes(sessKey)){
                    let resp = this.games[gameName].game.addGuess(realGuess)
                    this.games[gameName].sockets.forEach(socket => {
                        socket.emit(`update-${gameName}`,"update")
                    }); 
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
