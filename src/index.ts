import { Client, GatewayIntentBits } from 'discord.js';
import { token } from './environment.js';

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
  if (client.user) {
    
  }
});

// Login to Discord with your client's token
client.login(token);


