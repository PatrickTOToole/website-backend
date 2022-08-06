
games = {0:"test"}
gameID = 0
res = games.hasOwnProperty(gameID)?games[gameID]:null
if (res){
    console.log(res)
} else {
    console.log("isNull")
}
