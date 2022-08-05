function validateSession(sessions, sessKey){
    let session = sessions.hasOwnProperty(sessKey)?sessions[sessKey]:null
    if(session && session.TTL < new Date()){
        return true
    }
    return false
}


module.exports.validateSession = validateSession
