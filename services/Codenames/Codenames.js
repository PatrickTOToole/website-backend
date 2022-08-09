const fs = require('fs')
let wordlist = fs.readFileSync('./wordlist','utf8') 
wordlist = wordlist.split("\n")

wordlist.pop()
class CodenamesGame {
    constructor(numPairs, gridSize){
        this.numPairs = numPairs
        this.gridSize = gridSize
        this.generateConfiguration = () => {
            let numPairs = this.numPairs
            let gridSize = this.gridSize
            let numSlots = gridSize * gridSize - 1
            let remainder = numSlots % numPairs
            let numCivs = 0
            if (remainder != 0){
                numSlots -= remainder
                numCivs += remainder
            }
            numSlots -= numPairs * 2
            numCivs += numPairs * 2
            let slotsPerTeam = numSlots / numPairs
            //assasin
            let ans = ["Assass"]
            for (let civs = 0; civs < numCivs; civs++){
                ans.push("Civ   ")
            }
            for (let teamNum = 1; teamNum <= numPairs; teamNum++){
                for(let slotNum = 0; slotNum < slotsPerTeam; slotNum++){
                    ans.push(`Team ${teamNum}`)
                }
            }
            for (let shuffles = 0; shuffles < 500; shuffles++){
                let idx1 = parseInt(Math.random() * (numSlots + 1))
                let idx2 = parseInt(Math.random() * (numSlots + 1))
                let temp1 = ans[idx1]
                ans[idx1] = ans[idx2]
                ans[idx2] = temp1
            }
            let final = []
            for(let i = 0; i < gridSize; i++){
                final.push([])
                for(let j = 0; j < gridSize; j++){
                    final[i].push(ans[i*gridSize + j])
                }
            }
            return final
            
        }
        this.generateWords = () => {
            let numWords = this.gridSize * this.gridSize
            let words = []
            while(words.length < numWords){
                let idx = parseInt(Math.random() * 400)
                let word = wordlist[idx]
                if (!words.includes(word)) {
                    words.push(word)
                }
            }
            let final = []
            for(let i = 0; i < gridSize; i++){
                final.push([])
                for(let j = 0; j < gridSize; j++){
                    final[i].push(words[i*gridSize + j])
                }
            }
            return final
        }
    }
    
}
let game = new CodenamesGame(2, 5)
console.log(game.generateConfiguration())
console.log(game.generateWords())

module.exports.CodenamesGame = CodenamesGame
