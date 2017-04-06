/*
     - Creates a profile of user status by role
     - all lines with 'debug' can be commented our or deleted in live code
        code by ariak
*/

const adkProfile = function(sc) { // server collection - singular!
    let dataBlob = {
        timestamp: Date.now(),
        event: 'profile'
    }
    
    sc.members.forEach(function(e){
        let status = e.presence.status,
            role = e.highestRole.name;
 
        if (dataBlob[status] === undefined){ // expand dataBlob as required
            dataBlob[status] = {};
        }
        if (dataBlob[status][role] === undefined){
            dataBlob[status][role] = 0;
        }
        
        dataBlob[status][role] += 1; // eg. dataBlob.online.admin = 2;
    });

    // [push to DB-server here]
    console.log(dataBlob);      // debug  
}

module.exports.adkProfile = adkProfile;