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
let FRONT_END = "http://localhost:3000"
let BACK_END = "http://localhost:5000"
if (process.env.PORT){
    port = process.env.PORT; //Line 3
    FRONT_END = "https://www.patricktotoole.com"
    BACK_END = "https://patricktotoole.herokuapp.com"
}
const app = express()
const whitelist = [FRONT_END, BACK_END]
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

const SessionManager = new SessionService(app)
const RoomManager = new GameRoomService(app, SessionManager)
new MastermindService(app, RoomManager)
new LoginService(app, SessionManager)

io.on('connection', function(client) {
    console.log('Client connected...');
    client.on('join', function(sessKey) {
    if(!SessionManager.validateSession(sessKey)){
        console.log('Disconnecting invalid session')
        client.disconnect()
    } else {
        console.log(`adding socket to session: ${data}`)
        SessionManager.setSocket(sessKey, client)
    }});
});



server.listen(port, () => {
    console.log(`App listening on ${port}`)
});
