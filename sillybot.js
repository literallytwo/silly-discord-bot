// Import required modules
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder, Collection, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
// Ollama AI library removed (AI commands disabled)
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

// AI threads collection removed (AI commands disabled)

// Active duels state
const activeDuels = new Collection();
const usersInDuel = new Set();

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
    .setName('aicommands')
    .setDescription('Information about removed AI commands'),
        
  new SlashCommandBuilder()
    .setName('holeinmybrain')
    .setDescription('I have a hole in my brain'),
    
  new SlashCommandBuilder()
    .setName('funnyspeak')
    .setDescription('Funny speaking video'),
  
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

  new SlashCommandBuilder()
    .setName('quickfire')
    .setDescription('Challenge another user to a quickfire duel!')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('The user you want to challenge')
        .setRequired(true)),
]
.map(command => command.toJSON());

// Initialize REST API client
const rest = new REST({ version: '10' }).setToken(TOKEN);

// AI functionality removed (Ollama client and getPreferredModel function)

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
    
    case 'aicommands':
      await interaction.reply({
        content: "Discord has recently been taking down many AI bots, especially shapes bots, so to prevent the bot from being taken down, AI commands have been removed.",
        ephemeral: true
      });
      break;
    
    case 'holeinmybrain':
      await interaction.reply('https://cdn.discordapp.com/attachments/1038238583686967428/1346976091599929476/i_have_a_hole_in_my_brain.mp4?ex=67ca24bd&is=67c8d33d&hm=91ddeb881a2a758c16319e594ea8828c7a75eb3e8b45c79148b6ea1cf50a74c2&');
      break;
    
    case 'funnyspeak':
      // Create attachment from the local file
      const videoFile = new AttachmentBuilder('./9f6ea310-b19a-43d1-9e47-579e2175a038_online-video-cutter.com.mp4');
      await interaction.reply({ files: [videoFile] });
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
      let responseText;
  
      if (thing === 'love') {
        responseText = "Baby don't hurt me, don't hurt me";
      } else if (thing === 'this bot') {
        responseText = "a silly one";
      } else if (thing === "bot's status" || thing === "the bot's status") {
        responseText = "Look at my status!";
      } else if (thing.includes('creator')) {
        responseText = "Literally two.... sorry if this is unrelated";
      } else {
        responseText = "¯\\_(ツ)_/¯";
      }
  
      await interaction.reply(responseText);
      break;
      
    case 'quickfire':
      const challenger = interaction.user;
      const opponent = interaction.options.getUser('opponent');
      const duelId = interaction.id; // Unique ID for this duel instance

      if (opponent.bot) {
        return interaction.reply({ content: 'You cannot challenge a bot to a Quickfire duel!', ephemeral: true });
      }
      if (opponent.id === challenger.id) {
        return interaction.reply({ content: 'You cannot challenge yourself to a Quickfire duel!', ephemeral: true });
      }
      if (usersInDuel.has(challenger.id)) {
        return interaction.reply({ content: 'You are already in a duel or have a pending challenge.', ephemeral: true });
      }
      if (usersInDuel.has(opponent.id)) {
        return interaction.reply({ content: `${opponent.username} is already in a duel or has a pending challenge.`, ephemeral: true });
      }

      const acceptButton = new ButtonBuilder()
        .setCustomId(`quickfire_accept_${duelId}`)
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success);
      const denyButton = new ButtonBuilder()
        .setCustomId(`quickfire_deny_${duelId}`)
        .setLabel('Deny')
        .setStyle(ButtonStyle.Danger);

      const challengeRow = new ActionRowBuilder().addComponents(acceptButton, denyButton);

      const challengeMessage = await interaction.reply({
        content: `${opponent}, ${challenger.username} has challenged you to a Quickfire duel! You have 30 seconds to respond.`,
        components: [challengeRow],
        fetchReply: true
      });

      const acceptanceTimeoutId = setTimeout(async () => {
        const currentDuel = activeDuels.get(duelId);
        if (currentDuel && currentDuel.status === 'pending_acceptance') {
          try {
            await challengeMessage.edit({
              content: `The Quickfire duel challenge from ${currentDuel.challengerUser.username} to ${currentDuel.opponentUser.username} has expired as ${currentDuel.opponentUser.username} did not respond.`,
              components: []
            });
          } catch (e) {
            console.error(`Quickfire: Failed to edit message for duel ${duelId} on acceptance timeout:`, e);
          } finally {
            activeDuels.delete(duelId);
            usersInDuel.delete(currentDuel.challengerId);
            usersInDuel.delete(currentDuel.opponentId);
          }
        }
      }, 30000);

      activeDuels.set(duelId, {
        challengerId: challenger.id,
        challengerUser: challenger,
        opponentId: opponent.id,
        opponentUser: opponent,
        status: 'pending_acceptance',
        messageId: challengeMessage.id,
        channelId: interaction.channelId,
        acceptanceTimeout: acceptanceTimeoutId,
        gameTimeout: null,
      });
      usersInDuel.add(challenger.id);
      usersInDuel.add(opponent.id);
      break;
      
    default:
      await interaction.reply({
        content: "Command not found, maybe try refreshing your discord, and if that doesn't work well... i dunno ¯\\_(ツ)_/¯",
        ephemeral: true
      });
  }
});

