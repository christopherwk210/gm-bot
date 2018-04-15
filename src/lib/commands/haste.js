//Creates a GML Hastebin link with the provided code.

//Defining variables
let input = message.content.slice(args[0].length + 1); //Remove '!haste' from message
input = input.replace(/\`/g, ''); //Remove all backticks from message
input = input.trim(); //Remove empty lines, in case the user started a new line after the first set of backticks
let user = message.member.user.username; //Fetch user's name

//Create HTTP options
var postOptions = {
  host: 'haste.gmcloud.org',
  path: '/documents',
  port: '80',
  method: 'POST'
};

//Configure request
let postRequest = http.request(postOptions, res => {
  //Encode to UTF8
  res.setEncoding('utf8');

  //Create a callback to retrieve url
  res.on('data', response => {
    //Parse the response for the key
    let key = JSON.parse(response).key;
    message.channel.send('Here\'s your GML hastebin link, ' + user + '\n' + 'http://haste.gmcloud.org/' + key + '.gml'); //Post the hastebin link
  })
});

//Sending Request
postRequest.write(input);
postRequest.end();
