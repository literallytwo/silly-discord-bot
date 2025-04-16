// Import required modules
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder, Collection, ActivityType } = require('discord.js');
const { Ollama } = require('ollama');
const express = require('express');
const path = require('path');
require('dotenv').config();

// Create a new client instance
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

// Bot token from environment variables
const TOKEN = process.env.DISCORD_TOKEN;
// Your application's client ID
const CLIENT_ID = process.env.CLIENT_ID;

// Store active AI threads
const aiThreads = new Collection();

// Current bot status
let currentStatus = {
    status: 'green',
    message: ''
};

// Create Express app
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
app.get('/api/status', (req, res) => {
    res.json(currentStatus);
});

app.post('/api/status', (req, res) => {
    const { status, message } = req.body;
    if (['green', 'orange', 'red', 'hacked'].includes(status)) {
        currentStatus = { status, message };
        updateBotStatus();
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, error: 'Invalid status' });
    }
});

// Function to update bot's rich presence
function updateBotStatus() {
    const statusEmojis = {
        'green': '🟢',
        'orange': '🟠',
        'red': '🔴',
        'hacked': '❗'
    };

    const statusDescriptions = {
        'green': 'Online',
        'orange': 'Unstable',
        'red': 'Offline',
        'hacked': 'Hacked'
    };

    const statusText = currentStatus.message 
        ? `${statusEmojis[currentStatus.status]} ${currentStatus.message}`
        : `${statusEmojis[currentStatus.status]} ${statusDescriptions[currentStatus.status]}`;

    client.user.setPresence({
        activities: [{
            type: ActivityType.Custom,
            name: statusText
        }]
    });
}

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Status control UI available at http://localhost:${PORT}`);
});

// Define sigma user IDs
const sigmaIds = ['863963856220454943', '694587798598058004'];

// Collection of silly responses
const sillyResponses = [
  "Did you know that bananas are berries but strawberries aren't?",
  "Fun fact: A group of flamingos is called a 'flamboyance'!",
  "According to all known laws of aviation, there is no way a bee should be able to fly...",
  "Wombats produce cube-shaped poop. That's neat!",
  "In Switzerland, it's illegal to own just one guinea pig because they get lonely.",
  "Cows have best friends and get stressed when they're separated!",
  "Octopuses have three hearts, nine brains, and blue blood!",
  "A day on Venus is longer than a year on Venus!",
  "The hashtag symbol is technically called an octothorpe.",
  "Elephants can't jump!"
];

// Collection of jokes
const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "What do you call fake spaghetti? An impasta!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "Why don't eggs tell jokes? They'd crack each other up!",
  "What's the best thing about Switzerland? I don't know, but the flag is a big plus!",
  "How do you organize a space party? You planet!",
  "Why did the bicycle fall over? It was two tired!",
  "What did one wall say to the other wall? I'll meet you at the corner!",
  "What did the ocean say to the beach? Nothing, it just waved!",
  "Why don't skeletons fight each other? They don't have the guts!"
];

