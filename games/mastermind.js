function initGame(cols, max_guesses, num_colors, names, answer) {
    noLose = false
    NOTHING = "black"
    WRONG_PLACE = "white"
    RIGHT_PLACE = "red"
    COLORS = ["blue","yellow","red","white","purple","green"]
    // Checks to see if selected number of colors and columns is valid
    if (cols < 1 || num_colors < 1 || num_colors > 256 || answer.length != cols) {
        return false
    }
    // If num_guesses is less than 1 it will be a version where there is no losing (infinite guesses)
    if (max_guesses < 1) {
        noLose == true
    }
    // Creates a object to store the data for the game
    let obj = {
        "max_guesses" : max_guesses,
        "guess_count" : 0,
        "guess_arr" : [],
        "res_arr" : [],
        "noLose" : noLose,
        "num_colors" : num_colors,
        "cols" : cols,
        "names" : names,
        "answer" : answer
    }
    obj.addGuess = (guess) => {
        isValid = false
        guess.forEach(colorElt => {
            COLORS.forEach(val =>{
                if(colorElt == val){
                    isValid = true
                }
            })
        })
        
        if(!isValid){
            return null
        } else {
            tempAns = []
            obj.answer.forEach(colorNum => {
                tempAns.push(colorNum)
            })
            res = []
            raw = guess.slice()
            obj.guess_arr.push(raw)
            guess_len = guess.length
            // Checks to see if any are right color right place
            for(i = 0; i < guess_len; i++) {
                if(guess[i] == tempAns[i]) {
                    tempAns.splice(i, 1)
                    guess.splice(i, 1)
                    i -= 1
                    guess_len -= 1
                    res.push(RIGHT_PLACE)
                }
            }
            // checks to see if any are right color wrong place
            for(i = 0; i < guess_len; i++) {
                for(j = 0; j < guess_len; j++) {
                    if(guess[i] == tempAns[j]) {
                        tempAns.splice(j, 1)
                        guess.splice(i, 1)
                        i -= 1
                        j = 0
                        guess_len -= 1
                        res.push(WRONG_PLACE)
                    }
                }
            }
            for(i = 0; i < guess_len; i++){
                res.push(NOTHING)
            }
            const shuffledRes = res.sort((a, b) => 0.5 - Math.random());
            obj.res_arr.push(shuffledRes)
            obj.guess_count += 1
            return res
        }
    }
    return obj
}
module.exports.initGame = initGame;

