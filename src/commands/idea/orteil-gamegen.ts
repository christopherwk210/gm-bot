// Code copied with permission from: https://orteil.dashnet.org/gamegen
// some small modifications for TypeScript and linter rules; and remove
// unneeded stuff like output formatting and random seeding

// Orteil's tasty Choose function
function C(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// just put the first letter in uppercase yo
function Cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// okay so this whole thing is pretty straightforward and not as fancy and complex as it could have been
let Genres = [];

class Genre {
  name: string[];
  actions: string[];
  things: string[];
  goals: string[];
  constructor(name: string[], actions: string[], things: string[], goals: string[]) {
    this.name = name;
    this.actions = actions;
    this.things = things;
    this.goals = goals;
  }
}

Genres.push(new Genre(
// why so many things in there
// I don't even like FPSs
  ['a shooting game', 'an action game', 'an FPS', 'a horror game'],
  ['kill', 'shoot', 'club', 'murder', 'stab', 'chop up', 'wrestle', 'kick', 'punch', 'slap', 'destroy', 'blow up', 'eradicate',
  'begrudgingly join forces with', 'ally with', 'team up with', 'interrogate', 'do science on', 'use your powers on', 'save',
  'ride horses with', 'drive cars with', 'drive tanks with', 'drive trucks with', 'ride bikes with', 'have been contracted to kill',
  'assassinate', 'rob', 'bribe', 'hunt', 'poison', 'motivate', 'work on the self-esteem of', 'feel bad for', 'cheer up',
  'go on a heist with', 'pilot spaceships with', 'listen to', 'hijack', 'goof around with', 'run after', 'smuggle', 'defeat',
  'beat up', 'date', 'save the world from', 'time travel with', 'go back in time to kill', 'shout at', 'point your gun at',
  'commit war crimes with', 'freeze', 'burn'],
  ['cars', 'cops', 'the police', 'the CIA', 'the president', 'thugs', 'criminals', 'gangsters', 'war criminals', 'helicopters', 'jeeps',
  'superheroes', 'detectives', 'villains', 'monsters', 'babies', 'random people', 'civilians', 'innocent people', 'prisoners',
  'explosions', 'bankers', 'space people', 'puppies', 'kittens', 'sharks', 'bears', 'gorillas', 'city guards', 'ninjas', 'knights',
  'spies', 'soldiers', 'barbarians', 'aliens', 'rappers', 'conspiracy theorists', 'clowns', 'evil AIs', 'butlers', 'giant robots',
  'war robots', 'crowbars', 'cosmonauts', 'extra-dimensional entities', 'ascended beings', 'demi-gods', 'wizards', 'cavemen', 'apes',
  'mutants', 'zombies', 'mutant zombies', 'robots', 'robot zombies', 'mutant zombie robots', 'nazis', 'zombie nazis', 'robot nazis',
  'zombie ghosts', 'cyborgs', 'hippies', 'terrorists', 'scientists', 'researchers', 'fashion designers', 'jazz singers', 'dinosaurs',
  'giant crabs', 'cute girls', 'hot boys', 'famous people', 'mascots', 'your long-lost relatives', 'asteroids', 'the forces of good',
  'the forces of evil'],
  ['to make dollah', 'to get big', 'to make a name for yourself', 'to save the world', 'to save the universe',
  'to investigate a conspiracy', 'to prevent an evil plot', 'to solve mysteries', 'to make them pay', 'because they looked at you weird',
  '(that\'ll show them)', 'to get your revenge', 'to avenge your girlfriend', 'to become the next big thing', 'to be a bad enough dude',
  'to unlock achievements', 'for achievements', 'in outer space', 'in a black hole', 'in the future', 'in the not-so-distant future',
  'in the third world', 'in the 40s', 'in the 50s', 'in the 70s', 'in the 90s', 'in the year 3000', 'in the year 10,000', 'in the \'nads',
  'in Russia', 'in Europe', 'in China', 'in North Korea', 'in South Africa', 'in America', 'in Australia', 'on Mars', 'on the Moon',
  'after landing on a mysterious planet', 'in a frozen wasteland', 'in the desert', 'underwater', 'in an abandoned facility',
  'inside a gigantic terrarium', 'in a single closed room', 'in a graveyard', 'in a junkyard', 'in the cyberspace', 'in a wizard tower',
  'in a network of underground bunkers', 'in a laboratory', 'in a secret research facility', 'in a lush grassland',
  'while stranded on an island', 'on an uncharted island', 'in an empty school', 'in a historical monument', 'in hilarious locations',
  'on the set of a movie', 'until the sequel', 'to find love', 'to impress your date', 'for freedom', 'for liberty',
  'because it\'s the right thing to do', 'because, I mean, why the hell not', '(don\'t question it)', 'and you have to find out why',
  'and the reason why becomes less and less obvious throughout the game', 'to accelerate global warming', 'to slow global warming',
  'because aliens', 'because Hitler', 'and go back in time', 'TO THE MAX', 'TO THE EXTREME', '(with day 1 DLC)', 'in a sandbox world',
  'and also it\'s kind of a dating sim', 'and you have to be stealthy and stuff', 'with kill-streak bonuses', 'but then skeletons',
  'but you have no arms', 'except halfway through you realize you\'re really not all that important to the plot',
  'but you don\'t play a big role in the story so you can actually do pretty much whatever you want', 'and your sidekick is a bird',
  'with a snarky sidekick', 'with a passive-aggressive sidekick', 'with a slightly racist sidekick', 'and your sidekick is the bad guy',
  'except you\'re the sidekick', 'with a shape-shifting sidekick', 'with too many sidekicks', 'and everyone in the game hates you',
  'and you have superpowers', 'with gigantic boss battles', '(it gets weirder)', '(it gets very dark very fast)',
  '(it\'s pretty light-hearted)', '(also, sports)', 'and also you are a bear', 'and you can\'t stop running',
  'but you keep randomly teleporting', 'except the game keeps messing around with your perception', 'except you\'re 3 years old',
  'but you\'re an old person', 'until you feel regret', 'and you can\'t stop gaining powers', 'but you keep jumping forward in time',
  'but bees are trying to stop you', 'with the addition of zombies', 'and everybody\'s a robot', 'but there are no humans',
  'and you\'re the last of your kind', 'but only a handful of people remain', 'with other survivors',
  'and magic has returned to the world', 'and you\'re a wacky animal', 'and you have way more limbs than necessary',
  'and you\'re a spider', 'and you can summon your spirit animal', 'but it\'s all explained in the end', 'and it never ends',
  'and you gotta go fast', 'as slowly as possible', 'and it\'s totally adorable', 'and it\'s scary as hell', 'and you\'re all alone',
  'and everybody\'s afraid of you', 'with lots of customization', 'and your only weapon is mini-nukes',
  'but everything you touch explodes', 'and everything you touch turns into more enemies', 'and your arms are chainsaws',
  'and also you are a bird', 'and you\'re an unfrozen caveman', 'and you\'re also an ancient wizard',
  'but the bad guy was just trying to help you', 'except you\'re really unlucky', 'and you have superhuman luck',
  'except you\'re one of the bad guys', 'like in the movie', 'and the name and biography of everybody you kill is displayed onscreen',
  'and corpses don\'t disappear', 'and you can use the corpses in creative ways', 'during the apocalypse', 'before the apocalypse',
  'after the apocalypse', 'until the end of the world', 'and you steal the powers of your defeated enemies',
  'and you have the power to become famous at will', 'and you can erect walls at will', 'and also you have telepathic powers',
  'and you have stretchy powers', 'but you\'re composed of tiny critters', 'and the bad guy is constantly stalking you wherever you go',
  'and there\'s a terrifying monster slowly making its way towards you during the whole game', 'and you only have a few minutes to live',
  'while looking absolutely fantastic', 'and you keep jumping through windows', 'and you can\'t stop breaking stuff',
  'but you kill the people you try to help', 'but you\'re a ghost', 'and you\'re a cyborg', 'and you\'re addicted to robot implants',
  'with unpredictable powers', 'while setting fire to stuff', 'and you hate every single minute of it', '- legally',
  'to stop a meteorite', 'for world peace', 'with fire', 'with guns', 'until the universe explodes', 'until you die',
  'until you\'re the last person alive', 'non-violently']
));

Genres.push(new Genre(
  ['a tycoon game', 'a sim game', 'a simulation game', 'a god game'],
  ['manage', 'sell', 'buy', 'trade', 'reticulate', 'drag and drop', 'displace', 'mutate', 'splice', 'mix-and-match', 'build', 'customize',
  'herd', 'terraform', 'regulate', 'plop down', 'create', 'make', 'invent', 'grow', 'piece together', 'hatch', 'raise', 'farm',
  'write about', 'draw', 'distribute', 'craft', 'compile', 'solve', 'monetize', 'design', 'mix', 'experiment on', 'experiment with',
  'copy-paste', 'organize', 'dress up', 'train', 'breed', 'feed', 'grow', 'grow stuff on', 'cure', 'heal', 'fix', 'tame'],
  ['trees', 'people', 'humans', 'creatures', 'monsters', 'customers', 'animals', 'plants', 'birds', 'fish', 'cats', 'dogs', 'horses',
  'ants', 'bees', 'monkeys', 'squids', 'livestock', 'aquariums', 'stockbrokers', 'farms', 'crops', 'towns', 'cities', 'countries',
  'charts', 'businesses', 'railroads', 'vehicles', 'ecosystems', 'food chains', 'solar systems', 'universes', 'nested universes',
  'timelines', 'nested timelines', 'sport teams', 'babies', 'hospitals', 'schools', 'restaurants', 'police stations', 'trains',
  'airplanes', 'roads', 'resources', 'furniture', 'tasks', 'family members', 'chores', 'industries', 'islands', 'limbs', 'genetics',
  'DNA', 'nukes', 'various biomes'],
  ['to make money', 'to save the environment', 'to make everybody happy', 'to become successful', 'to score happiness points',
  'to score karma', 'to establish your brand', 'to dominate the market', 'to create a sprawling industry', 'to make a business',
  'until you\'re bored', 'ad infinitum', 'ad nauseam', 'until you run out of funds', 'until you own everything',
  'and you have infinite money', 'and the sky isn\'t even the limit']
));

Genres.push(new Genre(
  ['a strategy game', 'a turn-based strategy game', 'a real-time strategy game',
  'a war game', 'a god game'], // both this and the previous one can be god games
  ['go to war with', 'wage war on', 'unite', 'lead', 'build', 'destroy', 'conquer', 'invade', 'colonize', 'discover', 'explore',
  'trade with', 'bomb', 'nuke', 'lead the rebels in', 'make peace with', 'investigate', 'rename', 'collect gold from',
  'collect crystals from', 'mine ore from'],
  ['countries', 'nations', 'planets', 'spaceships', 'castles', 'cities', 'space cities', 'strongholds', 'towers', 'dungeons', 'citadels',
  'kingdoms', 'abandoned towns', 'cloud cities', 'moving cities', 'underwater cities', 'unknown worlds', 'other worlds', 'parallel worlds',
  'other dimensions', 'alien worlds', 'heaven', 'hell', 'mythological places', 'historical places', 'islands', 'sanctuaries', 'temples',
  'ruins', 'factories', 'caves'],
  ['with a few armed men', 'with uncountable legions', 'starting from a small group of settlers', 'starting from a small tribe',
  'starting from nothing', 'using the nuclear power', 'using diplomacy', 'through commerce', 'using science',
  'using an expansive technology tree', 'through cultural superiority', 'through religion', 'through infiltration', 'through terrorism',
  'with nuclear warfare', 'with bio-terrorism', 'with forbidden experiments', 'with love', 'with friendship', 'through naval warfare',
  'with stealth', 'using advanced tactics', 'with clones', 'with mutated animals', 'with cow-boys', 'with robots', 'with monsters',
  'with businessmen', 'with mutants', 'with cyborgs', 'with tanks', 'with gunpowder', 'while spawning minions', 'by changing the terrain',
  'by gaining god points', 'for victory', 'for glory', 'in the name of love', 'to live forever', 'to become the ruler of the world',
  'to form an invincible empire', 'over a few thousand years', 'through several campaigns', 'before the end of the world',
  'to prevent the end of the world', 'but you lead the forces of evil', 'and you lead an army of insectoids',
  'but you have limited control', 'and you have god-like powers', 'and you can create miracles and curses', 'until you own everything']
));

Genres.push(new Genre(
  ['a puzzle game', 'an arcade game', 'a social media game', 'a mobile game', 'a browser game', 'an online game'],
  ['align', 'click on', 'match', 'throw', 'toss', 'fire pellets at', 'control', 'touch', 'stack', 'guess', 'memorize', 'rotate', 'swap',
  'slide', 'avoid', 'drag and drop', 'tickle', 'race', 'challenge', 'collect', 'draw', 'unlock', 'cook', 'break',
  'solve puzzles involving', 'collect', 'juggle'],
  ['gems', 'diamonds', 'gold nuggets', 'bricks', 'bubbles', 'squares', 'triangles', 'treasure', 'blobs', 'kitchen appliances',
  'nondescript fruits', 'animals', 'birds', 'baby animals', 'farm animals', 'exotic fruits', 'sentient plants', 'your friends',
  'shapes', 'jewels', 'letters', 'words', 'numbers', 'tokens', 'coins', 'eggs', 'hats', 'candy', 'chocolate', 'shoes', 'clothing items',
  'princesses', 'blocks', 'cubes', 'asteroids', 'stars', 'balls', 'spheres', 'magnets', 'riddles'],
  ['to win points', 'to reach the highscore', 'to make virtual money', 'to buy virtual items', 'for the mega-bonus',
  'to unlock bonus items', 'to earn tokens', 'to unlock the next level', 'with your friends', 'and buy extra content with real money',
  'by answering questions', 'under the time limit', 'and you can customize your character', 'and you can customize your house']
));

Genres.push(new Genre(
  ['an adventure game', 'a role-playing game', 'an MMO'],
  ['slay', 'battle', 'vanquish', 'challenge', 'defeat', 'save the world with', 'banish', 'enslave', 'free', 'resurrect', 'meet', 'annoy',
  'run away from', 'hide from', 'chase', 'encounter', 'must find', 'save the world from', 'must obtain collectible', 'go to school with',
  'go to war with', 'retrieve holy artifacts with', 'hang out with', 'learn from', 'explore dungeons with', 'explore dungeons full of'],
  ['dragons', 'goblins', 'orcs', 'unicorns', 'monsters', 'creatures', 'spirits', 'forest spirits', 'ocean spirits', 'spirits of nature',
  'mushrooms', 'turtles', 'knights', 'barbarians', 'town guards', 'ninjas', 'samurais', 'evil wizards', 'dark wizards', 'witches', 'ents',
  'halflings', 'dwarves', 'elves', 'trolls', 'giants', 'gnomes', 'pixies', 'elementals', 'wyrms', 'sky worms', 'sky whales', 'cyclops',
  'bats', 'vampires', 'spider people', 'reptilians', 'hellrats', 'hellhounds', 'shape-shifters', 'werewolves', 'werepigs', 'werefoxes',
  'manbeasts', 'slimes', 'oozes', 'ghosts', 'ghouls', 'spiders', 'bunnies', 'enchanted furniture', 'golems', 'giant monsters',
  'world-spanning abominations', 'eldritch monstrosities', 'wizard kings', 'princes', 'princesses', 'kings', 'queens',
  'princes and princesses', 'kings and queens', 'necromancers', 'heroes', 'legendary warriors', 'paladins', 'bards', 'rangers', 'mages',
  'priests', 'angels', 'demons', 'dinosaurs'],
  ['and explore the world', 'to save the princess', 'in a fantasy world', 'in space', 'in the modern world', 'in the future',
  'in the deepest oceans', 'in the snowy mountains', 'in the lava kingdom', 'in the darkest caves', 'in gigantic strongholds',
  'and collect treasure', 'and collect loot', 'and loot sweet gear', 'to gain levels',
  'to prevent the fabric of reality from unravelling', 'to unravel the fabric of reality', 'to warp spacetime',
  'while balancing your karma', 'while being torn between the forces of good and evil', 'while bards write songs about you', 'on a boat',
  'on an airship', 'on an island', 'to forge the sacred sword', 'to become the king', 'with alchemy', 'with magic',
  'in a wide-open procedural world', 'as the legends foretold', 'and fulfill prophecies', 'because thou must', 'until the level cap',
  'while upgrading your gear', 'and it\'s very grindy']
));

Genres.push(new Genre(
  // anything goes
  // really anything
  // you heard me
  ['an indie game', 'an experimental game', 'a student project', 'an artsy game'],
  ['color', 'paint', 'print', 'conceptualize', 'punch', 'explore', 'please', 'dance to', 'dance with', 'associate', 'click on',
  'mindlessly click on', 'browse through', 'navigate', 'choose', 'pick', 'criticize', 'look at', 'stare at', 'watch', 'type', 'listen to',
  'sing to', 'recognize', 'defy', 'find', 'run away from', 'hide from', 'target', 'win', 'lose', 'generate', 'randomize', 'jump on',
  'bounce on', 'gravitate around', 'step on', 'stomp on', 'comment on', 'blog about', 'discuss', 'repeat', 'toggle', 'scroll',
  'party with', 'bury', 'excavate', 'mine', 'acknowledge', 'downvote', 'notice', 'understand', 'misunderstand', 'blur', 'startle', 'shave',
  'haunt', 'taunt', 'ostracize', 'seduce', 'touch', 'fondle', 'befriend', 'fight', 'analyze', 'overanalyze', 'deconstruct', 'break down',
  'roll around', 'vote for', 'spend a rad time with', 'grow a beard with', 'fatten', 'embiggen', 'shrink', 'discover the beauty of',
  'rethink game mechanics with', 'reattach bits of', 'miss', 'wander around a world without',
  'wander in a world where everybody turned into', 'wander in search of', 'learn to love', 'fall in love with',
  'experience the clumsiness of', 'suffer the mockery of', 'link', 'share', 'rank', 'fold', 'craft', 'knit', 'make movies with',
  'write songs with', 'write poetry with', 'make music with', 'tickle', 'shrug at', 'photograph', 'breastfeed', 'gamify', 'rewrite',
  'rethink', 'think about', 'reinvent', 'procedurally generate', 'stop breathing if you don\'t hug',
  'stop breathing if you don\'t destroy', 'stop breathing if you don\'t find', 'hug', 'kiss', 'mingle with', 'learn to accept'],
  ['blocks', 'cubes', 'random worlds', 'procedurally-generated worlds', 'text', '3D models', 'sound samples', 'bitmaps', 'the presidency',
  'the government', 'the end of the world', 'conspiracy theories', 'secret societies', 'alternative lifestyles', 'drug laws',
  'the human condition', 'gravity', 'religion', 'religious figures', 'nuns', 'tall dark strangers', 'dark and stormy nights', 'clichés',
  'politics', 'society', 'art', 'literature', 'spelling mistakes', 'sports', 'history', 'global economics', 'the economy', 'death penalty',
  'social issues', 'stem cells', 'fetuses', 'education', 'pointless wars', 'websites', 'random pictures of random people', 'pictures',
  'videos', 'fanfic', 'essays', 'appliances', 'parameters', 'sliders', 'music', 'paradoxes', 'brains', 'souls', 'your soul', 'your family',
  'your subconscious', 'yourself', 'me', 'rocks', 'pebbles', 'tunnels', 'mountains', 'forests', 'the ocean', 'the sky', 'the world',
  'statues', 'things that look like you', 'insects', 'evolving creatures', 'DNA', 'organisms', 'chromosomes', 'colors', 'walls', 'doors',
  'windows', 'magic cards', 'ropes', 'cupboards', 'books', 'encyclopedias', 'natural disasters', 'controversial topics', 'ingredients',
  'music notes', 'pixels', 'jokes', 'puns', 'your sense of self-worth', 'ideas', 'concepts', 'things', 'the universe', 'individual atoms',
  'the human body', 'moustaches', 'lists', 'game mechanics', 'allegories', 'metaphors', 'similes', 'symbols', 'maths', 'equations',
  'social norms', 'gender roles', 'privileges', 'pregnancy', 'your phobias', 'awkwardness', 'the Internet', 'internet memes', 'artists',
  'musicians', 'goths', 'emo kids', 'hipsters', 'autism', 'the elderly', 'photographs', 'food', 'flowers', 'clouds', 'clams', 'slugs',
  'snails', 'black holes', 'bread', 'deities', 'gods', 'portals', 'the wind', 'dead bodies', 'the very fabric of reality', 'dreams',
  'pop songs', 'regular expressions', 'the developer', 'sarcasm', 'the 4th wall', 'emotions', 'feelings', 'familiar sounds',
  'familiar scents', 'the fundamental laws of the universe', 'the laws of physics', 'achievements', 'procrastination', 'lateral thought',
  'boredom', 'depression', 'relationships', 'love', 'loneliness', 'celebrities', 'bloggers', 'game designers', 'nature', 'civilization',
  'philosophy', 'life', 'absolutely everything', 'everybody', 'everything you cross', 'anything you want', 'something else',
  'something different'],
  ['using your webcam', 'using your printer', '- but like, it\'s totally atmospheric', 'while wearing a top-hat',
  'wearing different costumes', 'in the dark', 'with your eyes closed', 'with 3D glasses', '- but without sound', '- in text form',
  '(there\'s a board game too)', 'for a contest', 'in a deathmatch', 'and it\'s super old-timey', 'and it\'s WAY retro',
  'and it\'s slick and futuristic and stuff', 'in eye-popping 3D', 'while holding your breath', 'without blinking', 'with violence',
  'for fun', 'in alphabetical order', 'in new exciting ways', 'any way you want', 'over the course of a year', 'over several decades',
  'through the seasons', 'while collecting them all', 'to work on your self-esteem', 'with no interactivity whatsoever',
  'through the internet', 'in realtime', 'with geolocation', '(it\'s not really a game)', 'in binary', 'metaphorically', 'symbolically',
  'repetitively', 'competitively', '(in beta)', 'in front of the whole world', 'and you gradually become beautiful',
  'but you gradually turn into a monster', 'and you control light and darkness', 'and you can summon a variety of animals',
  'and you can create a variety of objects', 'and you have different powers at different times',
  'and everybody in the game speaks in broken english', 'and everybody is voiced by other players currently playing the game',
  'and you play on the same world as everyone else', 'and near the end you ascend to godhood', 'and gravity doesn\'t exist',
  'with astrology', 'with maths', 'with geometry', 'with quantum physics', 'and you can escape to other dimensions',
  'and it\'s all procedurally generated', 'with terraforming', 'with the power of baking', 'with a pickaxe', 'with a shovel',
  'with an axe', 'with a magic wand', 'and also you push around blocks', 'while telling jokes', 'but you control the hero indirectly',
  'and you can control everyone in the game indirectly', 'with the power of javascript', 'and you learn a thing or two along the way',
  'and the game won\'t stop scrolling', 'by reversing time', 'by controlling the flow of time',
  'by changing the physical properties of things', 'by altering your body', 'by changing the rules of the game', 'from outside the game',
  'by toying with gravity', 'by toying with physics', 'through social engineering', 'with meta game mechanics', 'ironically',
  'unironically', 'randomly', 'with occasional jump-scares', 'and the game is stupidly linear', 'and you do that with only one button',
  'but the controls are ridiculously difficult', 'and the graphics upgrade as you play', 'and the music gets progressively worse',
  'and there\'s a laughtrack', 'and there\'s an audience that reacts to your actions', 'but you\'re the clumsiest person ever',
  'and the sound effects are gameplay hints', 'and the gameplay changes depending on when you\'re playing it',
  'and the gameplay changes depending on where you\'re playing it', 'and the gameplay depends on the time of the day',
  'and the game reacts differently to how you play it', 'and the game reacts differently depending on who plays it',
  'and it\'s sort of a parody', '- or so it seems', '- with a twist', 'except it\'s all a dream', '(it gets pretty meta)',
  '(it gets kinda self-referential)', '(and it\'s also a commentary on video games as a media)', 'because of social differences',
  'to win the game', 'but doing so loses the game', 'or whatever']
));

// everything
let allNames = [];
let allActions = [];
let allThings = [];
let allGoals = [];

for (let i in Genres) {
  if (typeof Genres[i] === 'function') continue;
  allNames = allNames.concat(Genres[i].name);
  allActions = allActions.concat(Genres[i].actions);
  allThings = allThings.concat(Genres[i].things);
  allGoals = allGoals.concat(Genres[i].goals);
}

export function generate(insane: boolean = false): string {
  let genre = C(Genres);
  let str = '';
  if (!insane) {
    str = `${C(genre.name)} where you ${C(genre.actions)} ${C(genre.things)} ${C(genre.goals)}.`;
  } else {
    str = `${C(allNames)} where you ${C(allActions)} ${C(allThings)} ${C(allGoals)}.`;
  }

  return Cap(str);
}