// Define slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('silly')
    .setDescription('Get a random silly fact'),
  
  new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tell me a silly joke'),
  
  new SlashCommandBuilder()
    .setName('flip')
    .setDescription('Flip a coin'),
  
  new SlashCommandBuilder()
    .setName('mock')
    .setDescription('Mock text in SpOnGeBoB cAsE')
    .addStringOption(option => 
      option.setName('text')
        .setDescription('The text to mock')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('dance')
    .setDescription('Do a silly dance'),
  
  new SlashCommandBuilder()
    .setName('uwuify')
    .setDescription('UwU-ify your text')
    .addStringOption(option => 
      option.setName('text')
        .setDescription('The text to uwuify')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('askai')
    .setDescription('Ask the AI a question')
    .addStringOption(option => 
      option.setName('question')
        .setDescription('The question to ask the AI')
        .setRequired(true))
    .addBooleanOption(option => 
      option.setName('private')
        .setDescription('Send the response only to you')
        .setRequired(false)),
        
  new SlashCommandBuilder()
    .setName('holeinmybrain')
    .setDescription('I have a hole in my brain'),
    
  new SlashCommandBuilder()
    .setName('funnyspeak')
    .setDescription('Funny speaking video'),
  
  new SlashCommandBuilder()
    .setName('aithread')
    .setDescription('Create a new thread with an AI that remembers the conversation')
    .addStringOption(option => 
      option.setName('topic')
        .setDescription('The topic of discussion (optional)')
        .setRequired(false)),
  
  new SlashCommandBuilder()
    .setName('amisigma')
    .setDescription('Check if you are sigma'),
  
  new SlashCommandBuilder()
    .setName('amibeta')
    .setDescription('Check if you are beta'),

  new SlashCommandBuilder()
    .setName('statusmeanings')
    .setDescription('Learn what the different status indicators mean'),

  new SlashCommandBuilder()
    .setName('reportissue')
    .setDescription('Get information about reporting issues with the bot'),

  new SlashCommandBuilder()
    .setName('whatis')
    .setDescription('Ask what something is')
    .addStringOption(option => 
      option.setName('thing')
        .setDescription('What do you want to know about?')
        .setRequired(true)),
]
.map(command => command.toJSON());

// Initialize REST API client
const rest = new REST({ version: '10' }).setToken(TOKEN);

// Initialize Ollama client with explicit host
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Function to get the preferred AI model
async function getPreferredModel() {
  try {
    const models = await ollama.list();
    let modelToUse = 'llama3.2:latest'; // Default preference
    
    if (models?.models?.length > 0) {
      const modelNames = models.models.map(m => m.name);
      
      if (!modelNames.includes('llama3.2:latest')) {
        if (modelNames.includes('llama3.1:latest')) {
          modelToUse = 'llama3.1:latest';
        } else if (modelNames.length > 0) {
          modelToUse = modelNames[0];
        }
      }
    }
    
    return modelToUse;
  } catch (error) {
    console.error('Error getting AI models:', error);
    return 'llama3.2:latest'; // Fallback to default if error
  }
}

// Function to convert text to SpOnGeBoB cAsE
function mockText(text) {
  return text.split('').map((char, i) => 
    i % 2 ? char.toLowerCase() : char.toUpperCase()
  ).join('');
}

// Function to UwU-ify text
function uwuify(text) {
  // Emoticons to randomly insert
  const emoticons = [
    ' uwu', ' owo', ' >w<', ' ^w^', ' :3', ' ʕ•ᴥ•ʔ', ' (⑅˘͈ ᵕ ˘͈)', 
    ' (ꈍᴗꈍ)', ' (。U ω U。)', ' (≧◡≦)', ' ☆*:・ﾟ', ' nyaa~', ' rawr x3'
  ];
  
  // More complex word modifiers
  const insertStutter = (word) => {
    if (word.length <= 1 || Math.random() > 0.2) return word;
    return `${word[0]}-${word}`;
  };
  
  const emphasizeWord = (word) => {
    if (Math.random() > 0.3) return word;
    
    // Different emphasis styles
    const styles = [
      w => w.toUpperCase(), // CUTE
      w => {
        // Find vowels and possibly duplicate them
        return w.replace(/[aeiou]/gi, match => {
          return match + (Math.random() > 0.5 ? match.repeat(Math.floor(Math.random() * 3) + 1) : match);
        });
      }, // cuuute
    ];
    
    const style = styles[Math.floor(Math.random() * styles.length)];
    return style(word);
  };
  
  const addEmoticon = () => {
    return Math.random() < 0.25 ? emoticons[Math.floor(Math.random() * emoticons.length)] : '';
  };
  
  // Process text in multiple passes
  
  // 1. Character replacements
  let result = text
    .replace(/r|l/g, 'w')
    .replace(/R|L/g, 'W')
    .replace(/n([aeiou])/g, 'ny$1')
    .replace(/N([AEIOU])/g, 'NY$1')
    .replace(/ove/g, 'uv')
    .replace(/OVE/g, 'UV')
    .replace(/th\b|th\s/g, 'd')
    .replace(/Th\b|TH\b|Th\s|TH\s/g, 'D')
    .replace(/\bth/g, 'f')
    .replace(/\bTh|\bTH/g, 'F')
    .replace(/s([aeiou])/g, 'sh$1')
    .replace(/S([AEIOU])/g, 'Sh$1');
  
  // 2. Process words individually
  const words = result.split(/\b/);
  result = words.map(word => {
    if (word.match(/^\w+$/)) { // Only process actual words, not punctuation
      word = insertStutter(word);
      word = emphasizeWord(word);
      // 10% chance to add a heart mid-word if word is longer than 4 chars
      if (word.length > 4 && Math.random() < 0.1) {
        const pos = Math.floor(word.length / 2);
        word = word.slice(0, pos) + '♥' + word.slice(pos);
      }
    }
    return word;
  }).join('');
  
  // 3. Process at sentence level
  result = result
    .replace(/[.!?]+(\s|$)/g, (match) => {
      // Add random emoticons and sentence endings
      return match + addEmoticon() + (Math.random() < 0.3 ? ' ' + emoticons[Math.floor(Math.random() * emoticons.length)] : '');
    })
    .replace(/!+/g, match => match + '~')
    .replace(/\. /g, '~ ')
    .replace(/\? /g, '? ' + (Math.random() < 0.5 ? 'owo ' : ''));
  
  // 4. Final pass for additional flair
  if (result.length > 10 && Math.random() < 0.3) {
    // 30% chance to add *actions* like *nuzzles* somewhere in the text
    const actions = ['*nuzzles*', '*pounces*', '*blushes*', '*wags tail*', '*purrs*'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const pos = Math.floor(Math.random() * result.length * 0.8); // Not too close to the end
    result = result.slice(0, pos) + ' ' + action + ' ' + result.slice(pos);
  }
  
  // 5. Occasional random kaomoji at the end
  if (Math.random() < 0.4) {
    result += ' ' + emoticons[Math.floor(Math.random() * emoticons.length)];
  }
  
  return result;
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log('The silly bot is online! 🤪');
  updateBotStatus(); // Set initial status
});

// Register slash commands
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Handle interactions (slash commands)
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  switch (commandName) {
    case 'silly':
      const randomResponse = sillyResponses[Math.floor(Math.random() * sillyResponses.length)];
      await interaction.reply(randomResponse);
      break;
    
    case 'joke':
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      await interaction.reply(randomJoke);
      break;
    
    case 'flip':
      const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
      await interaction.reply(`Flipped a coin and got: **${result}**!`);
      break;
    
    case 'mock':
      const textToMock = interaction.options.getString('text');
      await interaction.reply(mockText(textToMock));
      break;
    
    case 'dance':
      const dances = [
        "ᕕ( ᐛ )ᕗ",
        "♪┏(・o･)┛♪┗ ( ･o･) ┓♪",
        "(づ￣ ³￣)づ",
        "ƪ(˘⌣˘)ʃ",
        "ᕕ(⌐■_■)ᕗ ♪♬",
        "~(˘▾˘~)",
        "┌(・◡・)┘♪",
        "ヾ(-_- )ゞ",
        "⁽⁽◝( •௰• )◜⁾⁾",
        "₍₍ ◝(　ﾟ∀ ﾟ )◟ ⁾⁾"
      ];
      const randomDance = dances[Math.floor(Math.random() * dances.length)];
      await interaction.reply(randomDance);
      break;
    
    case 'uwuify':
      const textToUwuify = interaction.options.getString('text');
      await interaction.reply(uwuify(textToUwuify));
      break;
    
    case 'askai':
      const question = interaction.options.getString('question');
      const isPrivate = interaction.options.getBoolean('private') || false;
      
      await interaction.deferReply({ ephemeral: isPrivate });
      
      try {
        const modelToUse = await getPreferredModel();
        
        const response = await ollama.chat({
          model: modelToUse,
          messages: [
            { 
              role: 'user', 
              content: question 
            }
          ]
        });
        
        await interaction.editReply({
          content: response.message.content
        });
      } catch (error) {
        console.error('Error querying Ollama:', error);
        await interaction.editReply({
          content: `The AI got an error, might be a traffic issue since it is ran locally, it may also be that the owner messed something up, so try pinging them if they are in the server, otherwise they might see the error in their logs and fix it.`
        });
      }
      break;
    
    case 'holeinmybrain':
      await interaction.reply('https://cdn.discordapp.com/attachments/1038238583686967428/1346976091599929476/i_have_a_hole_in_my_brain.mp4?ex=67ca24bd&is=67c8d33d&hm=91ddeb881a2a758c16319e594ea8828c7a75eb3e8b45c79148b6ea1cf50a74c2&');
      break;
    
    case 'funnyspeak':
      // Create attachment from the local file
      const videoFile = new AttachmentBuilder('./9f6ea310-b19a-43d1-9e47-579e2175a038_online-video-cutter.com.mp4');
      await interaction.reply({ files: [videoFile] });
      break;
    
    case 'aithread':
      if (interaction.channel.isThread()) {
        return await interaction.reply({
          content: "You cannot create a thread in a thread, that would be threadception! Try in the root channel.",
          ephemeral: true
        });
      }
      
      const topic = interaction.options.getString('topic') || 'AI Chat Thread';
      
      try {
        const thread = await interaction.channel.threads.create({
          name: topic,
          autoArchiveDuration: 60,
          reason: 'AI conversation thread'
        });
        
        const modelToUse = await getPreferredModel();
        
        aiThreads.set(thread.id, {
          modelName: modelToUse,
          messages: [{
            role: 'system',
            content: `You are a helpful AI assistant in a Discord conversation. Be friendly, concise, and informative. You will be speaking with different users in this thread, each user's message will include both their username and nickname so you can address them properly.`
          }]
        });
        
        await thread.send(`This AI thread is now active using the ${modelToUse} model. I'll remember our conversation in this thread. Feel free to ask me anything!\n\n**Note:** This thread will not be saved once the bot restarts, the creator is hard at work to find some sort of alternative to allow this`);
        
        await interaction.reply({
          content: `Created an AI thread with topic: "${topic}"`,
          ephemeral: true
        });
        
      } catch (error) {
        console.error('Error creating AI thread:', error);
        await interaction.reply({
          content: `Sorry, I couldn't create an AI thread.`,
          ephemeral: true
        });
      }
      break;
    
    case 'amisigma':
      // Check if the user's ID is one of the specified sigma IDs
      const sigmauserId = interaction.user.id;
      const isSigma = sigmaIds.includes(sigmauserId);
      
      await interaction.reply({
        content: isSigma ? 'Yes' : 'No'
      });
      break;
    
    case 'amibeta':
      // Inverse of amisigma - check if user is NOT one of the sigma IDs
      const betauserId = interaction.user.id;
      const isBeta = !sigmaIds.includes(betauserId);
      
      await interaction.reply({
        content: isBeta ? 'Yes' : 'No'
      });
      break;
    
    case 'statusmeanings':
      await interaction.reply({
        content: `🟢: Up! though, not 24/7 until creator has found hosting, if this is the status, it will be up from any time after 06:00 GMT, and will most likely be down shortly after midnight (May show temporarily even when the bot goes offline and has no status, running a command with the bot will fix this issue, this applies to orange/unstable too)\n🟠: Is unstable, can be for many reasons, could be electricity issues, maintenance, etc might be a bit unstable to use, like going down randomly but otherwise, same as green\n🔴: Down, could be a power cut, big update, or anything else, this isn't constantly updated so even if the bot is offline, it might still be orange/green, especially for green, as it is not updated if i am not able to (like sleeping) (You will very rarely see this due to the fact that well, if it's offline, then with the new status system, it will not show a status)\n❗: Bot has been hacked (Will probably never be seen already as well, I don't really go out leaking my .env, but if the bot somehow does get hacked, the hacker will probably remove this status anyway, so if you see it, i might just be testing the bot)`,
        ephemeral: true
      });
      break;
    
    case 'reportissue':
      await interaction.reply({
        content: "You can report bugs with the bot at https://github.com/literallytwo/silly-discord-bot/issues, a better system may be created later, but for now you just need a github account",
        ephemeral: true
      });
      break;
    
    case 'whatis':
      const thing = interaction.options.getString('thing').toLowerCase();
      let response;
  
      if (thing === 'love') {
        response = "Baby don't hurt me, don't hurt me";
      } else if (thing === 'this bot') {
        response = "a silly one";
      } else if (thing === "bot's status" || thing === "the bot's status") {
        response = "Look at my status!";
      } else if (thing.includes('creator')) {
        response = "Literally two.... sorry if this is unrelated";
      } else {
        response = "¯\\_(ツ)_/¯";
      }
  
      await interaction.reply(response);
      break;
      
    default:
      await interaction.reply({
        content: "Command not found, maybe try refreshing your discord, and if that doesn't work well... i dunno ¯\\_(ツ)_/¯",
        ephemeral: true
      });
  }
});

