const { v4 } = require('uuid');


function verifyJWT() {

}
function createJWT(sessKey){
    return v4()
}
function createSessKey(){
    return v4()
}
function validateUserInput(input) {
    return true
}
module.exports = {
    verifyJWT : verifyJWT,
    createJWT : createJWT,
    validateUserInput : validateUserInput,
    createSessKey : createSessKey
}
