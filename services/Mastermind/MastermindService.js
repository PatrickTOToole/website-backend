const {initGame} = require('./mastermind')
const Router = require('express-promise-router')

class MastermindService {
    constructor(app, sessions, rooms, games){
        this.sessions = sessions
        this.rooms = rooms
        this.games = games
        this.createGame = (req, res) => {
            const {gameName, numGuesses, players, answer } = req.query
            const answerReal = answer.split(",")
            if (!this.games.hasOwnProperty(gameName)){
                this.games[gameName] = {
                    game: initGame(4, 12, 6, players, answerReal),
                    sockets: [...this.rooms[gameName].sockets]
                }
                this.rooms[gameName].sockets.forEach((socket)=>{
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
            const { gameName, sessKey } = req.query
            // let sessKey = req.query.sessKey
            let game = this.games.hasOwnProperty(gameName)?this.games[gameName]:null
            if (game && game != undefined && sessKey) {
                res.send([game.game.guess_arr, game.game.res_arr]); //Line 10
                // if (game.players.hasOwnProperty(sessKey)){
                //     res.send([game.guess_arr, game.res_arr]); //Line 10
                // } else {
                //     res.send(new Error("You are not a member of this game"))
                // }
            } else {
                res.send(this.games)
            }
        }
        this.addGuess = (req, res) => {
            const { gameName, guess } = req.query
            // let sessKey = req.query.sessKey
            let realGuess = guess.split(",")
            realGuess.shift()
            let game = this.games.hasOwnProperty(gameName)?this.games[gameName]:null
            if (game /*&& sessKey*/) {
                let resp = this.games[gameName].game.addGuess(realGuess)
                this.games[gameName].sockets.forEach(socket => {
                    socket.emit(`update-${gameName}`,"update")
                });
                // if (game.players.hasOwnProperty(sessKey)){
                //     let resp = game.addGuess(guess)
                //     games[gameName] = game
                //     res.send(resp); //Line 10
                // } else {
                //     res.send(new Error("You are not a member of this game"))
                // }
                res.send(resp)
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
