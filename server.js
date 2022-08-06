const uuidv4 = require('uuid');
const { initGame } = require('./games');
const dotenv = require("dotenv")
const express = require('express')
const mountRoutes = require('./express_routes')
// const validators = require('./validation')
const cors = require('cors');
const bcrypt = require('bcryptjs')
dotenv.config()
let port = 5000; //Line 3
let FRONT_END = "http://localhost:3000"
if (process.env.PORT){
    port = process.env.PORT; //Line 3
    FRONT_END = "https://main.d1fwghcuadi9z5.amplifyapp.com"
    //FRONT_END = process.env.FRONT_END
}
function retryLoop(max_retries, backoff, waitsecs, name, func) {
    var retries = 0
    var wait_ms = waitsecs * 1000
    var success = false
    while (!success && retries < max_retries){
        try {
            func()
            success = true
        } catch (error) {
            setTimeout(function(){console.log(`Retrying ${name}`)}, wait_ms*(backoff**retries))
            retries += 1;
        }
    }
    return success
}

const app = express()
const whitelist = [FRONT_END]

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true)
    } else {
        callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}

app.use(cors(corsOptions))

mountRoutes(app)
is_react = retryLoop(3, 2, 10, "connectToReact", () => {
    app.listen(port, () => {
        console.log(`App listening to react`)
    });
})
if (!is_react){
    throw "React is not online!"
}

let sessions = {}

function createUser(username){
    let res = false
    // if !lookup(uuidTable, username){
    // uuid = uuidv4()
    // res = insert(username, uuid, uuidTable)
    //}
    // else {
    //  res = false;
    //}
    return res
}

function createSessionKey(uuid){
    let sessKey = uuidv4()
    let sess_end = new Date(new Date())
    sess_end.setDate(sess_end.getDate() + 0.5)
    while(sessions.hasOwnProperty(sessKey)){
        sessKey = uuidv4()
    }
    sessions[sessKey] = {
        UUID: uuid,
        TTL: sess_end
    }
    return sessKey
}
// function validateSession(sessions, sessKey){
//     let session = sessions.hasOwnProperty(sessKey)?sessions[sessKey]:null
//     if(session && session.TTL < new Date()){
//         return true
//     }
//     return false
// }

app.get('/createGuestSession', (req, res) =>{
    // if(!validateUserInput(req.query.sessKey)){
    //     res.send(new Error("Invalid Input"))
    // } else {

    // }
    let sessKey = req.query.sessKey
    if(sessions.hasOwnProperty(sessKey)){
        res.send(new Error('Session already exists'))
    } else {
        let sess_end = new Date(new Date())
        sess_end.setDate(sess_end.getDate() + 0.5)
        sessions[sessKey] = {
            UUID: "Guest",
            TTL: sess_end
        }
        res.send("Successful")
    }
})
app.get('/removeSession',(req,res) => {
    let sessKey = req.query.sessKey
    if(sessions.hasOwnProperty(sessKey)){
        delete sessions[sessKey]
        res.send("Successful")
    } else {
        res.send(new Error('Session does not exist'))

    }
})
app.get('/validateLogin', (req, res) => {
    // ---- validateUsername ----
    if(!validateUserInput(req.query.username)){
        res.send(new Error("Invalid Input"))
    }
    if(!validateUserInput(req.query.password)){
        res.send(new Error("Invalid Input"))
    }
    //uuid = lookup(uuidTable, req.query.username)
    //if (!uuid){
        //res.send(new Error("User does not exist"))
    //}
    //req.query.password
    // if hash(password + lookup(saltTable, password) + app.salt) == lookup(passTable, uuid)
    
    let sessKey = createSessionKey(uuid)
    res.send(sessKey)
});
let rooms = {}
let games = {}
function createRoom(roomName){
    if (!validateUserInput(roomName)){
        return false
    }
    if(rooms.hasOwnProperty(roomName)) {
        return false
    }
    rooms[roomName] = {
        players: []
    }
    return true
}
function validateUserInput(inputVal){
    return true
}
function addPlayerToRoom(roomName, sessKey){
    if (!validateUserInput(roomName)){
        return false
    }
    let room = rooms.hasOwnProperty(roomName)?rooms[roomName]:null
    if (room && !room.players.hasOwnProperty(sessKey)){
        room.players.push(sessKey)
        return true
    } else {
        return false
    }
}
function createGame(gameName, numSeq, num_guesses, num_colors, players, answer) {
    if (!games.hasOwnProperty(gameName)){
        games[gameName] = initGame(4, num_guesses, 6, players, answer)
        return true
    } else {
        return false
    }
    
}
app.get('/createGame', (req, res) => { //Line 9
    if (validateUserInput(req.query.gameName) && req.query.players && req.query.answer && req.query.answer.length == 4){
        let resp = createGame(req.query.gameName, 4, 12, 6, req.query.players, req.query.answer)
        if(resp) {
            res.send("Created Game")
        } else {
            res.send(new Error("Invalid Input"))
        }
    } else {
        res.send(new Error("Invalid Input"))
    }
});
app.get('/createRoom', (req, res) => { //Line 9
    if (validateUserInput(req.query.roomName) && req.query.players && req.query.answer && req.query.answer.length == 4){
        let resp = createRoom(req.query.roomName)
        if(resp) {
            res.send("Created Game")
        } else {
            res.send(new Error("Invalid Input"))
        }
    } else {
        res.send(new Error("Invalid Input"))
    }
});

createGame("Pickle", 4, 123, 6, ["player1", "player3"], ["purple","white","blue","green"])
createGame("Goat", 4, 12, 6, ["player1", "player2"], ["purple","purple","blue","green"])

app.get('/mastermindGames', (req, res) => { //Line 9
    res.send(Object.keys(games))
});
app.get('/mastermindRooms', (req, res) => { //Line 9
    res.send(Object.keys(rooms))
});

app.get('/mastermindGuesses', (req, res) => { //Line 9'
    let gameID = req.query.gameID
    let sessKey = req.query.sessKey
    let game = games.hasOwnProperty(gameID)?games[gameID]:null
    if (game && game != undefined && sessKey) {
        if (game.players.hasOwnProperty(sessKey)){
            res.send([game.guess_arr, game.res_arr]); //Line 10
        } else {
            res.send(new Error("You are not a member of this game"))
        }
    } else {
        res.send(new Error("Game does not exist"))
    }
});

app.get('/mastermind', (req, res) => { //Line 9'
    let gameID = req.query.gameID
    let sessKey = req.query.sessKey
    let game = games.hasOwnProperty(gameID)?games[gameID]:null
    if (game && sessKey) {
        if (game.players.hasOwnProperty(sessKey)){
            let resp = game.addGuess(req.query.guess)
            games[req.query.gameID] = game
            res.send(resp); //Line 10
        } else {
            res.send(new Error("You are not a member of this game"))
        }
    } else {
        res.send(new Error("Game does not exist"))
    }
});
app.get('/express_backend', (req, res) => { //Line 9
    res.send({ express: 'New Message For Test' }); //Line 10
});
  
console.log("hid")
