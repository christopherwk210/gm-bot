const adminUsage = require('../lib/adminUsage');

module.exports = function(app, bot, dmLog) {
  app.get('//dm', function (req, res) {
    res.send(dmLog);
  });

  app.post('//dm/:userid', function (req, res) {
    let userId;
    let message;
    try {
      userId = req.params.userid;
      message = req.body.message;
    } catch(e) {
      res.status(400).send({
        error: 'Response error'
      });
      return;
    }

    bot.fetchUser(userId).then(user => {
      user.send(message).then(msg => {

        if (dmLog[user.username] !== undefined) {
          dmLog[user.username].message_id = msg.id;
			    dmLog[user.username].new_message = message;
          dmLog[user.username].messages.push({
            user: 'gmbot',
            message: message
          });
        } else {
          dmLog[user.username] = {
            user_id: userId,
            message_id: msg.id,
            new_message: message,
            messages: [
              {
                user: 'gmbot',
                message: message
              }
            ]
          }
        }

        adminUsage.log(req.adminRequest.user, req.adminRequest.time, 'Sent a DM to ' + user.username + ': ' + message);
        res.send({
          success: true
        });
      });
    }, err => {
      console.log(err);
      res.status(500).send({
        error: err
      });
    });
  });
};