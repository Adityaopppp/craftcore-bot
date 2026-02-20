const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const TOKEN = process.env.TOKEN;

const CLIENT_ID = "1474339337314504765";
const GUILD_ID = "1473604442757664861";

const OWNER_ROLE = "1473607783768133758";
const MEMBER_ROLE = "1473608415921049754";
const TRANSCRIPT_CHANNEL = "1473606037587361895";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Register slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName("welcome")
      .setDescription("Send the welcome message here"),

    new SlashCommandBuilder()
      .setName("panel")
      .setDescription("Send ticket panel in this channel"),
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
});

client.on("guildMemberAdd", async (member) => {
  const role = member.guild.roles.cache.get(MEMBER_ROLE);
  if (role) member.roles.add(role);
});

client.on("interactionCreate", async (interaction) => {

  // 🔹 SLASH COMMANDS
  if (interaction.isChatInputCommand()) {

    if (!interaction.member.roles.cache.has(OWNER_ROLE)) {
      return interaction.reply({ content: "❌ Only Owner can use this.", ephemeral: true });
    }

    if (interaction.commandName === "welcome") {
      await interaction.channel.send(
        `🧱 Welcome to CraftCore Setups, ${interaction.user}!\n\nWe build professional Discord servers for:\n🎮 Minecraft SMP\n🌐 Communities\n🏆 Esports Teams`
      );

      return interaction.reply({ content: "✅ Welcome message sent.", ephemeral: true });
    }

    if (interaction.commandName === "panel") {

      const menu = new StringSelectMenuBuilder()
        .setCustomId("service_select")
        .setPlaceholder("Select the service you want")
        .addOptions([
          { label: "Minecraft SMP Setup", value: "smp" },
          { label: "Community Server", value: "community" },
          { label: "Esports Server", value: "esports" },
          { label: "Custom Setup", value: "custom" },
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.channel.send({
        content: "📩 Select a service to open a ticket:",
        components: [row],
      });

      return interaction.reply({ content: "✅ Panel sent.", ephemeral: true });
    }
  }

  // 🔹 TICKET CREATE
  if (interaction.isStringSelectMenu() && interaction.customId === "service_select") {

    const service = interaction.values[0];

    const ticket = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: OWNER_ROLE,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
      ],
    });

    const closeBtn = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeBtn);

    ticket.send({
      content: `👋 Hello ${interaction.user}\nService: **${service}**\nPlease wait for the Owner to respond.`,
      components: [row],
    });

    interaction.reply({ content: `✅ Ticket created: ${ticket}`, ephemeral: true });
  }

  // 🔹 CLOSE TICKET
  if (interaction.isButton() && interaction.customId === "close_ticket") {

    if (!interaction.member.roles.cache.has(OWNER_ROLE)) {
      return interaction.reply({ content: "❌ Only Owner can close tickets.", ephemeral: true });
    }

    const messages = await interaction.channel.messages.fetch({ limit: 100 });

    let transcript = messages
      .map(m => `${m.author.tag}: ${m.content}`)
      .reverse()
      .join("\n");

    const logChannel = interaction.guild.channels.cache.get(TRANSCRIPT_CHANNEL);

    if (logChannel) {
      logChannel.send({
        content: `📄 Transcript from ${interaction.channel.name}\n\`\`\`\n${transcript}\n\`\`\``,
      });
    }

    await interaction.channel.delete();
  }

});

client.login(TOKEN);