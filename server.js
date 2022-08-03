const { initGame } = require('./games');
const dotenv = require("dotenv")
const express = require('express')
const mountRoutes = require('./express_routes')
const cors = require('cors');
dotenv.config()
let port = 5000
if (process.env.PORT != undefined){
    port = process.env.PORT
}
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
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
const whitelist = ["http://localhost:3000",`http://${results.wlp31s0}:3000`,"https://main.d1fwghcuadi9z5.amplifyapp.com"]

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
games = {}

function createGame(num_seq, num_guesses, num_colors, players, answer) {
    const nextKey = Object.keys(games).length
    games[nextKey] = initGame(4, num_guesses, 6, players, answer)
}
app.get('/createGame', (req, res) => { //Line 9
    console.log(req.query)
});

createGame(4, 123, 6, ["player1", "player3"], ["purple","white","blue","green"])
createGame(4, 12, 6, ["player1", "player2"], ["purple","purple","blue","green"])
app.get('/mastermindGames', (req, res) => { //Line 9
    res.send(Object.keys(games))
});

app.get('/mastermindGuesses', (req, res) => { //Line 9'
    game = games[req.query.gameID]
    res.send([game.guess_arr, game.res_arr]); //Line 10
});

app.get('/mastermind', (req, res) => { //Line 9'
    game = games[req.query.gameID]
    resp = game.addGuess(req.query.guess)
    games[req.query.gameID] = game
    res.send(resp); //Line 10
});
app.get('/express_backend', (req, res) => { //Line 9
    res.send({ express: 'New Message For Test' }); //Line 10
  });
  