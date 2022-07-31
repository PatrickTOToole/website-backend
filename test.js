const { initGame } = require('./games');
game = initGame(4, 12, 6, ["player1", "player2"], ["purple","white","blue","green"])
game2 = initGame(4, 12, 6, ["player1", "player3"], ["purple","purple","blue","green"])

resp = game.addGuess(["purple","purple","purple","purple"])
resp2 = game2.addGuess(["purple","purple","purple","purple"])
console.log(resp)
console.log(game)
console.log(game2)
