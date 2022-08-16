const express = require('express')
const { 
    MastermindService, 
    GameRoomService, 
    SessionService,
    LoginService
} = require('./services')
// const mountRoutes = require('./express_routes')
const cors = require('cors');
let port = 5000; //Line 3
let FRONT_END = ["http://localhost:3000"]
let BACK_END = ["http://localhost:5000","http://localhost:5001"] 

if (process.env.BUILD_ENV == "prod"){
    port = process.env.PORT; //Line 3
    FRONT_END = ["https://www.patricktotoole.com"]
    BACK_END = ["https://patricktotoole.herokuapp.com","https://patricktotoole-sessions.herokuapp.com"]
} else if (process.env.BUILD_ENV == "dev"){
    FRONT_END =["https://dev.patricktotoole.com"]
    BACK_END = ["https://patricktotoole-dev.herokuapp.com","https://patricktotoole-sessions-dev.herokuapp.com"]
}
const app = express()
const whitelist = [...FRONT_END, ...BACK_END]
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
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors: corsOptions});


// const SessionManager = new SessionService(app)
// new LoginService(app, SessionManager)
const RoomManager = new GameRoomService(app)
new MastermindService(app, RoomManager)


io.on('connection', async function(client) {
    console.log('Client connected...');
    client.on('join', async function(sessKey) {
    if(!await fetch(`localhost:5001/sessions/validateSession/sessKey=${sessKey}`)){
        console.log('Disconnecting invalid session')
        client.disconnect()
    } else {
        console.log(`adding socket to session: ${sessKey}`)
        let test = await fetch(`localhost:5001/sessions/setSocket/sessKey=${sessKey}`,{
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              method: "POST",
              body: JSON.stringify({"socket":client})
        })
        console.log(test)
    }});
});



server.listen(port, () => {
    console.log(`App listening on ${port}`)
});
