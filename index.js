const Keyv = require('keyv');
const keyv = new Keyv(); // for in-memory storage

// Require the necessary discord.js classes
const { Client, Intents, Guild, Message, GuildInviteManager } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

const aliveRoleID = '924381863097810984';
const deadRoleID = '924382017309769758';
const operatorRoleID = '924480256302260224';
const gameVoiceChatId = '924226243006713866';

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'new-game') {

    const theOneTextChatId = await keyv.get('TheOneChannel');
    if (theOneTextChatId !== undefined) {
      const theOneTextChat = await client.channels.fetch(theOneTextChatId);
      await theOneTextChat.delete();
    }

    if (!interaction.member.roles.cache.has(operatorRoleID)) return interaction.reply(`Only an Operator can run this command.`);

    const channelGameVoice = await client.channels.fetch(gameVoiceChatId);
    if (channelGameVoice.members.size < 4) return interaction.reply(`you need at least 4 players in the voice channel 'game chat'`);

    const name = interaction.options.getString('name');

    await keyv.clear();
    await keyv.set('name', name);
    await keyv.set('round', 1);
    await keyv.set('part', 'night');

    const ids = [];
    for (const member of channelGameVoice.members) {
      const guildMember = member[1];

      try {
        guildMember.roles.remove(deadRoleID);
      } catch (_) {}
      try {
        guildMember.roles.remove(theOneRoleID);
      } catch (_) {}
      guildMember.roles.add(aliveRoleID)

      const id = guildMember.id;
      await keyv.set(id, {
        name: guildMember.user.username,
        status: 'alive',
        vote: null,
      });
      ids.push(id);
    }
    await keyv.set('ids', ids);

    const theOneIx = Math.floor(Math.random() * ids.length);
    const theOneId = ids[theOneIx];
    await keyv.set('TheOne', theOneId);

    const theOneChannel = await interaction.guild.channels.create('theone', {type: 'text'});
    await keyv.set('TheOneChannel', theOneChannel.id);
    console.log('theOneId', theOneId);
    await theOneChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, { VIEW_CHANNEL: false });
    await theOneChannel.permissionOverwrites.edit(theOneId, { VIEW_CHANNEL: true });

    return interaction.reply('TheOne chosen');
  } else if (commandName === 'kill') {

    const part = await keyv.get('part');
    if (part === undefined) return interaction.reply('run /new-game to start a game');
    if (part !== 'night') return interaction.reply(`You cannot kill - It is broad daylight.`);

    const theOneTextChatId = await keyv.get('TheOneChannel');
    if (interaction.channelId !== theOneTextChatId) return interaction.reply(`Can only kill in #TheOne channel`);

    const userId = interaction.user.id;
    const theOneId = await keyv.get('TheOne');
    if (userId !== theOneId) return interaction.reply(`You are not the killer.`);

    const victimUser = interaction.options.getUser('user');
    const victimDbUser = await keyv.get(`${victimUser.id}`);
    if (victimDbUser === undefined) return interaction.reply(`${victimUser.username} is not in the game. They need to join the voice channel 'game-chat' and wait for the next game to start.`);
    if (victimDbUser.status === 'dead') return interaction.reply(`That goes too far - ${victimUser.username} is already dead! - Try someone else.`);
    victimDbUser.status = 'dead';
    await keyv.set(victimUser.id, victimDbUser);

    await keyv.set('part', 'day');

    return interaction.reply('killed :(');
  } else if (commandName === 'vote') {

    const part = await keyv.get('part');
    if (part === undefined) return interaction.reply('run /new-game to start a game');
    if (part !== 'day') return interaction.reply(`You cannot vote - you are unconscious`);

    const userAId = interaction.user.id;
    const userB = interaction.options.getUser('user');
    const userBId = userB.id;
    const dbUserA = await keyv.get(userAId);
    const dbUserB = await keyv.get(userBId);

    if (dbUserA.status !== 'alive') return interaction.reply(`The dead cannot vote.`);
    if (dbUserA === undefined) return interaction.reply(`You are not part of the game. Join the voice channel 'game-chat' and wait for the next game to start.`);
    if (dbUserB === undefined) return interaction.reply(`${userB.username} is not part of this game. They need to join the voice channel 'game-chat' and wait for the next game to start.`);
    if (dbUserB.status === 'dead') return interaction.reply(`rude! ${userB.username} is already dead.`);

    dbUserA.vote = userBId;
    await keyv.set(userAId, dbUserA);

    return interaction.reply('vote registered');
  } else if (commandName === 'tally') {


    const name = await keyv.get('name');
    if (name === undefined) return interaction.reply('run /new-game to start a game');

    const a = [];
    a.push(`You are in game ${name}`);

    const round = await keyv.get('round');
    a.push(`round: ${round}`);

    const part = await keyv.get('part');
    a.push(`part: ${part}`);

    a.push(`\n`);
    const votes = {};
    const ids = await keyv.get('ids');
    for (const id of ids) {
      const user = await keyv.get(id);

      if (user.vote !== null) {
        if (id in votes) votes[id] += 1;
        else votes[id] = 1;
      }

      const votee = user.vote === null ? '<nobody yet>' : (await keyv.get(user.vote)).name;
      a.push(`${user.name} is ${user.status} and has voted for ${votee}.`);
    }

    a.push(`\n`);
    for (const id of Object.keys(votes)) {
      const user = await keyv.get(id);
      a.push(`${user.name} has ${votes[id]} votes.`);
    }

    a.push(`\n`);
    a.push(`TheOne: OneOfUs ;)`);

    const s = a.join('\n');
    return interaction.reply(s);
  } else if (commandName === 'voting-done') {

    if (!interaction.member.roles.cache.has(operatorRoleID)) return interaction.reply(`Only an Operator can run this command.`);

    const part = await keyv.get('part');
    if (part === undefined) return interaction.reply('run /new-game to start a game');
    if (part !== 'day') return interaction.reply(`Voting only happens during the day!`);

    const stillNeedToVote = [];

    let numAlive = 0;
    const votes = {};
    const ids = await keyv.get('ids');
    for (const id of ids) {
      const user = await keyv.get(id);
      if (user.status === 'alive') numAlive += 1;
      if (user.vote === null) stillNeedToVote.push(user.name);
      else {
        if (id in votes) votes[id] += 1;
        else votes[id] = 1;
      }
    }
    if (0 < stillNeedToVote.length) return interaction.reply(`These still need to vote: ${stillNeedToVote}`);

    const a = [];

    let maxVotes = 0;
    let maxVotesId = null;
    let maxVotesUnique = true;

    for (const id of Object.keys(votes)) {
      const user = await keyv.get(id);

      if (maxVotes < votes[id]) {
        maxVotes = votes[id];
        maxVotesId = id;
      }
      else if (maxVotes === votes[id]) {
        maxVotesUnique = false;
      }

      a.push(`${user.name} has ${votes[id]} votes.`);
    }

    a.push(`\n`);
    if (!maxVotesUnique) a.push(`Tie`);
    else {
      const maxVoteUser = await keyv.get(maxVotesId);
      a.push(`Voting out ${maxVoteUser.name}`);
      maxVoteUser.status = 'dead';
      await keyv.set(maxVotesId, maxVoteUser);
      const theOne = await keyv.get('TheOne');
      const rounds = await keyv.get('round');
      if (theOne === maxVotesId) {
        a.push(`\n`);
        a.push(`You got the one!!!!! It was ${theOne.name}`);
        a.push(`It took you ${rounds} rounds`);
        a.push(`--- game end ---`);
        await keyv.set('part', 'done');
      } else if (numAlive < 4) {
        a.push(`\n`);
        a.push(`${theOne.name} is the TheOne and wins after surviving ${rounds} rounds.`);
        a.push(`--- game end ---`);
        await keyv.set('part', 'done');
      } else {
        const newRound = rounds + 1;
        await keyv.set('round', newRound);
        await keyv.set('part', 'night');
      }
    }

    const s = a.join('\n');
    return interaction.reply(s);
  }
});

// Login to Discord with your client's token
client.login(token);