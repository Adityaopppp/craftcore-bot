require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("announcement")
    .setDescription("Send the BROKE SMP season announcement"),

  new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Send the BROKE SMP rules"),

  new SlashCommandBuilder()
    .setName("concept")
    .setDescription("Send the BROKE SMP server concept")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("Slash commands registered");
  } catch (err) {
    console.error(err);
  }
})();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "announcement") {
    await interaction.reply({
      content: `📢 **BROKE SMP – NEW SEASON INCOMING** 📢

No riches.  
No handouts.  
Just pure survival.

💀 A fresh world is coming soon  
⛏️ Start from nothing  
🏹 Grind, loot, raid, dominate  
👑 Become the richest in a broke world

📅 **Season start:** Very soon  
Be there at launch or stay broke forever.

Bring your team.  
Trust no one.  
Only the smartest will survive.

🔔 More info dropping soon…`
    });
  }

  if (interaction.commandName === "concept") {
    await interaction.reply({
      content: `💸 **BROKE SMP CONCEPT**

🔐 **Server Type**  
Private SMP → Whitelist only  
Only active players get access

⚙️ **Core Mechanics**  
🩸 Lifesteal → Kill players to gain hearts  
💀 Player Head Drops → Collect PvP trophies  
✨ Infuse Ability → 1 random power at the start  
⚔️ Custom Weapons → Unique PvP meta  
🏪 Player Economy → Trade, sell, dominate

🧭 **Movement & Utilities**  
📍 /tpa → Request teleport to players  
🏠 /home → Set and return to your base  
🚫 No random RTP → Explore manually`
    });
  }

  if (interaction.commandName === "rules") {
    await interaction.reply({
      content: `📜 **BROKE SMP RULES**

🧠 **General**  
• Respect all players and staff  
• No harassment, hate speech, or toxicity  
• No spamming or excessive caps  
• No advertising without permission  

🛡️ **Fair Play**  
• No hacked clients, X-ray, dupes, or exploits  
• No unfair macros or auto-clickers  
• Do not abuse bugs – report them in 🎫〢tickets  

⚔️ **PvP & Griefing**  
• PvP is allowed outside protected zones  
• No griefing player bases  
• No stealing from claims or shops  

💰 **Economy**  
• No scamming in trades  
• Cross-trading (real money ↔ in-game) is banned  
• Price manipulation or exploits = punishment  

👥 **Teams**  
• Max team size: (set your limit)  
• Targeting one player repeatedly with a team is not allowed  

💬 **Discord**  
• Use channels for their correct purpose  
• Follow Discord ToS at all times  
• Staff decisions are final  

⚠️ **Punishments**  
1️⃣ Warning  
2️⃣ Temp mute/kick  
3️⃣ Ban  
Severe violations → Instant ban`
    });
  }
});

client.login(process.env.TOKEN);