// Monitor messages in AI threads
client.on('messageCreate', async message => {
  // Ignore messages from bots, including itself
  if (message.author.bot) return;
  
  // Check if this message is in one of our AI threads
  if (message.channel.isThread() && aiThreads.has(message.channel.id)) {
    // Get the thread data
    const threadData = aiThreads.get(message.channel.id);
    
    // Start "typing" indicator
    message.channel.sendTyping();
    
    try {
      // Add the user's message to history, including username and nickname info
      const userNickname = message.member?.nickname || message.author.username;
      const userIdentifier = `${message.author.username} (${userNickname})`;
      
      threadData.messages.push({
        role: 'user',
        content: `${userIdentifier}: ${message.content}`
      });
      
      // Call Ollama with the updated conversation history
      const response = await ollama.chat({
        model: threadData.modelName,
        messages: threadData.messages
      });
      
      // Add the AI's response to the conversation history
      threadData.messages.push({
        role: 'assistant',
        content: response.message.content
      });
      
      // Update the thread data in our collection
      aiThreads.set(message.channel.id, threadData);
      
      // Send the AI's response
      await message.channel.send(response.message.content);
      
    } catch (error) {
      console.error('Error in AI thread response:', error);
      await message.channel.send(`I'm having trouble thinking right now. Please try again in a moment.`);
    }
  }
});

// Login to Discord with your token
client.login(TOKEN);
