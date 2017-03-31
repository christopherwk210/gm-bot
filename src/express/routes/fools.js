module.exports = function(app, bot, dmLog) {
  app.get('//fools', function (req, res) {
    res.send(dmLog);
  });

  app.post('//fools/:userid', function (req, res) {
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
      user.sendMessage(message).then(msg => {

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

    res.status(404).send({
      error:'User not found.'
    });
  });
};