const adminUsage = require('../lib/adminUsage');

module.exports = function(app, bot) {  
  app.post('//text_channel_message/:channelid', function (req, res) {
    let channelId;
    let message;
    try {
      channelId = req.params.channelid;
      message = req.body.message;
    } catch(e) {
      res.status(400).send({
        error: 'Response error'
      });
      return;
    }

    let channels = bot.guilds.find('name','/r/GameMaker').channels.findAll('type', 'text');
    for (let i = 0; i < channels.length; i++) {
      if (channels[i].id === channelId) {
        channels[i].send(message).then(msg => {
          // console.log(msg);
        }, err => console.log(err));

        adminUsage.log(req.adminRequest.user, req.adminRequest.time, 'Sent a message to channel ' + channelId + ': ' + message);
        res.send({
          msg: message
        });
        return;
      }
    }

    res.status(404).send({
      error:'Text channel not found.'
    });
  });
}