// Add this new block for button interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('quickfire_')) return;

  const [prefix, action, duelId] = interaction.customId.split('_');
  const duel = activeDuels.get(duelId);

  if (!duel) {
    // Attempt to edit the original message if possible, otherwise just send an ephemeral reply
    try {
        await interaction.update({ content: "This duel is no longer active or has expired.", components: [] });
    } catch (e) {
        // If updating fails (e.g., original message deleted, or interaction already replied to), send ephemeral.
        await interaction.reply({ content: "This duel is no longer active or has expired.", ephemeral: true });
    }
    return;
  }

  const message = await interaction.channel.messages.fetch(duel.messageId).catch(() => null);

  switch (action) {
    case 'accept':
      if (interaction.user.id !== duel.opponentId) {
        return interaction.reply({ content: 'Only the challenged user can accept this duel.', ephemeral: true });
      }
      if (duel.status !== 'pending_acceptance') {
        return interaction.reply({ content: 'This duel can no longer be accepted.', ephemeral: true });
      }

      await interaction.deferUpdate(); // Acknowledge button press first

      clearTimeout(duel.acceptanceTimeout);
      let duelSetupSuccess = false;

      try {
        const fireButton = new ButtonBuilder()
          .setCustomId(`quickfire_fire_${duelId}`)
          .setLabel('🔥 FIRE! 🔥')
          .setStyle(ButtonStyle.Primary);
        const fireRow = new ActionRowBuilder().addComponents(fireButton);
        
        if (message) {
          await message.edit({
            content: `Duel accepted! ${duel.challengerUser.username} vs ${duel.opponentUser.username}!\nFirst to press FIRE wins! You have 5 seconds!⏳`,
            components: [fireRow]
          });
        }

        duel.status = 'active_duel';
        const gameTimeoutId = setTimeout(async () => {
          const currentDuelState = activeDuels.get(duelId);
          if (currentDuelState && currentDuelState.status === 'active_duel') {
            try {
              if (message) { // Re-check message as it might have been initially null
                await message.edit({ 
                  content: `Time's up! ⌛ It's a TIE between ${currentDuelState.challengerUser.username} and ${currentDuelState.opponentUser.username}! Nobody pressed the button.`, 
                  components: [] 
                });
              }
            } catch (e) {
              console.error(`Quickfire: Failed to edit message for duel ${duelId} on game timeout (tie):`, e);
            } finally {
              activeDuels.delete(duelId);
              usersInDuel.delete(currentDuelState.challengerId);
              usersInDuel.delete(currentDuelState.opponentId);
            }
          }
        }, 5000);
        duel.gameTimeout = gameTimeoutId;
        activeDuels.set(duelId, duel); // Update duel in collection
        duelSetupSuccess = true;

      } catch (error) {
        console.error(`Quickfire: Failed to process accept for duel ${duelId}:`, error);
        // Error occurred (likely message.edit), so duel setup failed.
      }

      if (!duelSetupSuccess) {
        // Cleanup if acceptance process failed partway
        activeDuels.delete(duelId);
        usersInDuel.delete(duel.challengerId);
        usersInDuel.delete(duel.opponentId);
        // Optionally, try to inform the user about the failure if possible
        if (message) {
            message.edit({content: "Failed to start the duel due to an error. Please try again.", components: []}).catch(e => console.error("Quickfire: error informing user of accept failure", e));
        } else {
            interaction.followUp({content: "Failed to start the duel due to an error. Please try again.", ephemeral: true }).catch(e => console.error("Quickfire: error following up user of accept failure", e));
        }
      }
      break;

    case 'deny':
      if (duel.status !== 'pending_acceptance') {
        return interaction.reply({ content: 'This duel can no longer be interacted with in this way.', ephemeral: true });
      }

      await interaction.deferUpdate(); // Acknowledge button press first
      clearTimeout(duel.acceptanceTimeout);

      let messageContent;
      let logMessage;

      if (interaction.user.id === duel.opponentId) {
        // Opponent is denying
        messageContent = `${duel.opponentUser.username} has denied the Quickfire duel from ${duel.challengerUser.username}.`;
        logMessage = `Quickfire: Failed to edit message for duel ${duelId} on deny by opponent:`;
      } else if (interaction.user.id === duel.challengerId) {
        // Challenger is "denying" (which means cancelling)
        messageContent = `${duel.challengerUser.username} has cancelled the Quickfire duel challenge to ${duel.opponentUser.username}.`;
        logMessage = `Quickfire: Failed to edit message for duel ${duelId} on cancel by challenger:`;
      } else {
         console.warn(`Quickfire: Unhandled user ${interaction.user.id} tried to deny/cancel duel ${duelId}`);
      }

      // --- Corrected structure for 'deny' case START ---
      if (interaction.user.id !== duel.opponentId && interaction.user.id !== duel.challengerId) {
        return interaction.reply({ content: 'You cannot use this button.', ephemeral: true });
      }
      
      if (duel.status !== 'pending_acceptance') {
        // This message might need to be more generic if the challenger is cancelling an already accepted duel (not possible with current flow)
        return interaction.reply({ content: 'This duel can no longer be interacted with in this way.', ephemeral: true });
      }

      await interaction.deferUpdate(); // Acknowledge button press first
      clearTimeout(duel.acceptanceTimeout);
      
      let finalMessageContent;
      let logContext;

      if (interaction.user.id === duel.opponentId) {
        // Opponent is denying
        finalMessageContent = `${duel.opponentUser.username} has denied the Quickfire duel from ${duel.challengerUser.username}.`;
        logContext = "deny by opponent";
      } else { // Must be duel.challengerId due to the check above
        // Challenger is cancelling
        finalMessageContent = `${duel.challengerUser.username} has cancelled the Quickfire duel challenge to ${duel.opponentUser.username}.`;
        logContext = "cancel by challenger";
      }
      
      try {
        if (message) {
          await message.edit({ 
            content: finalMessageContent,
            components: [] 
          });
        }
      } catch (error) {
        console.error(`Quickfire: Failed to edit message for duel ${duelId} on ${logContext}:`, error);
      } finally {
        activeDuels.delete(duelId);
        usersInDuel.delete(duel.challengerId);
        usersInDuel.delete(duel.opponentId);
      }
      // --- Corrected structure for 'deny' case END ---
      break;

    case 'fire':
      if (interaction.user.id !== duel.challengerId && interaction.user.id !== duel.opponentId) {
        return interaction.reply({ content: 'You are not part of this duel.', ephemeral: true });
      }
      // Defer update early to acknowledge the click immediately
      await interaction.deferUpdate().catch(() => {}); 

      if (duel.status !== 'active_duel') {
        // Duel already finished or timed out, no further action needed from this click
        return; 
      }

      // Critical: Update status immediately to prevent race conditions from multiple clicks
      duel.status = 'finished'; 
      activeDuels.set(duelId, duel); // Persist this status change to the collection
      clearTimeout(duel.gameTimeout); // Clear the game timeout as someone fired

      const winner = interaction.user;
      const loser = (winner.id === duel.challengerId) ? duel.opponentUser : duel.challengerUser;

      try {
        if (message) {
          await message.edit({ 
            content: `🎉 ${winner.username} wins the Quickfire duel against ${loser.username}! 🎉`,
            components: [] 
          });
        }
      } catch (error) {
        console.error(`Quickfire: Failed to edit message for duel ${duelId} on fire (win):`, error);
      } finally {
        // Ensure cleanup happens after a win
        // A short delay might be good here IF there were concerns about message edit propagation
        // but primary cleanup of activeDuels should be quick.
        activeDuels.delete(duelId);
        usersInDuel.delete(duel.challengerId);
        usersInDuel.delete(duel.opponentId);
      }
      break;
  }
  // This existing client.on('messageCreate') should be separate
});

// Monitor messages in AI threads (This was removed, ensure this new handler is separate)
// client.on('messageCreate', async message => { ... });

// Login to Discord with your token
client.login(TOKEN);
