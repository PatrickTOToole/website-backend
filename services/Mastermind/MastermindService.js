const {initGame} = require('./mastermind')
const Router = require('express-promise-router')

class MastermindService {
    constructor(app, sessions, rooms){
        this.sessions = sessions
        this.rooms = rooms
        this.games = {"Pickle": initGame(4, 12,6,["Patrick"],["red","red","red","red"])}
        this.dummyResp = (req, res) => {
            const { id } = req.query
            res.send(id)
        }
        this.createGame = (req, res) => {
            const {gameName, numGuesses, players, answer } = req.query
            if (!this.games.hasOwnProperty(gameName)){
                this.games[gameName] = initGame(4, numGuesses, 6, players, answer)
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
                res.send([game.guess_arr, game.res_arr]); //Line 10
                // if (game.players.hasOwnProperty(sessKey)){
                //     res.send([game.guess_arr, game.res_arr]); //Line 10
                // } else {
                //     res.send(new Error("You are not a member of this game"))
                // }
            } else {
                res.send(new Error("Game does not exist"))
            }
        }
        this.addGuess = (req, res) => {
            const { gameName, guess } = req.query
            // let sessKey = req.query.sessKey
            let game = this.games.hasOwnProperty(gameName)?this.games[gameName]:null
            if (game /*&& sessKey*/) {
                let resp = game.addGuess(guess)
                // if (game.players.hasOwnProperty(sessKey)){
                //     let resp = game.addGuess(guess)
                //     games[gameName] = game
                //     res.send(resp); //Line 10
                // } else {
                //     res.send(new Error("You are not a member of this game"))
                // }
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
