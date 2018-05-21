/*
     - Creates a profile of user status by role
     - all lines with 'debug' can be commented our or deleted in live code
        code by ariak
*/

module.exports = function(sc, db) { // server collection - singular!
  let dataBlob = {
    timestamp: Date.now(),
    event: 'profile'
  }
  
  sc.members.forEach(function(e) {
    let status = e.presence.status;
    let role = e.highestRole.name;

    if (dataBlob[status] === undefined) { // expand dataBlob as required
      dataBlob[status] = {};
    }
    if (dataBlob[status][role] === undefined) {
      dataBlob[status][role] = 0;
    }
    
    dataBlob[status][role] += 1; // eg. dataBlob.online.admin = 2;
  });

  db.profile.insert(dataBlob, function(err) {
    if (err) {
      console.log('Presence could not be saved to database.');
    } else {
      console.log('Presence profile successfully logged.');
    }
  });
};
